// server.js - Dark Aurora enhanced server for Render (Real-time dashboard + rate-limit + IP block + logs + admin)
// Features: rate-limit, automatic IP blocking, logs, cache, dashboard, admin endpoints to block/unblock IPs
// Protect admin actions with ADMIN_TOKEN env variable (set in Render). Send header 'x-admin-token': ADMIN_TOKEN

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const NodeCache = require('node-cache');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Configuration (env-friendly)
const PORT = process.env.PORT || 3000;
const UPSTREAM_BASE = process.env.UPSTREAM_BASE || 'https://painel-tmim.onrender.com';
const RATE_WINDOW_MS = parseInt(process.env.RATE_WINDOW_MS || '60000'); // 1 minute
const RATE_MAX = parseInt(process.env.RATE_MAX || '120'); // 120 req/min per IP
const SLOW_WINDOW_MS = parseInt(process.env.SLOW_WINDOW_MS || '60000');
const SLOW_DELAY_AFTER = parseInt(process.env.SLOW_DELAY_AFTER || '40');
const SLOW_DELAY_MS = parseInt(process.env.SLOW_DELAY_MS || '200'); // ms per request after threshold
const CACHE_TTL_SEC = parseInt(process.env.CACHE_TTL_SEC || '300');
const LOG_PATH = path.join(__dirname, 'logs', 'log.txt');
const IP_BLOCK_TTL_MS = parseInt(process.env.IP_BLOCK_TTL_MS || String(2 * 60 * 1000)); // 2 minutes
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme'; // set a secure token in production

// Ensure logs dir exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

// create app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

// middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(cors());

// morgan logging to file + console
const accessLogStream = fs.createWriteStream(LOG_PATH, { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// rate limiter & slowdown applied to /api/*
const limiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  max: RATE_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({ error: 'Too many requests. Please slow down.' });
  }
});
const speedLimiter = slowDown({
  windowMs: SLOW_WINDOW_MS,
  delayAfter: SLOW_DELAY_AFTER,
  delayMs: SLOW_DELAY_MS
});
app.use('/api/', limiter);
app.use('/api/', speedLimiter);

// simple in-memory cache (NodeCache)
const cache = new NodeCache({ stdTTL: CACHE_TTL_SEC, checkperiod: 120 });

async function cacheGet(key){ return cache.get(key); }
async function cacheSet(key, value, ttlSec){ cache.set(key, value, ttlSec); return true; }

// blocked IPs store: Map<ip, expiryTimestamp>
const blockedIPs = new Map();
// track stats for dashboard
let totalRequests = 0;
let requestsThisMinute = 0;
let lastMinuteCount = 0;
setInterval(()=>{
  lastMinuteCount = requestsThisMinute;
  requestsThisMinute = 0;
  io.emit('stats', { totalRequests, lastMinuteCount, blocked: Array.from(blockedIPs.keys()) });
}, 60*1000);

// middleware: check blocked IPs
app.use((req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const entry = blockedIPs.get(ip);
  if (entry && Date.now() < entry) {
    return res.status(403).json({ error: 'Your IP is temporarily blocked due to abusive requests.' });
  }
  next();
});

// helper: sanitize input and remove owner watermark
function sanitize(q){
  if(!q && q !== 0) return '';
  return String(q).replace(/[\x00-\x1F\x7F]/g,'').trim().slice(0,250);
}
function cleanOwnerNotice(text){
  if(!text || typeof text !== 'string') return text;
  text = text.replace(/Aviso:.*?Telegram:.*?(?:\r?\n|\r)*/gi, '');
  text = text.replace(/(Aviso: Sou o dono desta API[\s\S]*?)(?=\{|\[|$)/gi, '');
  return text.trim();
}

// helper: fetch with timeout and retries
async function fetchWithTimeout(url, opts={}, timeout=10000, retries=1){
  let lastErr=null;
  for(let i=0;i<=retries;i++){
    try{
      const resp = await axios.get(url, { timeout, ...opts });
      return resp;
    }catch(e){
      lastErr = e;
      await new Promise(r=>setTimeout(r, 150*(i+1)));
    }
  }
  throw lastErr;
}

// simple flood detector: counts requests per IP in short window; if exceeds threshold, block
const shortWindowMs = 10 * 1000; // 10s window to detect bursts
const burstThreshold = 40; // if >40 req in 10s, consider burst
const ipBuckets = new Map(); // ip -> array of timestamps
function recordRequest(ip){
  totalRequests++;
  requestsThisMinute++;
  const now = Date.now();
  if(!ipBuckets.has(ip)) ipBuckets.set(ip, []);
  const arr = ipBuckets.get(ip);
  arr.push(now);
  while(arr.length && (now - arr[0]) > shortWindowMs) arr.shift();
  if(arr.length > burstThreshold){
    blockedIPs.set(ip, Date.now() + IP_BLOCK_TTL_MS);
    ipBuckets.delete(ip);
    const reason = `Auto-blocked ${ip} for burst (${arr.length} req in ${shortWindowMs/1000}s)`;
    const line = `[${new Date().toISOString()}] ${reason}\n`;
    fs.appendFileSync(LOG_PATH, line);
    console.warn(reason);
    return true;
  }
  return false;
}

// apply recordRequest to all API routes
app.use('/api/', (req,res,next)=>{
  const ip = req.ip || req.connection.remoteAddress;
  const blocked = recordRequest(ip);
  if(blocked){
    return res.status(403).json({ error: 'IP temporarily blocked due to sudden burst of requests.' });
  }
  next();
});

// generic proxy factory
function createProxyRoute(pathSuffix, paramName, upstreamPath, cacheTtlSec=300){
  app.get(`/api/${pathSuffix}`, async (req, res) => {
    try{
      const raw = sanitize(req.query[paramName] || req.query.value || '');
      if(!raw) return res.status(400).json({ error: `missing param ${paramName}` });
      const cacheKey = `${pathSuffix}:${raw}`;
      const cached = await cacheGet(cacheKey);
      if(cached) return res.json(cached);
      const target = `${UPSTREAM_BASE}${upstreamPath}?${paramName}=${encodeURIComponent(raw)}`;
      const resp = await fetchWithTimeout(target, {}, 12000, 2);
      let body = resp.data;
      if(typeof body === 'string'){
        body = cleanOwnerNotice(body);
        try{ body = JSON.parse(body); }catch(e){ /* leave as string */ }
      }
      await cacheSet(cacheKey, body, cacheTtlSec);
      return res.json(body);
    }catch(e){
      console.error('proxy error', e && e.message ? e.message : e);
      return res.status(502).json({ error: 'upstream_error', message: String(e && e.message ? e.message : e) });
    }
  });
}

// register example routes
createProxyRoute('cpf/full','cpf','/cpf/full', 300);
createProxyRoute('rg','rg','/rg', 180);
createProxyRoute('telefone/full','telefone','/telefone/full', 180);
createProxyRoute('placa','placa','/placa', 180);

// health
app.get('/api/health', (req,res)=> res.json({ ok:true, ts: Date.now() }));

// serve dashboard static file + socket.io events
app.get('/dashboard', (req,res)=>{
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// endpoint to read recent log lines (public read)
app.get('/api/_recent_logs', (req,res)=>{
  try{
    if(!fs.existsSync(LOG_PATH)) return res.status(200).send('');
    const data = fs.readFileSync(LOG_PATH,'utf8').trim().split('\\n');
    res.type('text/plain').send(data.slice(-200).join('\\n'));
  }catch(e){
    res.status(500).send('');
  }
});

// ADMIN endpoints - require ADMIN_TOKEN via header x-admin-token
function requireAdmin(req,res,next){
  const token = req.headers['x-admin-token'] || req.query.admin_token || '';
  if(!ADMIN_TOKEN || token !== ADMIN_TOKEN){
    return res.status(403).json({ error: 'admin_auth_required' });
  }
  next();
}

// list blocked IPs
app.get('/api/admin/blocked', requireAdmin, (req,res)=>{
  const items = Array.from(blockedIPs.entries()).map(([ip,expiry])=>({ ip, blockedUntil: expiry }));
  res.json({ blocked: items });
});

// unblock IP
app.post('/api/admin/unblock', requireAdmin, (req,res)=>{
  const ip = req.body.ip || req.query.ip;
  if(!ip) return res.status(400).json({ error: 'ip_required' });
  blockedIPs.delete(ip);
  fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] Admin unblocked ${ip}\n`);
  io.emit('stats', { totalRequests, lastMinuteCount, blocked: Array.from(blockedIPs.keys()) });
  res.json({ ok: true, ip });
});

// block IP manually
app.post('/api/admin/block', requireAdmin, (req,res)=>{
  const ip = req.body.ip || req.query.ip;
  const ms = parseInt(req.body.ttl_ms || req.query.ttl_ms || String(IP_BLOCK_TTL_MS));
  if(!ip) return res.status(400).json({ error: 'ip_required' });
  blockedIPs.set(ip, Date.now() + ms);
  fs.appendFileSync(LOG_PATH, `[${new Date().toISOString()}] Admin blocked ${ip} for ${ms}ms\n`);
  io.emit('stats', { totalRequests, lastMinuteCount, blocked: Array.from(blockedIPs.keys()) });
  res.json({ ok: true, ip, ttl_ms: ms });
});

// socket.io realtime updates: send stats on connection and periodically
io.on('connection', (socket)=>{
  console.log('dashboard client connected');
  socket.emit('stats', { totalRequests, lastMinuteCount, blocked: Array.from(blockedIPs.keys()) });
  const t = setInterval(()=>{
    socket.emit('stats', { totalRequests, lastMinuteCount, blocked: Array.from(blockedIPs.keys()) });
  }, 3000);
  socket.on('disconnect', ()=> { clearInterval(t); });
});

// global error handler
app.use((err, req, res, next)=>{
  console.error('Unhandled error', err && err.stack ? err.stack : err);
  res.status(500).json({ error: 'internal_server_error' });
});

// start server
server.listen(PORT, ()=>{
  console.log(`Server running on port ${PORT}`);
  console.log(`Dashboard available at /dashboard`);
});
