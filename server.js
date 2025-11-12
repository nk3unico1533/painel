import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🔗 Rotas das APIs externas
const rotas = {
  cpf: "https://apiserasacpf2025.vercel.app",
  rg: "https://apirgcadsus.vercel.app",
  telefone: "https://apitelcredilink2025.vercel.app",
  nome: "https://apinome2025.vercel.app",
  placa: "https://apiplaca2025.vercel.app",
  email: "https://apiemail2025.vercel.app"
};

// 🔧 Proxy inteligente
app.get("/:api", async (req, res) => {
  try {
    const tipo = req.params.api.replace("api", "").toLowerCase();
    const valor = req.query.valor;

    if (!rotas[tipo]) {
      return res.status(400).json({ erro: "Tipo de consulta inválido" });
    }

    // 🔧 Correção: parâmetros certos para cada tipo de consulta
    const parametro =
      tipo === "cpf" ? "cpf" :
      tipo === "rg" ? "rg" :
      tipo === "telefone" ? "telefone" :
      tipo === "nome" ? "nome" :
      tipo === "placa" ? "placa" :
      tipo === "email" ? "email" : "valor";

    const url = `${rotas[tipo]}?${parametro}=${encodeURIComponent(valor)}`;
    const resposta = await fetch(url);
    const texto = await resposta.text();

    let dados;
    try {
      dados = JSON.parse(texto);
    } catch {
      dados = { erro: "Retorno inválido", retorno_original: texto };
    }

    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro interno no servidor", detalhes: erro.message });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor proxy rodando na porta ${PORT}`));
