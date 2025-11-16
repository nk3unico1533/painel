// Dark Aurora — API PROXY DEFINITIVO
// Versão CommonJS — COMPATÍVEL COM QUALQUER NODE

const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());

async function proxy(res, url) {
  try {
    fetch(url)
      .then(r => r.text())
      .then(text => res.send(text))
      .catch(e => res.status(500).send("Erro no Proxy: " + e.message));
  } catch (e) {
    return res.status(500).send("Erro no Proxy: " + e.message);
  }
}

/* ===========================
      CPF
=========================== */

app.get("/cpf/full", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/hard", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpfbigdata2025.php?CPF=${req.query.cpf}`
  )
);

app.get("/cpf/low", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiassecc2025.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/45m", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpf43malgar.php?cpf=${req.query.cpf}`
  )
);

app.get("/cpf/detran", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicpfbvdetran.php?cpf=${req.query.cpf}`
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

app.get("/telefone/op1", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel1cadsus.php?telefone=${req.query.telefone}`
  )
);

app.get("/telefone/op2", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apitel2cadsus.php?telefone2=${req.query.telefone}`
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
      CNPJ
=========================== */

app.get("/cnpj", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicnpj35rais2019.php?cnpj=${req.query.cnpj}`
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
      NOME
=========================== */

app.get("/nome/op1", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apiserasanome2025.php?nome=${req.query.nome}`
  )
);

app.get("/nome/op2", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apinomefotoma.php?nome=${req.query.nome}`
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
      CEP
=========================== */

app.get("/cep", (req, res) =>
  proxy(res,
    `https://apis-brasil.shop/apis/apicep43malgar.php?cep=${req.query.cep}`
  )
);


/* ===========================
      START
=========================== */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Dark Aurora — API Proxy ONLINE ✔ (CommonJS Mode)");
});