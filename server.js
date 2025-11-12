import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ===== Rotas Proxy =====
const rotas = {
  cpf: "https://apiserasacpf2025.vercel.app",
  rg: "https://apirgcadsus.vercel.app",
  telefone: "https://apitelcredilink2025.vercel.app",
  nome: "https://apiserasacpf2025.vercel.app",
  placa: "https://apirgcadsus.vercel.app",
  email: "https://apitelcredilink2025.vercel.app"
};

// ===== Proxy universal =====
Object.keys(rotas).forEach((tipo) => {
  app.get(`/${tipo}`, async (req, res) => {
    const valor = req.query.valor;
    if (!valor) {
      return res.status(400).json({ erro: "Parâmetro 'valor' ausente." });
    }

    const url = `${rotas[tipo]}?${tipo}=${encodeURIComponent(valor)}`;
    console.log(`🔍 Consultando: ${url}`);

    try {
      const resposta = await fetch(url);
      const texto = await resposta.text();

      // Parser seguro para JSON parcial
      const jsonMatch = texto.match(/\{[\s\S]*\}/);
      const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : { erro: "Retorno inválido", retorno_original: texto };

      res.json(jsonData);
    } catch (e) {
      res.status(500).json({ erro: "Falha na consulta", detalhe: e.message });
    }
  });
});

app.listen(PORT, () => console.log(`✅ Proxy ativo na porta ${PORT}`));
