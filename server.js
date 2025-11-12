import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

const proxy = async (req, res, url) => {
  try {
    const query = new URLSearchParams(req.query).toString();
    const r = await fetch(`${url}?${query}`);
    const text = await r.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const json = jsonMatch ? JSON.parse(jsonMatch[0]) : { erro: "Formato inválido" };
    res.json(json);
  } catch (err) {
    res.status(500).json({ erro: "Falha no proxy" });
  }
};

app.get("/apiserasacpf2025", (req, res) => proxy(req, res, "https://apiserasacpf2025.onrender.com"));
app.get("/apirgcadsus", (req, res) => proxy(req, res, "https://apirgcadsus.onrender.com"));
app.get("/apitelcredilink2025", (req, res) => proxy(req, res, "https://apitelcredilink2025.onrender.com"));
app.get("/monitor", (req, res) => res.send("Servidor online v2.8 ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy ativo na porta ${PORT}`));
