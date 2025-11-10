import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Middleware global para CORS (sem precisar do pacote "cors")
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Função proxy genérica
async function proxyRequest(res, url) {
  try {
    const response = await fetch(url);
    const text = await response.text();

    // ✅ Reforça CORS no retorno
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(response.status).send(text);
  } catch (error) {
    console.error("Erro ao buscar:", error);
    res.status(500).json({ erro: "Erro interno no servidor proxy" });
  }
}

// ✅ Rota CPF
app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  if (!cpf) return res.status(400).json({ erro: "CPF ausente" });
  const url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`;
  await proxyRequest(res, url);
});

// ✅ Rota RG
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  if (!rg) return res.status(400).json({ erro: "RG ausente" });
  const url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`;
  await proxyRequest(res, url);
});

// ✅ Rota Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  if (!telefone) return res.status(400).json({ erro: "Telefone ausente" });
  const url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`;
  await proxyRequest(res, url);
});

// ✅ Página padrão
app.get("/", (req, res) => {
  res.send("🌌 Dark Aurora Proxy ativo com CORS liberado!");
});

app.listen(PORT, () => {
  console.log(`✅ Servidor ativo na porta ${PORT}`);
});
