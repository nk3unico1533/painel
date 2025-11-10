import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors()); // ✅ habilita CORS globalmente
app.use(express.json());

// Função para proxy genérico
async function proxyRequest(res, url) {
  try {
    const response = await fetch(url);
    const data = await response.text();

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(response.status).send(data);
  } catch (error) {
    console.error("Erro no proxy:", error);
    res.status(500).json({ erro: "Falha ao consultar API" });
  }
}

// ✅ Rotas de proxy
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  if (!rg) return res.status(400).json({ erro: "RG ausente" });

  const url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`;
  await proxyRequest(res, url);
});

app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ erro: "CPF ausente" });

  const url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`;
  await proxyRequest(res, url);
});

app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  if (!telefone) return res.status(400).json({ erro: "Telefone ausente" });

  const url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`;
  await proxyRequest(res, url);
});

// ✅ Rota padrão
app.get("/", (req, res) => {
  res.send("Dark Aurora Proxy Server Ativo 🚀");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
