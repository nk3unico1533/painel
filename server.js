// 🌌 Dark Aurora Proxy v2.3 — by nk
// Proxy seguro e compatível com as APIs apis-brasil.shop

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Endpoint principal
app.get("/", async (req, res) => {
  const { cpf, rg, telefone, endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ erro: "Endpoint não especificado." });
  }

  let url;

  switch (endpoint) {
    case "apiserasacpf2025":
      url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`;
      break;
    case "apirgcadsus":
      url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`;
      break;
    case "apitelcredilink2025":
      url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`;
      break;
    default:
      return res.status(400).json({ erro: "Endpoint inválido." });
  }

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    try {
      const json = JSON.parse(texto);
      return res.json(json);
    } catch {
      return res.json({
        status: "erro",
        mensagem: "A API retornou texto em vez de JSON.",
        retorno_original: texto.substring(0, 400),
      });
    }
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro interno ao consultar a API externa.",
      detalhe: erro.message,
    });
  }
});

// 🔹 Página padrão
app.get("*", (req, res) => {
  res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy ativo na porta ${PORT}`));
