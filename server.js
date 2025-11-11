// 🌌 Dark Aurora Proxy v2.2 — Modo Antifalha
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  const { cpf, rg, telefone, endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({ erro: "Endpoint não especificado." });
  }

  let url;

  // 🔹 Rotas conhecidas
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
      return res.status(400).json({ erro: "Endpoint inválido." });
  }

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    // 🔹 Tenta fazer parse do JSON
    try {
      const json = JSON.parse(texto);
      return res.json(json);
    } catch {
      // 🔹 Retorna JSON válido mesmo que a API devolva texto/erro
      return res.json({
        status: "erro",
        mensagem: "A API de destino não retornou JSON válido.",
        retorno_original: texto.substring(0, 300),
      });
    }
  } catch (erro) {
    return res.status(500).json({
      erro: "Erro interno ao consultar API externa.",
      detalhe: erro.message,
    });
  }
});

// Mensagem padrão
app.get("*", (req, res) => {
  res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
});

// Porta Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Dark Aurora Proxy v2.2 rodando na porta ${PORT}`)
);
