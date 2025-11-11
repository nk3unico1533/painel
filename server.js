// 🌌 Dark Aurora Proxy Server — by nk
// Versão estável compatível com painel-9ycj.onrender.com

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// ✅ Rota principal com status
app.get("/", async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const { cpf, rg, telefone, endpoint } = req.query;

  // 🔹 Caso acessem sem parâmetros, mostra status padrão
  if (!endpoint) {
    return res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
  }

  let url;

  // 🔀 Monta a URL de destino conforme o endpoint informado
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
    // 🛰 Faz o fetch para a API real
    const resposta = await fetch(url);
    const texto = await resposta.text();

    // 🧩 Tenta interpretar como JSON
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
  console.log(`🌌 Dark Aurora Proxy rodando na porta ${PORT}`);
});
