import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Lista dos endpoints permitidos
const ENDPOINTS = {
  apirgcadsus: "https://apirgcadsus.onrender.com",
  apiserasacpf2025: "https://apiserasacpf2025.onrender.com",
  apitelcredilink2025: "https://apitelcredilink2025.onrender.com"
};

// Middleware para log básico
app.use((req, res, next) => {
  console.log(`🌐 [${new Date().toISOString()}] Nova requisição: ${req.url}`);
  next();
});

// Rota principal proxy
app.get("/", async (req, res) => {
  try {
    const { cpf, rg, tel, endpoint } = req.query;

    if (!endpoint || !ENDPOINTS[endpoint]) {
      return res.status(400).json({ erro: "❌ Endpoint inválido ou não especificado." });
    }

    const baseURL = ENDPOINTS[endpoint];
    let targetURL = baseURL;

    // Montagem dinâmica da URL destino
    if (cpf) targetURL += `/?cpf=${cpf}`;
    else if (rg) targetURL += `/?rg=${rg}`;
    else if (tel) targetURL += `/?tel=${tel}`;
    else return res.status(400).json({ erro: "❌ Parâmetro de consulta ausente (cpf, rg ou tel)." });

    console.log(`🚀 Encaminhando para: ${targetURL}`);

    // Faz a requisição ao endpoint real
    const resposta = await fetch(targetURL);
    const texto = await resposta.text();

    // Se a resposta já for JSON válido → retorna direto
    try {
      const json = JSON.parse(texto);
      return res.json(json);
    } catch {
      // Se não for JSON, tenta achar JSON dentro do texto
      const match = texto.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          const json = JSON.parse(match[0]);
          return res.json(json);
        } catch {
          return res.status(500).json({ erro: "⚠️ Falha ao processar JSON parcial." });
        }
      }
      // Se realmente não tiver JSON → retorna mensagem padronizada
      return res.status(502).json({ erro: "⚠️ Nenhum dado JSON válido retornado pela API destino.", retorno: texto });
    }

  } catch (err) {
    console.error("❌ Erro interno:", err);
    res.status(500).json({ erro: "❌ Erro interno no servidor proxy.", detalhes: err.message });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`✅ Dark Aurora Proxy ativo na porta ${PORT}`);
});
