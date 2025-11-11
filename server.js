import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// URLs das APIs reais
const apis = {
  apiserasacpf2025: "https://apis-brasil.shop/apis/apiserasacpf2025.php",
  apirgcadsus: "https://apis-brasil.shop/apis/apirgcadsus.php",
  apitelcredilink2025: "https://apis-brasil.shop/apis/apitelcredilink2025.php",
};

// Função para escolher a API conforme o parâmetro "endpoint"
app.get("/", async (req, res) => {
  try {
    const { cpf, rg, telefone, endpoint } = req.query;

    // Define a URL de destino
    const baseUrl = apis[endpoint];
    if (!baseUrl) {
      return res.status(400).json({ erro: "Endpoint inválido ou não especificado." });
    }

    // Monta a URL completa de acordo com o tipo de consulta
    let targetUrl = baseUrl;
    if (cpf) targetUrl += `?cpf=${cpf}`;
    else if (rg) targetUrl += `?rg=${rg}`;
    else if (telefone) targetUrl += `?telefone=${telefone}`;
    else return res.status(400).json({ erro: "Parâmetro de consulta ausente." });

    // Faz a requisição à API original
    const response = await fetch(targetUrl);

    // Pega o texto original (para caso não seja JSON puro)
    const text = await response.text();

    // Tenta converter para JSON
    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch {
      console.error("⚠️ Retorno não JSON:", text);
      return res.status(200).json({
        status: "erro",
        mensagem: "A API de destino retornou texto não JSON.",
        retorno_original: text,
      });
    }
  } catch (err) {
    console.error("❌ Erro no proxy:", err);
    return res.status(500).json({ erro: "Erro interno no servidor proxy." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor proxy rodando na porta ${PORT}`);
});
