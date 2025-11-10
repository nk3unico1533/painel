import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let historico = [];

app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀" });
});

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

    // Extrai apenas o JSON válido
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    let json;
    if (jsonMatch) {
      try {
        json = JSON.parse(jsonMatch[0]);
      } catch (err) {
        json = { erro: "Falha ao interpretar JSON", raw: text.slice(0, 300) };
      }
    } else {
      json = { erro: "Nenhum JSON detectado", raw: text.slice(0, 300) };
    }

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

app.get("/historico", (req, res) => res.json(historico));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
