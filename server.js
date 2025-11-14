// server.js — Express proxy for Dark Aurora (fixed concatenation, routes mapping, basic timeouts)
// Designed to be deployed on Render (or any Node host). For each frontend path we proxy to apis-brasil.shop/apis/<file>.
// Keep this file as-is and deploy to your Render instance (painel-dwib.onrender.com).

const express = require('express');
const fetch = global.fetch || require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;
const TIMEOUT_MS = 20000; // 20s

// Upstream base
const UPSTREAM = 'https://apis-brasil.shop/apis';

// Helper to proxy a single upstream URL and stream response text
async function proxyUpstream(res, upstreamUrl) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const resp = await fetch(upstreamUrl, { signal: controller.signal });
    clearTimeout(id);
    const text = await resp.text();
    // forward status and content-type if possible
    const contentType = resp.headers.get('content-type') || 'text/plain; charset=utf-8';
    res.set('content-type', contentType);
    return res.status(200).send(text);
  } catch (err) {
    console.error('proxyUpstream error for', upstreamUrl, err && err.message ? err.message : err);
    if (err.name === 'AbortError') {
      return res.status(504).send(`{"error":"upstream timeout","details":"${upstreamUrl}"}`);
    }
    return res.status(502).send(`{"error":"upstream fetch failed","details":"${upstreamUrl}"}`);
  }
}

// Safety: always add CORS for your frontend domains (allow all for now)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// --- Routes mapping ---
// CPF routes
app.get('/cpf/full', async (req, res) => {
  const cpf = req.query.cpf || req.query.valor || '';
  if (!cpf) return res.status(400).send('{"error":"missing cpf"}');
  const upstream = `${UPSTREAM}/apiserasacpf2025.php?cpf=${encodeURIComponent(cpf)}`;
  return proxyUpstream(res, upstream);
});
app.get('/cpf/hard', async (req, res) => {
  const cpf = req.query.cpf || '';
  if (!cpf) return res.status(400).send('{"error":"missing cpf"}');
  const upstream = `${UPSTREAM}/apicpfcredilink2025.php?cpf=${encodeURIComponent(cpf)}`;
  return proxyUpstream(res, upstream);
});
app.get('/cpf/low', async (req, res) => {
  const cpf = req.query.cpf || '';
  if (!cpf) return res.status(400).send('{"error":"missing cpf"}');
  const upstream = `${UPSTREAM}/apicpfdatasus.php?cpf=${encodeURIComponent(cpf)}`;
  return proxyUpstream(res, upstream);
});
app.get('/cpf/detran', async (req, res) => {
  const cpf = req.query.cpf || '';
  if (!cpf) return res.status(400).send('{"error":"missing cpf"}');
  const upstream = `${UPSTREAM}/apicpfbvdetran.php?cpf=${encodeURIComponent(cpf)}`;
  return proxyUpstream(res, upstream);
});
app.get('/cpf/35m', async (req, res) => {
  const cpf = req.query.cpf || '';
  if (!cpf) return res.status(400).send('{"error":"missing cpf"}');
  const upstream = `${UPSTREAM}/apicpf35rais2019.php?cpf=${encodeURIComponent(cpf)}`;
  return proxyUpstream(res, upstream);
});
app.get('/cpf/cnpj', async (req, res) => {
  const cnpj = req.query.cnpj || '';
  if (!cnpj) return res.status(400).send('{"error":"missing cnpj"}');
  const upstream = `${UPSTREAM}/apicnpj35rais2019.php?cnpj=${encodeURIComponent(cnpj)}`;
  return proxyUpstream(res, upstream);
});

// RG
app.get('/rg', async (req, res) => {
  const rg = req.query.rg || '';
  if (!rg) return res.status(400).send('{"error":"missing rg"}');
  const upstream = `${UPSTREAM}/apirgcadsus.php?rg=${encodeURIComponent(rg)}`;
  return proxyUpstream(res, upstream);
});

// Telefone (multiple)
app.get('/telefone/full', async (req, res) => {
  const tel = req.query.telefone || req.query.valor || '';
  if (!tel) return res.status(400).send('{"error":"missing telefone"}');
  const upstream = `${UPSTREAM}/apitelcredilink2025.php?telefone=${encodeURIComponent(tel)}`;
  return proxyUpstream(res, upstream);
});
app.get('/telefone/hard10', async (req, res) => {
  const tel = req.query.telefone || '';
  if (!tel) return res.status(400).send('{"error":"missing telefone"}');
  const upstream = `${UPSTREAM}/apitel43malgar.php?ddd=${encodeURIComponent(req.query.ddd||'')}&telefone=${encodeURIComponent(tel)}`;
  return proxyUpstream(res, upstream);
});
app.get('/telefone/low10', async (req, res) => {
  const tel = req.query.telefone || '';
  if (!tel) return res.status(400).send('{"error":"missing telefone"}');
  const upstream = `${UPSTREAM}/apitel1cadsus.php?telefone=${encodeURIComponent(tel)}`;
  return proxyUpstream(res, upstream);
});
app.get('/telefone/op1', async (req, res) => {
  const tel = req.query.telefone || '';
  if (!tel) return res.status(400).send('{"error":"missing telefone"}');
  const upstream = `${UPSTREAM}/apitel2cadsus.php?telefone2=${encodeURIComponent(tel)}`;
  return proxyUpstream(res, upstream);
});
app.get('/telefone/op2', async (req, res) => {
  const tel = req.query.telefone || '';
  if (!tel) return res.status(400).send('{"error":"missing telefone"}');
  const upstream = `${UPSTREAM}/apitel3cadsus.php?telefone3=${encodeURIComponent(tel)}`;
  return proxyUpstream(res, upstream);
});

// Placa
app.get('/placa', async (req, res) => {
  const placa = req.query.placa || '';
  if (!placa) return res.status(400).send('{"error":"missing placa"}');
  const upstream = `${UPSTREAM}/apiplacabvdetran.php?placa=${encodeURIComponent(placa)}`;
  return proxyUpstream(res, upstream);
});

// Nome
app.get('/nome/op1', async (req, res) => {
  const nome = req.query.nome || '';
  if (!nome) return res.status(400).send('{"error":"missing nome"}');
  const upstream = `${UPSTREAM}/apiserasanome2025.php?nome=${encodeURIComponent(nome)}`;
  return proxyUpstream(res, upstream);
});
app.get('/nome/op2', async (req, res) => {
  const nome = req.query.nome || '';
  if (!nome) return res.status(400).send('{"error":"missing nome"}');
  const upstream = `${UPSTREAM}/apinomefotoma.php?nome=${encodeURIComponent(nome)}`;
  return proxyUpstream(res, upstream);
});

// Email
app.get('/email', async (req, res) => {
  const email = req.query.email || '';
  if (!email) return res.status(400).send('{"error":"missing email"}');
  const upstream = `${UPSTREAM}/apiserasaemail2025.php?email=${encodeURIComponent(email)}`;
  return proxyUpstream(res, upstream);
});

// Health check
app.get('/', (req, res) => res.send('Dark Aurora - API Proxy ONLINE'));

app.listen(PORT, () => {
  console.log(`Dark Aurora proxy listening on port ${PORT}`);
});