// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.disable("x-powered-by");

// ✅ Cabeçalhos de segurança e cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});

// ✅ Endpoint principal
app.get("/api/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  if (!tipo || !valor) return res.status(400).json({ erro: "Faltando parâmetros." });

  const urls = {
    rg: `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`,
    cpf: `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`,
    telefone: `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`,
  };

  const url = urls[tipo];
  if (!url) return res.status(400).json({ erro: "Tipo inválido." });

  try {
    const response = await fetch(url);
    const text = await response.text();

    // 🔹 Garante que o JSON seja limpo de propagandas e HTML
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    const cleanText = jsonMatch ? jsonMatch[0] : text;

    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.send(cleanText);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar API." });
  }
});

const port = process.env.PORT || 10000;
app.listen(port, () => console.log(`🌌 DarkAurora API rodando na porta ${port}`));
