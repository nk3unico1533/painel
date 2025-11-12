// =============================
// Dark Aurora Consulta v2.8 — Proxy Server (corrigido para parâmetros dinâmicos)
// =============================

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

async function proxyRequest(req, res, targetUrl) {
  try {
    const response = await fetch(targetUrl);
    const text = await response.text();

    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch {
      res.json({ erro: "Retorno inválido", retorno_original: text });
    }
  } catch (err) {
    console.error("❌ Erro ao conectar com a API:", err);
    res.status(500).json({ erro: "Erro ao conectar com a API" });
  }
}

// 🔹 CPF
app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  const url = `https://apiserasacpf2025.onrender.com/?cpf=${cpf}`;
  await proxyRequest(req, res, url);
});

// 🔹 RG
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  const url = `https://apirgcadsus.onrender.com/?rg=${rg}`;
  await proxyRequest(req, res, url);
});

// 🔹 Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  const url = `https://apitelcredilink2025.onrender.com/?telefone=${telefone}`;
  await proxyRequest(req, res, url);
});

// 🔹 Placa
app.get("/apiplacabvdetran", async (req, res) => {
  const { placa } = req.query;
  const url = `https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${placa}`;
  await proxyRequest(req, res, url);
});

// 🔹 Nome
app.get("/apiserasanome2025", async (req, res) => {
  const { nome } = req.query;
  const url = `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${encodeURIComponent(nome)}`;
  await proxyRequest(req, res, url);
});

// 🔹 Email
app.get("/apiserasaemail2025", async (req, res) => {
  const { email } = req.query;
  const url = `https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${encodeURIComponent(email)}`;
  await proxyRequest(req, res, url);
});

app.get("/", (req, res) => {
  res.send("✅ Dark Aurora Consulta v2.8 — Servidor proxy ativo e funcional.");
});

app.get("/monitor", (req, res) => {
  res.json({ status: "online", versao: "2.8", servidor: "Render Proxy Estável", autor: "nk" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ativo na porta ${PORT}`);
});
