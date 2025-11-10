import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/consulta", async (req, res) => {
  const { tipo, valor } = req.query;

  try {
    let url;
    if (tipo === "rg") url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`;
    else if (tipo === "cpf") url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`;
    else if (tipo === "telefone") url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`;
    else return res.status(400).json({ erro: "Tipo inválido" });

    const response = await fetch(url);
    const data = await response.text();
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");

    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao consultar" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
