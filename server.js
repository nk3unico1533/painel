import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// 🟣 Cache simples em memória (30 segundos)
const cache = new Map();
const CACHE_TEMPO = 30 * 1000; // 30 segundos

// ✅ Ativa CORS e JSON
app.use(cors());
app.use(express.json());

// ✅ Log básico
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ Função segura para interpretar respostas
async function parseJSONSafe(response) {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    if (text.includes("1033") || text.includes("<html")) {
      return {
        status: "erro",
        mensagem: "A API de destino retornou HTML (provável erro 1033 ou bloqueio).",
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

// 🔹 Função genérica com cache e proxy
async function consultarAPI(url, res) {
  try {
    // Verifica cache
    const agora = Date.now();
    const cacheItem = cache.get(url);
    if (cacheItem && agora - cacheItem.tempo < CACHE_TEMPO) {
      console.log("⚡ Resposta servida do cache:", url);
      return res.json(cacheItem.data);
    }

    console.log("🔹 Consultando:", url);
    const resposta = await fetch(url, {
      headers: { "User-Agent": "DarkAuroraProxy/2.9" },
      timeout: 20000,
    });

    const data = await parseJSONSafe(resposta);

    // Armazena no cache se válido
    if (!data.status || data.status !== "erro") {
      cache.set(url, { data, tempo: agora });
    }

    res.json(data);
  } catch (erro) {
    console.error("❌ Erro ao consultar API:", erro.message);
    res.status(500).json({
      status: "erro",
      mensagem: "Erro interno ao conectar com a API de destino.",
      detalhe: erro.message,
    });
  }
}

// 🧩 ROTAS PERSONALIZADAS — usando os endpoints reais

// 🔸 RG (CadSUS)
app.get("/apirgcadsus", async (req, res) => {
  const { valor, rg } = req.query;
  const final = valor || rg;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'rg' ou 'valor'." });

  const url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${final}`;
  await consultarAPI(url, res);
});

// 🔸 CPF (Serasa)
app.get("/apiserasacpf2025", async (req, res) => {
  const { valor, cpf } = req.query;
  const final = valor || cpf;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'cpf' ou 'valor'." });

  const url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${final}`;
  await consultarAPI(url, res);
});

// 🔸 Telefone (Credilink)
app.get("/apitelcredilink2025", async (req, res) => {
  const { valor, telefone } = req.query;
  const final = valor || telefone;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe o parâmetro 'telefone' ou 'valor'." });

  const url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${final}`;
  await consultarAPI(url, res);
});

// 🔹 Rota genérica (usada pelo painel)
app.get("/", async (req, res) => {
  const { endpoint, valor, cpf, telefone, rg } = req.query;
  if (!endpoint)
    return res.status(400).json({ status: "erro", mensagem: "Parâmetro 'endpoint' é obrigatório." });

  const final = valor || cpf || telefone || rg;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe 'valor', 'cpf', 'telefone' ou 'rg'." });

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
    servidor: "Dark Aurora Proxy v2.9 — Cache Inteligente — by nk",
    hora: new Date().toISOString(),
    cache_itens: cache.size,
  });
});

// 🚀 Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor Dark Aurora Proxy v2.9 rodando na porta ${PORT}`);
});
