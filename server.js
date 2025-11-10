import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const HIST_FILE = "./historico.json";

app.use(cors());
app.use(express.json());

// Garante que o arquivo de histórico existe
if (!fs.existsSync(HIST_FILE)) fs.writeFileSync(HIST_FILE, "[]", "utf-8");

// 🔹 Função para salvar histórico
function salvarHistorico(tipo, valor, status) {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  historico.unshift({
    tipo,
    valor,
    status,
    data: new Date().toLocaleString("pt-BR"),
  });
  fs.writeFileSync(HIST_FILE, JSON.stringify(historico, null, 2), "utf-8");
}

// 🔹 Rota de histórico (GET e POST)
app.get("/historico", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json(historico);
});

app.post("/historico", (req, res) => {
  const { tipo, valor, status } = req.body;
  salvarHistorico(tipo, valor, status);
  res.json({ success: true });
});

// 🔹 Rota principal de consulta
app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  if (!tipo || !valor) {
    return res.status(400).json({ erro: "Parâmetros inválidos" });
  }

  let url = "";
  switch (tipo) {
    case "basica":
      url = `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`;
      break;
    case "datasus":
      url = `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`;
      break;
    case "full":
      url = `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`;
      break;
    case "telefone":
      url = `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`;
      break;
    default:
      return res.status(400).json({ erro: "Tipo inválido" });
  }

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    // Remove qualquer "Aviso" que vem no início da resposta
    const limpo = texto.replace(/Aviso:[^[]*|\s*Aviso:[^{]*/gi, "").trim();

    // Tenta converter em JSON
    let json;
    try {
      json = JSON.parse(limpo);
      salvarHistorico(tipo, valor, "✅ Sucesso");
      return res.json(json);
    } catch {
      salvarHistorico(tipo, valor, "⚠️ Texto bruto");
      return res.type("text").send(limpo || "Sem dados válidos.");
    }
  } catch (err) {
    salvarHistorico(tipo, valor, "❌ Erro");
    res.status(500).json({ erro: "Erro ao consultar API", detalhes: err.message });
  }
});

// 🔹 Rota inicial
app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀" });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
