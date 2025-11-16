// Dark Aurora — API PROXY DEFINITIVO
// Todas as rotas atualizadas conforme solicitado

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// Função padrão de proxy
async function proxy(res, url) {
  try {
    const r = await fetch(url);
    const text = await r.text();
    return res.send(text);
  } catch (e) {
    return res.status(500).send("Erro no Proxy: " + e.message);
  }
}

/* ===========================
      CPF
=========================== */

// FULL
app.get("/cpf/full", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${req.query.cpf}`
  )
);

// HARD
app.get("/cpf/hard", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apicpfbigdata2025.php?CPF=${req.query.cpf}`
  )
);

// LOW
app.get("/cpf/low", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apiassecc2025.php?cpf=${req.query.cpf}`
  )
);

// 45M
app.get("/cpf/45m", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apicpf43malgar.php?cpf=${req.query.cpf}`
  )
);

// DETRAN
app.get("/cpf/detran", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apicpfbvdetran.php?cpf=${req.query.cpf}`
  )
);



/* ===========================
      TELEFONE
=========================== */

// FULL
app.get("/telefone/full", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${req.query.telefone}`
  )
);

// OP1 (10 dígitos)
app.get("/telefone/op1", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apitel1cadsus.php?telefone=${req.query.telefone}`
  )
);

// OP2 (10 dígitos)
app.get("/telefone/op2", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apitel2cadsus.php?telefone2=${req.query.telefone}`
  )
);



/* ===========================
      RG
=========================== */

app.get("/rg", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${req.query.rg}`
  )
);



/* ===========================
      CNPJ
=========================== */

app.get("/cnpj", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apicnpj35rais2019.php?cnpj=${req.query.cnpj}`
  )
);



/* ===========================
      EMAIL
=========================== */

app.get("/email", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${req.query.email}`
  )
);



/* ===========================
      NOME
=========================== */

// OP1
app.get("/nome/op1", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${req.query.nome}`
  )
);

// OP2
app.get("/nome/op2", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apinomefotoma.php?nome=${req.query.nome}`
  )
);



/* ===========================
      PLACA
=========================== */

app.get("/placa", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${req.query.placa}`
  )
);



/* ===========================
      CEP
=========================== */

app.get("/cep", (req, res) =>
  proxy(
    res,
    `https://apis-brasil.shop/apis/apicep43malgar.php?cep=${req.query.cep}`
  )
);



/* ===========================
      START SERVER
=========================== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Dark Aurora — API Proxy ONLINE ✔")
);