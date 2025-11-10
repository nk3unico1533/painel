// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀" });
});

app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;

  if (!tipo || !valor) {
    return res.status(400).json({ erro: "Parâmetros tipo e valor são obrigatórios." });
  }

  let url = "";
  if (tipo === "basica") url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`;
  if (tipo === "datasus") url = `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`;
  if (tipo === "full") url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`;
  if (tipo === "telefone") url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`;

  try {
    const response = await fetch(url);
    const text = await response.text();
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
