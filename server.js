import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoints oficiais
const ENDPOINTS = {
  apirgcadsus: "https://apirgcadsus.onrender.com",
  apiserasacpf2025: "https://apiserasacpf2025.onrender.com",
  apitelcredilink2025: "https://apitelcredilink2025.onrender.com"
};

// Middleware: logs e headers anti-cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  console.log(`🌌 Dark Aurora Proxy: nova requisição → ${req.url}`);
  next();
});

// Rota principal
app.get("/", async (req, res) => {
  try {
    const { cpf, rg, tel, endpoint } = req.query;

    if (!endpoint || !ENDPOINTS[endpoint]) {
      return res.status(400).json({ erro: "❌ Endpoint inválido ou ausente." });
    }

    const baseURL = ENDPOINTS[endpoint];
    let targetURL = baseURL;

    if (cpf) targetURL += `/?cpf=${cpf}`;
    else if (rg) targetURL += `/?rg=${rg}`;
    else if (tel) targetURL += `/?tel=${tel}`;
    else return res.status(400).json({ erro: "❌ Parâmetro de consulta ausente (cpf, rg ou tel)." });

    console.log(`🚀 Proxy encaminhando para → ${targetURL}`);

    const resposta = await fetch(targetURL);
    const texto = await resposta.text();

    // Tenta converter diretamente em JSON
    try {
      const json = JSON.parse(texto);
      return res.json(json);
    } catch {
      // Caso o retorno seja texto com JSON embutido
      const match = texto.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const json = JSON.parse(match[0]);
          return res.json(json);
        } catch {
          console.log("⚠️ JSON parcial corrompido.");
          return res.status(500).json({ erro: "⚠️ JSON inválido retornado pela API destino." });
        }
      }
      // Nenhum JSON encontrado
      console.log("⚠️ Nenhum dado JSON retornado pela API destino.");
      return res.status(502).json({
        erro: "⚠️ Nenhum dado JSON válido retornado pela API destino.",
        retorno: texto
      });
    }

  } catch (err) {
    console.error("❌ Erro interno no proxy:", err);
    res.status(500).json({ erro: "❌ Erro interno no servidor proxy.", detalhes: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Dark Aurora Proxy ativo na porta ${PORT}`);
});
