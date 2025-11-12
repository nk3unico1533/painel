import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧩 Função que tenta formatar os textos em JSON limpo
function formatarResposta(texto) {
  if (!texto) return { erro: "Sem retorno" };

  // Tenta converter se já for JSON
  try {
    return JSON.parse(texto);
  } catch (_) {}

  // Quebra em linhas ou " | " e organiza
  const partes = texto
    .split(/\s*\|\s*/g)
    .map(p => p.trim())
    .filter(p => p && !p.startsWith("DADOS:") && !p.startsWith("Outros"))
    .map(p => {
      const [chave, valor] = p.split(":").map(x => x?.trim());
      return chave && valor ? [chave.toLowerCase().replace(/\s+/g, "_"), valor] : null;
    })
    .filter(Boolean);

  const obj = Object.fromEntries(partes);
  return obj;
}

// 🟣 CPF
app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta CPF", detalhe: erro.message });
  }
});

// 🟣 RG
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta RG", detalhe: erro.message });
  }
});

// 🟣 Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Telefone", detalhe: erro.message });
  }
});

// 🟣 Placa
app.get("/apiplacabvdetran", async (req, res) => {
  const { placa } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${placa}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Placa", detalhe: erro.message });
  }
});

// 🟣 Nome
app.get("/apiserasanome2025", async (req, res) => {
  const { nome } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${encodeURIComponent(nome)}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Nome", detalhe: erro.message });
  }
});

// 🟣 E-mail
app.get("/apiserasaemail2025", async (req, res) => {
  const { email } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${encodeURIComponent(email)}`);
    const dados = await resposta.text();
    const formatado = formatarResposta(dados);
    res.json(formatado);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta E-mail", detalhe: erro.message });
  }
});

// Inicialização
app.listen(PORT, () => console.log(`🟣 Servidor proxy Dark Aurora ativo na porta ${PORT}`));
