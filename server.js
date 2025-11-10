import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Histórico simples em memória
let historico = [];

// Rota base
app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀" });
});

// Rota de consulta
app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  if (!tipo || !valor) return res.status(400).json({ erro: "Parâmetros tipo e valor são obrigatórios." });

  let url = "";
  if (tipo === "basica") url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`;
  if (tipo === "datasus") url = `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`;
  if (tipo === "full") url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`;
  if (tipo === "telefone") url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`;

  try {
    const response = await fetch(url);
    let text = await response.text();

    // Remove as mensagens "Aviso: Sou o dono desta API..." antes do JSON
    text = text.replace(/Aviso:[\s\S]*?\[/, "["); // remove avisos antes de [
    text = text.replace(/Aviso:[\s\S]*?\{/, "{"); // remove avisos antes de {
    text = text.trim();

    let json;
    try {
      json = JSON.parse(text);
    } catch (e) {
      // Se não for JSON válido, retorna o texto cru
      return res.json({ raw: text });
    }

    // Salva no histórico
    historico.unshift({
      tipo,
      valor,
      data: new Date().toLocaleString("pt-BR"),
    });

    res.json({ resultado: json, historico });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Rota para obter histórico
app.get("/historico", (req, res) => {
  res.json(historico);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
