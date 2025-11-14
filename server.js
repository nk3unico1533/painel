// Dark Aurora Proxy – versão corrigida
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BASE = "https://apis-brasil.shop/apis";

// 🔥 Lista de endpoints corretos
const routes = {
  // CPF
  cpf_full: "apiserasacpf2025.php?cpf=",
  cpf_hard: "apicpfcredilink2025.php?cpf=",
  cpf_low: "apicpfdatasus.php?cpf=",
  cpf_detran: "apicpfbvdetran.php?cpf=",
  cpf_35m: "apicpf35rais2019.php?cpf=",
  cnpj: "apicnpj35rais2019.php?cnpj=",

  // RG
  rg: "apirgcadsus.php?rg=",

  // PLACA
  placa: "apiplacabvdetran.php?placa=",

  // TELEFONE
  tel_full: "apitelcredilink2025.php?telefone=",
  tel_hard: "apitel1cadsus.php?telefone=",
  tel_low: "apitel1cadsus.php?telefone=",
  tel_op1: "apitel2cadsus.php?telefone2=",
  tel_op2: "apitel3cadsus.php?telefone3=",

  // NOME
  nome1: "apinomefotoma.php?nome=",
  nome2: "apiserasanome2025.php?nome=",

  // EMAIL
  email: "apiserasaemail2025.php?email="
};

// 🔥 Proxy universal
app.get("/proxy", async (req, res) => {
  try {
    const rota = req.query.route;
    const valor = req.query.value;

    if (!rota || !valor)
      return res.status(400).json({ error: "Parâmetros route e value são obrigatórios" });

    const endpoint = routes[rota];
    if (!endpoint)
      return res.status(400).json({ error: "Rota inválida" });

    const url = `${BASE}/${endpoint}${encodeURIComponent(valor)}`;

    console.log("➡️ Fetching:", url);

    const response = await fetch(url);
    const text = await response.text();

    // Tenta parsear JSON
    try {
      const json = JSON.parse(text);
      return res.json({ status: "ok", data: json });
    } catch (e) {
      // Retorna raw caso não seja JSON
      return res.json({ status: "raw", raw: text });
    }

  } catch (err) {
    console.error("Proxy ERROR:", err);
    res.status(500).json({
      error: "Erro no proxy",
      details: err.message
    });
  }
});

app.get("/", (req, res) => res.send("Dark Aurora - API Proxy ONLINE ✔"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🔥 Proxy online na porta:", PORT));