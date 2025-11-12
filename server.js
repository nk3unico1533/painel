import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

const cache = new Map();
const CACHE_TEMPO = 30 * 1000;
let contadorTotal = 0;
let inicioServidor = Date.now();

app.use(cors());
app.use(express.json());

// Logs simples
function log(tipo, msg) {
  const hora = new Date().toLocaleTimeString("pt-BR");
  console.log(`[${hora}] [${tipo}] ${msg}`);
}

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

async function consultarAPI(url, res) {
  contadorTotal++;
  try {
    const agora = Date.now();
    const cacheItem = cache.get(url);

    if (cacheItem && agora - cacheItem.tempo < CACHE_TEMPO) {
      log("CACHE", url);
      return res.json(cacheItem.data);
    }

    log("REQ", url);
    const resposta = await fetch(url, { headers: { "User-Agent": "DarkAuroraProxy/3.6" }, timeout: 20000 });
    const data = await parseJSONSafe(resposta);

    if (!data.status || data.status !== "erro") cache.set(url, { data, tempo: agora });

    res.json(data);
  } catch (erro) {
    log("ERRO", erro.message);
    res.status(500).json({ status: "erro", mensagem: "Erro interno ao conectar com a API.", detalhe: erro.message });
  }
}

app.get("/apirgcadsus", async (req, res) => {
  const { valor, rg } = req.query;
  const final = valor || rg;
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'rg'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apirgcadsus.php?rg=${final}`, res);
});

app.get("/apiserasacpf2025", async (req, res) => {
  const { valor, cpf } = req.query;
  const final = valor || cpf;
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'cpf'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${final}`, res);
});

app.get("/apitelcredilink2025", async (req, res) => {
  const { valor, telefone } = req.query;
  const final = valor || telefone;
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'telefone'." });
  await consultarAPI(`https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${final}`, res);
});

app.get("/", async (req, res) => {
  const { endpoint, valor, cpf, telefone, rg } = req.query;
  const final = valor || cpf || telefone || rg;
  if (!endpoint) return res.status(400).json({ status: "erro", mensagem: "Parâmetro 'endpoint' é obrigatório." });
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe um valor para consulta." });

  let url;
  if (endpoint === "apirgcadsus") url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${final}`;
  else if (endpoint === "apiserasacpf2025") url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${final}`;
  else if (endpoint === "apitelcredilink2025") url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${final}`;
  else return res.status(400).json({ status: "erro", mensagem: "Endpoint inválido." });

  await consultarAPI(url, res);
});

app.get("/status", (req, res) => {
  res.json({
    status: "online",
    servidor: "Dark Aurora Proxy v3.6 — Painel Integrado",
    dominio: "https://painel-dwib.onrender.com",
    uptime: Math.floor((Date.now() - inicioServidor) / 1000),
    cache_itens: cache.size,
    requisicoes_total: contadorTotal,
  });
});

app.post("/limpar-cache", (req, res) => {
  const tamanhoAntes = cache.size;
  cache.clear();
  log("INFO", "Cache limpo manualmente via painel.");
  res.json({ status: "ok", mensagem: `Cache limpo (${tamanhoAntes} itens removidos).` });
});

app.get("/monitor", (req, res) => {
  res.send(`<h1 style="color:#b47aff;font-family:sans-serif;text-align:center;margin-top:20%;">🛰️ Dark Aurora Monitor<br><small>Online - Painel dwib</small></h1>`);
});

app.listen(PORT, () => {
  log("START", `🚀 Dark Aurora Proxy v3.6 rodando em https://painel-dwib.onrender.com`);
});
