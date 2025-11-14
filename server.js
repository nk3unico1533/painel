// Dark Aurora — server.js v3.0 (Full Proxy)
// by nk
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const API_BASE = "https://painel-dwib.onrender.com";

// generic proxy
async function proxy(res, endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, { method: 'GET' });
    const text = await response.text();
    try { return res.json(JSON.parse(text)); } catch { return res.send(text); }
  } catch (error) {
    console.error("Proxy Error:", error);
    return res.status(500).json({ error: "Erro no proxy.", details: error.message });
  }
}

// CPF routes
app.get("/cpf/full", (req, res) => { const cpf = req.query.cpf || ""; proxy(res, `apiserasacpf2025.php?cpf=${cpf}`); });
app.get("/cpf/hard", (req, res) => { const cpf = req.query.cpf || ""; proxy(res, `apicpfcredilink2025.php?cpf=${cpf}`); });
app.get("/cpf/low", (req, res) => { const cpf = req.query.cpf || ""; proxy(res, `apicpfdatasus.php?cpf=${cpf}`); });
app.get("/cpf/detran", (req, res) => { const cpf = req.query.cpf || ""; proxy(res, `apicpfbvdetran.php?cpf=${cpf}`); });
app.get("/cpf/35m", (req, res) => { const cpf = req.query.cpf || ""; proxy(res, `apicpf35rais2019.php?cpf=${cpf}`); });
app.get("/cpf/cnpj", (req, res) => { const cnpj = req.query.cnpj || ""; proxy(res, `apicnpj35rais2019.php?cnpj=${cnpj}`); });

// RG
app.get("/rg", (req, res) => { const rg = req.query.rg || ""; proxy(res, `apirgcadsus.php?rg=${rg}`); });

// Telefone
app.get("/telefone/full", (req, res) => { const tel = req.query.telefone || ""; proxy(res, `apitelcredilink2025.php?telefone=${tel}`); });
app.get("/telefone/hard10", (req, res) => { const tel = req.query.telefone || ""; const ddd = tel.slice(0,2); const numero = tel.slice(2); proxy(res, `apitel43malgar.php?ddd=${ddd}&telefone=${numero}`); });
app.get("/telefone/low10", (req, res) => { const tel = req.query.telefone || ""; proxy(res, `apitel1cadsus.php?telefone=${tel}`); });
app.get("/telefone/op1", (req, res) => { const tel = req.query.telefone || ""; proxy(res, `apitel2cadsus.php?telefone2=${tel}`); });
app.get("/telefone/op2", (req, res) => { const tel = req.query.telefone || ""; proxy(res, `apitel3cadsus.php?telefone3=${tel}`); });

// Placa
app.get("/placa", (req, res) => { const placa = req.query.placa || ""; proxy(res, `apiplacabvdetran.php?placa=${placa}`); });

// Nome
app.get("/nome/op1", (req, res) => { const nome = req.query.nome || ""; proxy(res, `apiserasanome2025.php?nome=${nome}`); });
app.get("/nome/op2", (req, res) => { const nome = req.query.nome || ""; proxy(res, `apinomefotoma.php?nome=${nome}`); });

// Email
app.get("/email", (req, res) => { const email = req.query.email || ""; proxy(res, `apiserasaemail2025.php?email=${email}`); });

app.get("/", (req, res) => res.send("Dark Aurora - API Proxy ONLINE ✔"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ON → Porta ${PORT}`));
