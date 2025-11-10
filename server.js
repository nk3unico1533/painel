import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HIST_FILE = path.join(__dirname, "historico.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // serve admin.html e outros arquivos

// 🔹 Garante que o arquivo de histórico exista
if (!fs.existsSync(HIST_FILE)) fs.writeFileSync(HIST_FILE, "[]", "utf-8");

// 🔹 Contadores de consultas
let contadores = {
  basica: 0,
  datasus: 0,
  full: 0,
  telefone: 0,
};

// 🔹 Função para salvar histórico
function salvarHistorico(tipo, valor, status) {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  const registro = {
    tipo,
    valor,
    status,
    data: new Date().toLocaleString("pt-BR"),
  };
  historico.unshift(registro);
  fs.writeFileSync(HIST_FILE, JSON.stringify(historico, null, 2), "utf-8");
  if (contadores[tipo] !== undefined) contadores[tipo]++;
  mostrarLog(tipo, valor, status);
}

// 🔹 Logs coloridos no console
function mostrarLog(tipo, valor, status) {
  const cores = {
    basica: chalk.magentaBright,
    datasus: chalk.cyanBright,
    full: chalk.greenBright,
    telefone: chalk.yellowBright,
  };
  const cor = cores[tipo] || chalk.white;
  console.log(
    cor(`[${new Date().toLocaleTimeString()}] ${tipo.toUpperCase()} → ${valor} → ${status}`)
  );
}

// 🔹 Rota inicial
app.get("/", (req, res) => {
  res.json({ status: "API Proxy rodando com sucesso 🚀", contadores });
});

// 🔹 Rota de status
app.get("/status", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json({
    totalConsultas: historico.length,
    porTipo: contadores,
    ultimaAtualizacao: new Date().toLocaleString("pt-BR"),
  });
});

// 🔹 Rota de histórico
app.get("/historico", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  res.json(historico);
});

app.post("/historico", (req, res) => {
  const { tipo, valor, status } = req.body;
  salvarHistorico(tipo, valor, status);
  res.json({ success: true });
});

// 🔹 Proxy principal das consultas
app.get("/consulta", async (req, res) => {
  const { tipo, valor } = req.query;
  if (!tipo || !valor) return res.status(400).json({ erro: "Parâmetros inválidos" });

  const apis = {
    basica: `https://apis-brasil.shop/apis/apirgcadsus.php?rg=${valor}`,
    datasus: `https://apis-brasil.shop/apis/apicpfdatasus.php?cpf=${valor}`,
    full: `https://apis-brasil.shop/apis/apiserasacpf2025.php?cpf=${valor}`,
    telefone: `https://apis-brasil.shop/apis/apitelcredilink2025.php?telefone=${valor}`,
  };

  const url = apis[tipo];
  if (!url) return res.status(400).json({ erro: "Tipo inválido" });

  try {
    const resposta = await fetch(url);
    const texto = await resposta.text();

    // 🔹 Remove mensagens de aviso e espaços extras
    const limpo = texto.replace(/Aviso:[^[]*|\s*Aviso:[^{]*/gi, "").trim();

    let json;
    try {
      json = JSON.parse(limpo);
      salvarHistorico(tipo, valor, "✅ Sucesso");
      return res.json(json);
    } catch {
      salvarHistorico(tipo, valor, "⚠️ Texto bruto");
      return res.type("text").send(limpo || "Sem dados válidos.");
    }
  } catch (err) {
    salvarHistorico(tipo, valor, "❌ Erro");
    res.status(500).json({ erro: "Erro ao consultar API", detalhes: err.message });
  }
});

// 🔹 Painel administrativo protegido
const ADMIN_PASSWORD = process.env.ADMIN_PASS || "darkaurora123";

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.post("/admin-login", express.urlencoded({ extended: true }), (req, res) => {
  const { senha } = req.body;
  if (senha === ADMIN_PASSWORD) {
    res.sendFile(path.join(__dirname, "dashboard.html"));
  } else {
    res.status(401).send("<h1>Senha incorreta!</h1>");
  }
});

// 🔹 Painel dashboard com dados (HTML simples)
app.get("/dashboard", (req, res) => {
  const historico = JSON.parse(fs.readFileSync(HIST_FILE, "utf-8"));
  const html = `
  <html lang="pt-BR">
  <head>
  <meta charset="UTF-8">
  <title>Dark Aurora Admin</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  </head>
  <body class="bg-gray-900 text-white p-6">
    <h1 class="text-3xl font-bold text-purple-400 mb-6">Painel Interno - Dark Aurora Private</h1>
    <canvas id="grafico" class="mb-8 bg-gray-800 p-4 rounded-lg"></canvas>
    <table class="w-full text-sm text-left text-gray-300">
      <thead class="text-xs uppercase bg-purple-700 text-white">
        <tr>
          <th class="px-4 py-3">Tipo</th>
          <th class="px-4 py-3">Valor</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Data</th>
        </tr>
      </thead>
      <tbody class="bg-gray-800">
        ${historico
          .map(
            (h) => `
          <tr>
            <td class="px-4 py-3">${h.tipo}</td>
            <td class="px-4 py-3">${h.valor}</td>
            <td class="px-4 py-3">${h.status}</td>
            <td class="px-4 py-3">${h.data}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <script>
      const ctx = document.getElementById('grafico').getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Básica', 'Datasus', 'Full', 'Telefone'],
          datasets: [{
            label: 'Consultas por tipo',
            data: [${contadores.basica}, ${contadores.datasus}, ${contadores.full}, ${contadores.telefone}],
            backgroundColor: ['#8b5cf6', '#06b6d4', '#22c55e', '#facc15']
          }]
        },
        options: { scales: { y: { beginAtZero: true } } }
      });
    </script>
  </body>
  </html>
  `;
  res.send(html);
});

// 🔹 Inicialização
app.listen(PORT, () => {
  console.log(chalk.bold.bgMagentaBright(`🚀 Dark Aurora Private By Nk rodando na porta ${PORT}`));
});
