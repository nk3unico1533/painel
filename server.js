import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import chalk from "chalk";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const HIST_FILE = path.join(__dirname, "historico.json");
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "darkaurora"; // 🔐 senha do painel admin

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 🔹 Garante que o arquivo de histórico exista
if (!fs.existsSync(HIST_FILE)) fs.writeFileSync(HIST_FILE, "[]", "utf-8");

// 🔹 Contadores
let contadores = { basica: 0, datasus: 0, full: 0, telefone: 0 };

// 🔹 Funções auxiliares
function salvarHistorico(tipo, valor, status) {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  const registro = { tipo, valor, status, data: new Date().toLocaleString("pt-BR") };
  historico.unshift(registro);
  fs.writeFileSync(HIST_FILE, JSON.stringify(historico, null, 2), "utf-8");
  if (contadores[tipo] !== undefined) contadores[tipo]++;
  mostrarLog(tipo, valor, status);
}

function mostrarLog(tipo, valor, status) {
  const cores = {
    basica: chalk.magentaBright,
    datasus: chalk.cyanBright,
    full: chalk.greenBright,
    telefone: chalk.yellowBright,
  };
  const cor = cores[tipo] || chalk.white;
  console.log(
    cor(`[${new Date().toLocaleTimeString()}] ${tipo.toUpperCase()} → ${valor} → ${status}`)
  );
}

// 🔹 Rotas principais
app.get("/", (req, res) => {
  res.json({ status: "Dark Aurora Proxy rodando com sucesso 🚀", contadores });
});

app.get("/status", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json({
    totalConsultas: historico.length,
    porTipo: contadores,
    ultimaAtualizacao: new Date().toLocaleString("pt-BR"),
  });
});

app.get("/historico", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json(historico);
});

// 🔹 Proxy principal
app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  if (!tipo || !valor) return res.status(400).json({ erro: "Parâmetros inválidos" });

  const apis = {
    basica: `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`,
    datasus: `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`,
    full: `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`,
    telefone: `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`,
  };

  const url = apis[tipo];
  if (!url) return res.status(400).json({ erro: "Tipo inválido" });

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    const limpo = texto.replace(/Aviso:[^[]*|\s*Aviso:[^{]*/gi, "").trim();

    try {
      const json = JSON.parse(limpo);
      salvarHistorico(tipo, valor, "✅ Sucesso");
      res.json(json);
    } catch {
      salvarHistorico(tipo, valor, "⚠️ Texto bruto");
      res.type("text").send(limpo || "Sem dados válidos.");
    }
  } catch (err) {
    salvarHistorico(tipo, valor, "❌ Erro");
    res.status(500).json({ erro: "Erro ao consultar API", detalhes: err.message });
  }
});

// 🔹 Painel admin (HTML protegido)
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

// 🔹 Endpoint protegido
app.get("/admin-data", (req, res) => {
  const senha = req.query.senha;
  if (senha !== ADMIN_PASSWORD) return res.status(403).json({ erro: "Acesso negado" });
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json(historico);
});

app.listen(PORT, () => {
  console.log(chalk.bold.bgMagentaBright(`🚀 Dark Aurora Proxy rodando na porta ${PORT}`));
});
