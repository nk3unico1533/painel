import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import chalk from "chalk";

const app = express();
const PORT = process.env.PORT || 10000;

// 🧠 Cache simples (30s)
const cache = new Map();
const CACHE_TEMPO = 30 * 1000;

// 📊 Contadores e info
let contadorTotal = 0;
let inicioServidor = Date.now();

// 🟣 Configuração base
app.use(cors());
app.use(express.json());

// 🎨 Logs coloridos
function logColorido(tipo, msg) {
  const hora = new Date().toLocaleTimeString("pt-BR");
  const base = chalk.gray(`[${hora}]`);
  switch (tipo) {
    case "req": console.log(base, chalk.magentaBright("📥 REQ"), msg); break;
    case "ok": console.log(base, chalk.green("✅ OK"), msg); break;
    case "cache": console.log(base, chalk.yellow("⚡ CACHE"), msg); break;
    case "erro": console.log(base, chalk.red("❌ ERRO"), msg); break;
    default: console.log(base, msg);
  }
}

// 🔍 Parser seguro
async function parseJSONSafe(response) {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    if (text.includes("1033") || text.includes("<html")) {
      return {
        status: "erro",
        mensagem: "A API de destino retornou HTML (erro 1033 ou bloqueio).",
        retorno_original: text.slice(0, 300) + "...",
      };
    }
    return {
      status: "erro",
      mensagem: "A API de destino retornou texto não JSON.",
      retorno_original: text.slice(0, 300) + "...",
    };
  }
}

// 🚀 Função de consulta
async function consultarAPI(url, res) {
  contadorTotal++;
  try {
    const agora = Date.now();
    const cacheItem = cache.get(url);

    if (cacheItem && agora - cacheItem.tempo < CACHE_TEMPO) {
      logColorido("cache", url);
      return res.json(cacheItem.data);
    }

    logColorido("req", url);
    const resposta = await fetch(url, {
      headers: { "User-Agent": "DarkAuroraProxy/3.5" },
      timeout: 20000,
    });

    const data = await parseJSONSafe(resposta);

    if (!data.status || data.status !== "erro") {
      cache.set(url, { data, tempo: agora });
      logColorido("ok", "Resposta armazenada no cache.");
    }

    res.json(data);
  } catch (erro) {
    logColorido("erro", erro.message);
    res.status(500).json({
      status: "erro",
      mensagem: "Erro interno ao conectar com a API de destino.",
      detalhe: erro.message,
    });
  }
}

// 🧩 Endpoints de proxy
app.get("/apirgcadsus", async (req, res) => {
  const { valor, rg } = req.query;
  const final = valor || rg;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'rg'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apirgcadsus.php?rg=${final}`, res);
});

app.get("/apiserasacpf2025", async (req, res) => {
  const { valor, cpf } = req.query;
  const final = valor || cpf;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'cpf'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${final}`, res);
});

app.get("/apitelcredilink2025", async (req, res) => {
  const { valor, telefone } = req.query;
  const final = valor || telefone;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'telefone'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${final}`, res);
});

// 🌐 Rota genérica
app.get("/", async (req, res) => {
  const { endpoint, valor, cpf, telefone, rg } = req.query;
  const final = valor || cpf || telefone || rg;
  if (!endpoint)
    return res.status(400).json({ status: "erro", mensagem: "Parâmetro 'endpoint' é obrigatório." });
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe um valor para consulta." });

  let url;
  if (endpoint === "apirgcadsus")
    url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${final}`;
  else if (endpoint === "apiserasacpf2025")
    url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${final}`;
  else if (endpoint === "apitelcredilink2025")
    url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${final}`;
  else
    return res.status(400).json({ status: "erro", mensagem: "Endpoint inválido." });

  await consultarAPI(url, res);
});

// 📡 Status
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    servidor: "Dark Aurora Proxy v3.5 — Painel de Monitoramento Integrado — by nk",
    hora: new Date().toISOString(),
    uptime_segundos: Math.floor((Date.now() - inicioServidor) / 1000),
    cache_itens: cache.size,
    requisicoes_total: contadorTotal,
  });
});

// 🧭 Painel de Monitoramento visual
app.get("/monitor", (req, res) => {
  const uptimeSegundos = Math.floor((Date.now() - inicioServidor) / 1000);
  const uptimeMinutos = Math.floor(uptimeSegundos / 60);
  const uptimeHoras = Math.floor(uptimeMinutos / 60);
  res.send(`
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Dark Aurora Monitor — by nk</title>
    <style>
      body {
        background: radial-gradient(circle at center, #1a0026 0%, #0d0014 100%);
        color: #e0baff;
        font-family: 'Poppins', sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        overflow: hidden;
      }
      h1 {
        font-size: 2em;
        color: #b47aff;
        text-shadow: 0 0 10px #b47aff;
        margin-bottom: 10px;
      }
      .card {
        background: rgba(0,0,0,0.4);
        border: 2px solid transparent;
        border-image: linear-gradient(90deg, #b47aff, #7a00ff, #b47aff) 1;
        box-shadow: 0 0 15px #5f00cc88;
        border-radius: 15px;
        padding: 20px 30px;
        width: 380px;
        text-align: left;
        animation: glow 5s linear infinite;
      }
      @keyframes glow {
        0% { box-shadow: 0 0 10px #5f00cc88; }
        50% { box-shadow: 0 0 25px #b47affaa; }
        100% { box-shadow: 0 0 10px #5f00cc88; }
      }
      .line { margin: 8px 0; }
      .label { color: #aaa; }
      .value { color: #fff; font-weight: bold; }
      footer {
        margin-top: 20px;
        font-size: 0.85em;
        color: #8c5eff;
      }
    </style>
  </head>
  <body>
    <h1>🛰️ Dark Aurora Monitor</h1>
    <div class="card">
      <div class="line"><span class="label">Servidor:</span> <span class="value">Dark Aurora Proxy v3.5</span></div>
      <div class="line"><span class="label">Status:</span> <span class="value">🟢 Online</span></div>
      <div class="line"><span class="label">Requisições:</span> <span class="value">${contadorTotal}</span></div>
      <div class="line"><span class="label">Itens no Cache:</span> <span class="value">${cache.size}</span></div>
      <div class="line"><span class="label">Uptime:</span> <span class="value">${uptimeHoras}h ${uptimeMinutos % 60}m ${uptimeSegundos % 60}s</span></div>
      <div class="line"><span class="label">Porta:</span> <span class="value">${PORT}</span></div>
    </div>
    <footer>by nk • Dark Aurora Proxy 🌌</footer>
  </body>
  </html>
  `);
});

// 🚀 Inicialização
app.listen(PORT, () => {
  console.log(chalk.bgMagentaBright.bold("\n🌌 Dark Aurora Proxy v3.5 — by nk"));
  console.log(chalk.cyan(`🚀 Servidor ativo na porta ${PORT}`));
  console.log(chalk.gray("🔭 Monitor disponível em: /monitor"));
  console.log(chalk.gray(`🧠 Cache: ${CACHE_TEMPO / 1000}s | Logs coloridos e painel ativo\n`));
});
