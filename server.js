// =============================
// Dark Aurora Consulta v2.8 — Proxy Server (corrigido: sanitização mínima por tipo)
// =============================

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// CORS liberado para qualquer origem (ideal para testes e deploys estáticos)
app.use(cors());
app.use(express.json());

// =============================
// Função proxy genérica
// =============================
async function proxyRequest(req, res, targetUrl) {
  try {
    const response = await fetch(targetUrl);
    const text = await response.text();

    // Tenta converter o retorno em JSON
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

// =============================
// Rotas de proxy (Consultas Aurora)
// =============================

// 🔹 Consulta CPF
app.get("/apiserasacpf2025", async (req, res) => {
  // aceita tanto ?valor=... quanto ?cpf=...
  const raw = req.query.valor || req.query.cpf || "";
  // sanitiza: só dígitos
  const valor = String(raw).replace(/\D/g, "");
  const url = `https://apiserasacpf2025.onrender.com/?cpf=${valor}`;
  await proxyRequest(req, res, url);
});

// 🔹 Consulta RG
app.get("/apirgcadsus", async (req, res) => {
  const raw = req.query.valor || req.query.rg || "";
  const valor = String(raw).replace(/\D/g, "");
  const url = `https://apirgcadsus.onrender.com/?rg=${valor}`;
  await proxyRequest(req, res, url);
});

// 🔹 Consulta Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const raw = req.query.valor || req.query.telefone || "";
  const valor = String(raw).replace(/\D/g, "");
  const url = `https://apitelcredilink2025.onrender.com/?telefone=${valor}`;
  await proxyRequest(req, res, url);
});

// 🔹 Consulta Placa (nova)
app.get("/apiplacabvdetran", async (req, res) => {
  const raw = req.query.valor || req.query.placa || "";
  // placa: remover espaços e caracteres inválidos, manter alfanuméricos e uppercase
  const valor = String(raw).replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const url = `https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${valor}`;
  await proxyRequest(req, res, url);
});

// 🔹 Consulta Nome (nova)
app.get("/apiserasanome2025", async (req, res) => {
  const raw = req.query.valor || req.query.nome || "";
  const valor = encodeURIComponent(String(raw));
  const url = `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${valor}`;
  await proxyRequest(req, res, url);
});

// 🔹 Consulta E-mail (nova)
app.get("/apiserasaemail2025", async (req, res) => {
  const raw = req.query.valor || req.query.email || "";
  const valor = encodeURIComponent(String(raw));
  const url = `https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${valor}`;
  await proxyRequest(req, res, url);
});

// =============================
// Página inicial / Monitoramento
// =============================
app.get("/", (req, res) => {
  res.send("✅ Dark Aurora Consulta v2.8 — Servidor proxy ativo e funcional.");
});

app.get("/monitor", (req, res) => {
  res.json({
    status: "online",
    versao: "2.8",
    servidor: "Render Proxy Estável",
    autor: "nk"
  });
});

// =============================
// Inicialização
// =============================
app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy ativo na porta ${PORT}`);
});
