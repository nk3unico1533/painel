import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Ativa CORS
app.use(cors());
app.use(express.json());

// ✅ Log básico
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  next();
});

// ✅ Função segura para interpretar respostas da API
async function parseJSONSafe(response) {
  try {
    return await response.json();
  } catch {
    const text = await response.text();
    if (text.includes("1033") || text.includes("<html")) {
      return {
        status: "erro",
        mensagem: "A API de destino retornou uma página HTML (provável erro 1033 ou bloqueio).",
        retorno_original: text.slice(0, 500) + "...",
      };
    }
    return {
      status: "erro",
      mensagem: "A API de destino retornou texto não JSON.",
      retorno_original: text.slice(0, 500) + "...",
    };
  }
}

// 🔹 Função genérica de proxy para APIs externas
async function consultarAPI(url, res) {
  try {
    console.log("🔹 Consultando:", url);
    const resposta = await fetch(url, {
      headers: { "User-Agent": "DarkAuroraProxy/1.0" },
      timeout: 20000,
    });
    const data = await parseJSONSafe(resposta);
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

// 🧩 ROTAS PERSONALIZADAS — suas APIs do Render

// 1️⃣ RG CAD SUS
app.get("/apirgcadsus", async (req, res) => {
  const { valor } = req.query;
  if (!valor) return res.status(400).json({ status: "erro", mensagem: "Parâmetro 'valor' é obrigatório." });
  const url = `https://apirgcadsus.vercel.app/api?valor=${valor}`;
  await consultarAPI(url, res);
});

// 2️⃣ SERASA CPF 2025
app.get("/apiserasacpf2025", async (req, res) => {
  const { valor, cpf } = req.query;
  const final = valor || cpf;
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe 'valor' ou 'cpf'." });
  const url = `https://apiserasacpf2025.vercel.app/api?valor=${final}`;
  await consultarAPI(url, res);
});

// 3️⃣ TEL CREDILINK 2025
app.get("/apitelcredilink2025", async (req, res) => {
  const { valor, telefone } = req.query;
  const final = valor || telefone;
  if (!final) return res.status(400).json({ status: "erro", mensagem: "Informe 'valor' ou 'telefone'." });
  const url = `https://apitelcredilink2025.vercel.app/api?valor=${final}`;
  await consultarAPI(url, res);
});

// 🔄 Rota genérica de fallback (usada pelo painel)
app.get("/", async (req, res) => {
  const { endpoint, valor, cpf, telefone } = req.query;
  if (!endpoint)
    return res.status(400).json({ status: "erro", mensagem: "Parâmetro 'endpoint' é obrigatório." });

  const final = valor || cpf || telefone;
  if (!final)
    return res.status(400).json({ status: "erro", mensagem: "Informe 'valor', 'cpf' ou 'telefone'." });

  const url = `https://${endpoint}.vercel.app/api?valor=${final}`;
  await consultarAPI(url, res);
});

// 📡 Status
app.get("/status", (req, res) => {
  res.json({
    status: "online",
    servidor: "Dark Aurora Proxy v2.8 — by nk",
    hora: new Date().toISOString(),
  });
});

// 🚀 Inicialização
app.listen(PORT, () => {
  console.log(`🚀 Servidor Dark Aurora Proxy v2.8 rodando na porta ${PORT}`);
});
