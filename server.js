// Dark Aurora — server.js v3.0 (Full Proxy)
// by nk
// Totalmente compatível com Render + script.js atualizado

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Base oficial das APIs
const API_BASE = "https://apis-brasil.shop/apis/";

// Função genérica para proxiar requisições
async function proxy(req, res, endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const text = await response.text();

    // tentar JSON, se não for, devolver texto mesmo
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: "Erro no proxy.", details: error.message });
  }
}

// -----------------------------------------------------------
// CPF — Full
app.get("/cpf/full", (req, res) => {
  const cpf = req.query.cpf || "";
  proxy(req, res, `apiserasacpf2025.php?cpf=${cpf}`);
});

// CPF — Hard
app.get("/cpf/hard", (req, res) => {
  const cpf = req.query.cpf || "";
  proxy(req, res, `apicpfcredilink2025.php?cpf=${cpf}`);
});

// CPF — Low
app.get("/cpf/low", (req, res) => {
  const cpf = req.query.cpf || "";
  proxy(req, res, `apicpfdatasus.php?cpf=${cpf}`);
});

// CPF — DETRAN (9 dígitos)
app.get("/cpf/detran", (req, res) => {
  const cpf = req.query.cpf || "";
  proxy(req, res, `apicpfbvdetran.php?cpf=${cpf}`);
});

// CPF — 35M
app.get("/cpf/35m", (req, res) => {
  const cpf = req.query.cpf || "";
  proxy(req, res, `apicpf35rais2019.php?cpf=${cpf}`);
});

// CNPJ (35M)
app.get("/cpf/cnpj", (req, res) => {
  const cnpj = req.query.cnpj || "";
  proxy(req, res, `apicnpj35rais2019.php?cnpj=${cnpj}`);
});

// -----------------------------------------------------------
// RG — padrão
app.get("/rg", (req, res) => {
  const rg = req.query.rg || "";
  proxy(req, res, `apirgcadsus.php?rg=${rg}`);
});

// -----------------------------------------------------------
// TELEFONE — Full
app.get("/telefone/full", (req, res) => {
  const tel = req.query.telefone || "";
  proxy(req, res, `apitelcredilink2025.php?telefone=${tel}`);
});

// TELEFONE — Hard 10 dígitos
app.get("/telefone/hard10", (req, res) => {
  const tel = req.query.telefone || "";
  const ddd = tel.slice(0, 2);
  const numero = tel.slice(2);
  proxy(req, res, `apitel43malgar.php?ddd=${ddd}&telefone=${numero}`);
});

// TELEFONE — Low 10 dígitos
app.get("/telefone/low10", (req, res) => {
  const tel = req.query.telefone || "";
  proxy(req, res, `apitel1cadsus.php?telefone=${tel}`);
});

// TELEFONE — Opção 1 (10 dígitos)
app.get("/telefone/op1", (req, res) => {
  const tel = req.query.telefone || "";
  proxy(req, res, `apitel2cadsus.php?telefone2=${tel}`);
});

// TELEFONE — Opção 2 (10 dígitos)
app.get("/telefone/op2", (req, res) => {
  const tel = req.query.telefone || "";
  proxy(req, res, `apitel3cadsus.php?telefone3=${tel}`);
});

// -----------------------------------------------------------
// PLACA
app.get("/placa", (req, res) => {
  const placa = req.query.placa || "";
  proxy(req, res, `apiplacabvdetran.php?placa=${placa}`);
});

// -----------------------------------------------------------
// NOME — Opção 1
app.get("/nome/op1", (req, res) => {
  const nome = req.query.nome || "";
  proxy(req, res, `apiserasanome2025.php?nome=${nome}`);
});

// NOME — Opção 2
app.get("/nome/op2", (req, res) => {
  const nome = req.query.nome || "";
  proxy(req, res, `apinomefotoma.php?nome=${nome}`);
});

// -----------------------------------------------------------
// EMAIL
app.get("/email", (req, res) => {
  const email = req.query.email || "";
  proxy(req, res, `apiserasaemail2025.php?email=${email}`);
});

// -----------------------------------------------------------
app.get("/", (req, res) => {
  res.send("Dark Aurora - API Proxy ONLINE ✔");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ON → Porta ${PORT}`));