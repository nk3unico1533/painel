import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Habilita CORS
app.use(cors());
app.use(express.json());

// ✅ Logs de requisições
app.use((req, res, next) => {
  console.log(`📥 Nova requisição recebida: ${req.method} ${req.url}`);
  next();
});

// ✅ Função auxiliar para tratar respostas que não são JSON
async function parseJSONSafe(response) {
  try {
    return await response.json();
  } catch (e) {
    const text = await response.text();
    // Verifica se o conteúdo é HTML de erro 1033 ou similar
    if (text.includes("1033") || text.includes("<html")) {
      return {
        status: "erro",
        mensagem: "A API de destino retornou uma página HTML (provável erro 1033 ou bloqueio).",
        retorno_original: text.slice(0, 500) + "...",
      };
    }
    return {
      status: "erro",
      mensagem: "A API de destino retornou texto não JSON.",
      retorno_original: text.slice(0, 500) + "...",
    };
  }
}

// ✅ Rota principal de proxy universal
app.get("/", async (req, res) => {
  const { cpf, valor, endpoint } = req.query;

  if (!endpoint) {
    return res.status(400).json({
      status: "erro",
      mensagem: "Parâmetro 'endpoint' é obrigatório.",
    });
  }

  // 🔗 Monta URL da API real
  let urlDestino;
  if (cpf) {
    urlDestino = `https://api-publica-externa.com/${endpoint}?cpf=${cpf}`;
  } else if (valor) {
    urlDestino = `https://api-publica-externa.com/${endpoint}?valor=${valor}`;
  } else {
    return res.status(400).json({
      status: "erro",
      mensagem: "Parâmetro 'cpf' ou 'valor' é obrigatório.",
    });
  }

  console.log("🔹 Chamando endpoint:", urlDestino);

  try {
    const resposta = await fetch(urlDestino, {
      headers: {
        "User-Agent": "DarkAuroraProxy/1.0",
      },
      timeout: 20000, // 20 segundos
    });

    const data = await parseJSONSafe(resposta);
    res.json(data);
  } catch (erro) {
    console.error("❌ Erro ao consultar API:", erro.message);
    res.status(500).json({
      status: "erro",
      mensagem: "Erro interno ao conectar com a API de destino.",
      detalhe: erro.message,
    });
  }
});

// ✅ Página de status
app.get("/status", (req, res) => {
  res.json({ status: "ok", versao: "Dark Aurora Proxy v2.8", hora: new Date().toISOString() });
});

// ✅ Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Dark Aurora Proxy rodando na porta ${PORT}`);
});
