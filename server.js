// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/api/consulta", async (req, res) => {
  try {
    const { tipo, valor } = req.query;
    if (!tipo || !valor) return res.status(400).json({ erro: "Parâmetros inválidos" });

    let url;
    switch (tipo) {
      case "rg":
        url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`;
        break;
      case "cpf":
        url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`;
        break;
      case "telefone":
        url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`;
        break;
      default:
        return res.status(400).json({ erro: "Tipo inválido" });
    }

    const resposta = await fetch(url);
    const dados = await resposta.text(); // pode ser HTML ou JSON
    res.send(dados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
