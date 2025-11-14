// Dark Aurora — API PROXY DEFINITIVO
// Todas as rotas funcionando exatamente como o usuário pediu

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

async function proxy(res, url) {
  try {
    const r = await fetch(url);
    const text = await r.text();
    return res.send(text);
  } catch (e) {
    return res.status(500).json({
      error: "Erro no proxy.",
      details: e.message
    });
  }
}

/* ===========================
      ROTAS CPF
=========================== */
app.get("/cpf/full", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/hard", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpfcredilink2025.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/low", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/detran", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpfbvdetran.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/35m", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpf35rais2019.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/cnpj", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicnpj35rais2019.php?cnpj=${req.query.cnpj}`
  )
);

/* ===========================
      RG
=========================== */
app.get("/rg", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${req.query.rg}`
  )
);

/* ===========================
      TELEFONE
=========================== */
app.get("/telefone/full", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${req.query.telefone}`
  )
);

app.get("/telefone/hard10", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel1cadsus.php?telefone=${req.query.telefone}`
  )
);

app.get("/telefone/low10", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel1cadsus.php?telefone=${req.query.telefone}`
  )
);

app.get("/telefone/op1", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel2cadsus.php?telefone2=${req.query.telefone}`
  )
);

app.get("/telefone/op2", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel3cadsus.php?telefone3=${req.query.telefone}`
  )
);

/* ===========================
      PLACA
=========================== */
app.get("/placa", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiplacabvdetran.php?placa=${req.query.placa}`
  )
);

/* ===========================
      NOME
=========================== */
app.get("/nome/op1", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apinomefotoma.php?nome=${req.query.nome}`
  )
);

app.get("/nome/op2", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${req.query.nome}`
  )
);

/* ===========================
      EMAIL
=========================== */
app.get("/email", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiserasaemail2025.php?email=${req.query.email}`
  )
);

/* ===========================
      START SERVER
=========================== */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("Dark Aurora — API Proxy ONLINE ✔")
); 