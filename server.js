import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 🧠 Função que transforma o retorno texto em JSON estruturado
function formatarResposta(texto) {
  if (!texto) return { erro: "Sem retorno" };

  // Tenta parsear JSON direto
  try {
    return JSON.parse(texto);
  } catch (_) {}

  const obj = {
    sucesso: false,
    mensagem: "",
    dados_pessoais: {},
    telefones: [],
    enderecos: [],
    score: {},
    parentes: []
  };

  // Extrai status e mensagem geral
  const sucessoMatch = texto.match(/SUCESSO:\s*(\w+)/i);
  const mensagemMatch = texto.match(/MENSAGEM:\s*(.+?)(?=DADOS:|$)/is);
  if (sucessoMatch) obj.sucesso = sucessoMatch[1].toLowerCase() === "true";
  if (mensagemMatch) obj.mensagem = mensagemMatch[1].trim();

  // --- DADOS PESSOAIS ---
  const dadosPessoaisRegex = /CPF:\s*([\d]+).*?NOME:\s*([A-Z\s]+).*?NASC:\s*([\d\-: ]+).*?NOME_MAE:\s*([A-Z\s]+).*?RG:\s*(\d+).*?UF_EMISSAO:\s*([A-Z]{2})/is;
  const matchDados = texto.match(dadosPessoaisRegex);
  if (matchDados) {
    obj.dados_pessoais = {
      cpf: matchDados[1],
      nome: matchDados[2].trim(),
      nascimento: matchDados[3].trim(),
      mae: matchDados[4].trim(),
      rg: matchDados[5],
      uf_emissao: matchDados[6],
    };
  }

  // --- TELEFONES ---
  const telefonesRegex = /DDD:\s*(\d{2})\s*\|\s*TELEFONE:\s*(\d+).*?CLASSIFICACAO:\s*([A-Z0-9]+)/g;
  let tel;
  while ((tel = telefonesRegex.exec(texto)) !== null) {
    obj.telefones.push({
      ddd: tel[1],
      numero: tel[2],
      classificacao: tel[3],
    });
  }

  // --- ENDEREÇOS ---
  const enderecosRegex = /LOGR_TIPO:\s*(\w+)\s*\|\s*LOGR_NOME:\s*([^|]+)\|\s*LOGR_NUMERO:\s*(\d+).*?BAIRRO:\s*([^|]+)\|\s*CIDADE:\s*([^|]+)\|\s*UF:\s*([A-Z]{2})\s*\|\s*CEP:\s*(\d{8})/g;
  let end;
  while ((end = enderecosRegex.exec(texto)) !== null) {
    obj.enderecos.push({
      tipo: end[1],
      logradouro: end[2].trim(),
      numero: end[3],
      bairro: end[4].trim(),
      cidade: end[5].trim(),
      uf: end[6],
      cep: end[7],
    });
  }

  // --- SCORE ---
  const scoreRegex = /CSB8:\s*(\d+)\s*\|\s*CSB8_FAIXA:\s*([A-ZÇ]+)/i;
  const matchScore = texto.match(scoreRegex);
  if (matchScore) {
    obj.score = {
      valor: matchScore[1],
      faixa: matchScore[2],
    };
  }

  // --- PARENTES ---
  const parentesRegex = /CPF_VINCULO:\s*(\d+)\s*\|\s*NOME_VINCULO:\s*([A-Z\s]+)/g;
  let par;
  while ((par = parentesRegex.exec(texto)) !== null) {
    obj.parentes.push({
      cpf_vinculo: par[1],
      nome_vinculo: par[2].trim(),
    });
  }

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
    res.json(formatarResposta(dados));
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
    res.json(formatarResposta(dados));
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
    res.json(formatarResposta(dados));
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
    res.json(formatarResposta(dados));
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
    res.json(formatarResposta(dados));
  } catch (erro) {
    res.status(500).json({ erro: "Erro na consulta E-mail", detalhe: erro.message });
  }
});

// Inicialização
app.listen(PORT, () => console.log(`🟣 Servidor proxy Dark Aurora ativo na porta ${PORT}`));