// 🌌 Dark Aurora Proxy Server — by nk
// Versão com CORS 100% liberado e compatível com o painel

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// 🟣 Libera CORS para qualquer origem (frontend, InfinityFree, Kesug etc.)
app.use(cors({ origin: "*" }));
app.use(express.json());

// 🔧 Responde requisições OPTIONS (preflight do navegador)
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

// ✅ Rota principal com proxy inteligente
app.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { cpf, rg, telefone, endpoint } = req.query;

  // 🔹 Status padrão se não houver endpoint
  if (!endpoint) {
    return res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
  }

  let url;
  switch (endpoint) {
    case "apiserasacpf2025":
      url = `https://apiserasacpf2025.onrender.com/?cpf=${cpf}`;
      break;
    case "apirgcadsus":
      url = `https://apirgcadsus.onrender.com/?rg=${rg}`;
      break;
    case "apitelcredilink2025":
      url = `https://apitelcredilink2025.onrender.com/?telefone=${telefone}`;
      break;
    default:
      return res.status(400).json({ erro: "❌ Endpoint inválido." });
  }

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    try {
      const json = JSON.parse(texto);
      res.json(json);
    } catch {
      console.log("⚠️ Resposta não JSON recebida:", texto);
      res.status(200).send(texto);
    }
  } catch (erro) {
    console.error("🚨 Erro ao buscar API:", erro);
    res.status(500).json({ erro: "Erro interno ao consultar API externa." });
  }
});

// 🚀 Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🌌 Dark Aurora Proxy rodando com CORS liberado — Porta ${PORT}`);
});
