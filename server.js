import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// 🟣 Libera CORS para todas as origens (frontend InfinityFree, Kesug, etc.)
app.use(cors());
app.use(express.json());

// 🔮 Mensagem de status do servidor
app.get("/", (req, res) => {
  res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
});

// 🔷 Função genérica para fazer proxy das requisições
async function proxyRequest(req, res, targetUrl) {
  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get("content-type");
    res.setHeader("Content-Type", contentType || "application/json");
    const body = await response.text();
    res.status(response.status).send(body);
  } catch (error) {
    console.error("Erro ao fazer proxy:", error);
    res.status(500).json({ erro: "Erro interno ao consultar a API." });
  }
}

// 🪪 Consulta RG (CadSUS)
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  if (!rg) return res.status(400).json({ erro: "RG não informado." });
  const url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`;
  await proxyRequest(req, res, url);
});

// 🧾 Consulta CPF (Serasa 2025)
app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ erro: "CPF não informado." });
  const url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`;
  await proxyRequest(req, res, url);
});

// 📞 Consulta Telefone (Credilink 2025)
app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  if (!telefone) return res.status(400).json({ erro: "Telefone não informado." });
  const url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`;
  await proxyRequest(req, res, url);
});

// 🚀 Inicializa o servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor Dark Aurora Proxy rodando na porta ${PORT}`);
});
