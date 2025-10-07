import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "https://psigiovana.github.io";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || "psigiovana/contratos-assinados";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";

if (!GITHUB_TOKEN) {
  console.error("Falta a variável de ambiente GITHUB_TOKEN. Defina-a antes de iniciar o servidor.");
  process.exit(1);
}

// CORS: permita apenas o frontend (ou "*" se preferir liberar geral)
app.use(cors({
  origin: FRONTEND_ORIGIN
}));

app.use(express.json({ limit: "30mb" })); // ajuste se precisar aceitar arquivos maiores

// rota de health
app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/upload", async (req, res) => {
  try {
    const { nomeArquivo, conteudoBase64 } = req.body;
    if (!nomeArquivo || !conteudoBase64) {
      return res.status(400).json({ error: "nomeArquivo e conteudoBase64 são obrigatórios." });
    }

    // checar tamanho aproximado (base64 -> bytes aproximados)
    const approxBytes = Math.ceil(conteudoBase64.length * 3 / 4);
    // GitHub limita arquivos a ~100 MB; deixamos margem
    if (approxBytes > 95 * 1024 * 1024) {
      return res.status(413).json({ error: "Arquivo muito grande para enviar ao GitHub (limite ~95MB)." });
    }

    const path = `contratos/${nomeArquivo}`;
    const url = `https://api.github.com/repos/${GITHUB_REPO}/contents/${encodeURIComponent(path)}`;

    // 1) checar se o arquivo já existe (para obter sha e então atualizar)
    const getResp = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json"
      }
    });

    let sha;
    if (getResp.ok) {
      const getJson = await getResp.json();
      sha = getJson.sha; // se existir, precisamos do sha para atualizar
    }

    // 2) PUT para criar/atualizar
    const body = {
      message: `Adicionando contrato: ${nomeArquivo}`,
      content: conteudoBase64,
      branch: GITHUB_BRANCH
    };
    if (sha) body.sha = sha;

    const putResp = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const putJson = await putResp.json();
    if (!putResp.ok) {
      console.error("GitHub API retornou erro:", putJson);
      return res.status(500).json({ error: "Erro da GitHub API", details: putJson });
    }

    // sucesso
    return res.json({ ok: true, resultado: putJson });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Permitindo origem: ${FRONTEND_ORIGIN}`);
});
