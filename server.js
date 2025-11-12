import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ===== Rotas Proxy =====
app.get("/:tipo", async (req, res) => {
  const { tipo } = req.params;
  const { valor } = req.query;

  if (!valor) {
    return res.status(400).json({ erro: "Parâmetro 'valor' ausente." });
  }

  const urls = {
    cpf: "https://apiserasacpf2025.vercel.app",
    rg: "https://apirgcadsus.vercel.app",
    telefone: "https://apitelcredilink2025.vercel.app",
    nome: "https://apiserasacpf2025.vercel.app",
    placa: "https://apirgcadsus.vercel.app",
    email: "https://apitelcredilink2025.vercel.app"
  };

  const destino = urls[tipo];
  if (!destino) {
    return res.status(404).json({ erro: "Tipo de consulta inválido." });
  }

  try {
    const response = await fetch(`${destino}?${tipo}=${encodeURIComponent(valor)}`);
    const text = await response.text();

    // Parser inteligente: extrai JSON mesmo se houver texto extra
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : { erro: "Retorno inválido", retorno_original: text };

    res.json(jsonData);
  } catch (error) {
    res.status(500).json({ erro: "Falha ao processar consulta", detalhe: error.message });
  }
});

app.listen(PORT, () => console.log(`✅ Servidor proxy ativo na porta ${PORT}`));
