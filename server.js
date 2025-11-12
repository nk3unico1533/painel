import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🟣 Função auxiliar: formata objetos aninhados para texto legível
function formatarObjeto(obj) {
  if (obj === null || obj === undefined) return "";
  if (typeof obj === "string") return obj;
  if (Array.isArray(obj)) return obj.map(formatarObjeto).join(", ");
  if (typeof obj === "object") {
    return Object.entries(obj)
      .map(([chave, valor]) => `${chave.toUpperCase()}: ${formatarObjeto(valor)}`)
      .join(" | ");
  }
  return String(obj);
}

// 🟣 Função auxiliar: tenta converter resposta em JSON, ou formata texto bruto
async function tratarResposta(resposta) {
  const texto = await resposta.text();
  try {
    const json = JSON.parse(texto);

    // 🔹 Se for objeto válido, expande para texto legível
    const formatado = formatarObjeto(json);

    return {
      sucesso: true,
      mensagem: "Consulta concluída",
      dados: formatado,
    };
  } catch {
    // 🔹 Se não for JSON, retorna mensagem padronizada
    return {
      sucesso: false,
      mensagem: "Retorno inválido",
      retorno_original: texto.trim(),
    };
  }
}

// 🟣 CPF
app.get("/apiserasacpf2025", async (req, res) => {
  const { cpf } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${cpf}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta CPF", detalhe: erro.message });
  }
});

// 🟣 RG
app.get("/apirgcadsus", async (req, res) => {
  const { rg } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apirgcadsus.php?rg=${rg}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta RG", detalhe: erro.message });
  }
});

// 🟣 Telefone
app.get("/apitelcredilink2025", async (req, res) => {
  const { telefone } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${telefone}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Telefone", detalhe: erro.message });
  }
});

// 🟣 Placa
app.get("/apiplacabvdetran", async (req, res) => {
  const { placa } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${placa}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Placa", detalhe: erro.message });
  }
});

// 🟣 Nome
app.get("/apiserasanome2025", async (req, res) => {
  const { nome } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${encodeURIComponent(nome)}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta Nome", detalhe: erro.message });
  }
});

// 🟣 E-mail
app.get("/apiserasaemail2025", async (req, res) => {
  const { email } = req.query;
  try {
    const resposta = await fetch(`https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${encodeURIComponent(email)}`);
    const dados = await tratarResposta(resposta);
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta E-mail", detalhe: erro.message });
  }
});

// Inicialização
app.listen(PORT, () => console.log(`🟣 Servidor proxy Dark Aurora ativo na porta ${PORT}`));
