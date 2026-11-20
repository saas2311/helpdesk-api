import express from "express";
import chamadosRouter from "./routes/chamados.js";

const app = express();
const porta = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    mensagem: "API de chamados está funcionando.",
    rotas: [
      "GET /chamados",
      "GET /chamados/:id",
      "POST /chamados",
      "PUT /chamados/:id",
      "DELETE /chamados/:id"
    ]
  });
});

app.use("/chamados", chamadosRouter);

app.use((req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada."
  });
});

app.use((erro, _req, res, _next) => {
  if (erro instanceof SyntaxError && "body" in erro) {
    return res.status(400).json({
      erro: "O corpo da requisição contém JSON inválido."
    });
  }

  console.error(erro);

  return res.status(500).json({
    erro: "Erro interno do servidor."
  });
});

app.listen(porta, "0.0.0.0", () => {
  console.log(`API rodando em http://localhost:${porta}`);
});