import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HIST_FILE = path.join(__dirname, "historico.json");
const PUBLIC_DIR = path.join(__dirname, "public");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Servir arquivos estáticos (admin.html, dashboard.html, etc)
app.use(express.static(PUBLIC_DIR));

// Cria o histórico se não existir
if (!fs.existsSync(HIST_FILE)) fs.writeFileSync(HIST_FILE, "[]", "utf-8");

let contadores = { basica: 0, datasus: 0, full: 0, telefone: 0 };

function salvarHistorico(tipo, valor, status) {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  historico.unshift({
    tipo,
    valor,
    status,
    data: new Date().toLocaleString("pt-BR"),
  });
  fs.writeFileSync(HIST_FILE, JSON.stringify(historico, null, 2), "utf-8");
  if (contadores[tipo] !== undefined) contadores[tipo]++;
}

app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀", contadores });
});

// 🔹 Admin painel
app.get("/admin", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "admin.html"));
});

// 🔹 Login simples
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "darkaurora123";

app.post("/admin-login", (req, res) => {
  const { senha } = req.body;
  if (senha === ADMIN_PASSWORD) {
    res.redirect("/dashboard");
  } else {
    res.status(401).send("<h1>Senha incorreta!</h1>");
  }
});

// 🔹 Dashboard (arquivo dentro de /public)
app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "dashboard.html"));
});

// 🔹 Proxy das consultas
app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  const apis = {
    basica: `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`,
    datasus: `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`,
    full: `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`,
    telefone: `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`,
  };
  const url = apis[tipo];
  if (!url) return res.status(400).json({ erro: "Tipo inválido" });

  try {
    const r = await fetch(url);
    const texto = await r.text();
    const limpo = texto.replace(/Aviso:[^[]*|\s*Aviso:[^{]*/gi, "").trim();
    try {
      const json = JSON.parse(limpo);
      salvarHistorico(tipo, valor, "✅ Sucesso");
      return res.json(json);
    } catch {
      salvarHistorico(tipo, valor, "⚠️ Texto bruto");
      return res.type("text").send(limpo);
    }
  } catch (e) {
    salvarHistorico(tipo, valor, "❌ Erro");
    res.status(500).json({ erro: e.message });
  }
});

// 🔹 Histórico
app.get("/historico", (req, res) => {
  res.json(JSON.parse(fs.readFileSync(HIST_FILE, "utf-8")));
});

app.listen(PORT, () => {
  console.log(chalk.bgMagentaBright(`🚀 Dark Aurora Private rodando na porta ${PORT}`));
});
