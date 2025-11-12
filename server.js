import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🟣 Consulta CPF
app.get("/apiserasacpf2025", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta CPF", detalhe: erro.message });
  }
});

// 🟣 Consulta RG
app.get("/apirgcadsus", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta RG", detalhe: erro.message });
  }
});

// 🟣 Consulta Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta Telefone", detalhe: erro.message });
  }
});

// 🟣 Consulta Placa (corrigido para apiplacabvdetran.php)
app.get("/apiplacacredlink2025", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${valor}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta Placa", detalhe: erro.message });
  }
});

// 🟣 Consulta Nome (corrigido para apiserasanome2025.php)
app.get("/apinomecredlink2025", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${encodeURIComponent(valor)}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta Nome", detalhe: erro.message });
  }
});

// 🟣 Consulta E-mail (corrigido para apiserasaemail2025.php)
app.get("/apiemailcredlink2025", async (req, res) => {
  const { valor } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${encodeURIComponent(valor)}`);
    const dados = await resposta.text();
    res.send(dados);
  } catch (erro) {
    res.status(500).send({ erro: "Erro na consulta E-mail", detalhe: erro.message });
  }
});

// 🟣 Inicialização Render
app.listen(PORT, () => console.log(`🟣 Servidor proxy ativo e estável na porta ${PORT}`));
