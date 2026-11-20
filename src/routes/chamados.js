import { Router } from "express";
import { db } from "../database.js";

const router = Router();

const prioridadesPermitidas = ["baixa", "media", "alta"];
const statusPermitidos = ["aberto", "em_andamento", "concluido"];

function validarDados(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      erros: {
        corpo: "Envie os dados do chamado em um objeto JSON."
      }
    };
  }

  const erros = {};

  const titulo =
    typeof body.titulo === "string" ? body.titulo.trim() : "";

  const descricao =
    typeof body.descricao === "string" ? body.descricao.trim() : "";

  const prioridade = body.prioridade;
  const status = body.status;

  if (!titulo) {
    erros.titulo = "O título é obrigatório.";
  } else if (titulo.length < 5) {
    erros.titulo = "O título deve ter pelo menos 5 caracteres.";
  }

  if (!descricao) {
    erros.descricao = "A descrição é obrigatória.";
  }

  if (!prioridadesPermitidas.includes(prioridade)) {
    erros.prioridade =
      "Use uma prioridade válida: baixa, media ou alta.";
  }

  if (
    status !== undefined &&
    !statusPermitidos.includes(status)
  ) {
    erros.status =
      "Use um status válido: aberto, em_andamento ou concluido.";
  }

  if (Object.keys(erros).length > 0) {
    return { erros };
  }

  return {
    dados: {
      titulo,
      descricao,
      prioridade,
      status
    }
  };
}

function converterId(valor) {
  if (!/^[1-9]\d*$/.test(valor)) {
    return null;
  }

  const id = Number(valor);

  if (!Number.isSafeInteger(id)) {
    return null;
  }

  return id;
}

function buscarChamado(id) {
  return db
    .prepare("SELECT * FROM chamados WHERE id = ?")
    .get(id);
}

router.post("/", (req, res) => {
  const validacao = validarDados(req.body);

  if (validacao.erros) {
    return res.status(400).json({
      erro: "Os dados enviados são inválidos.",
      campos: validacao.erros
    });
  }

  const { titulo, descricao, prioridade, status } = validacao.dados;

  const resultado = db
    .prepare(`
      INSERT INTO chamados (titulo, descricao, prioridade, status)
      VALUES (?, ?, ?, ?)
    `)
    .run(titulo, descricao, prioridade, status ?? "aberto");

  const chamadoCriado = buscarChamado(Number(resultado.lastInsertRowid));

  return res.status(201).json(chamadoCriado);
});

router.get("/", (_req, res) => {
  const chamados = db
    .prepare("SELECT * FROM chamados ORDER BY id DESC")
    .all();

  return res.status(200).json(chamados);
});

router.get("/:id", (req, res) => {
  const id = converterId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  const chamado = buscarChamado(id);

  if (!chamado) {
    return res.status(404).json({
      erro: "Chamado não encontrado."
    });
  }

  return res.status(200).json(chamado);
});

router.put("/:id", (req, res) => {
  const id = converterId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  const chamadoExistente = buscarChamado(id);

  if (!chamadoExistente) {
    return res.status(404).json({
      erro: "Chamado não encontrado."
    });
  }

  const validacao = validarDados(req.body);

  if (validacao.erros) {
    return res.status(400).json({
      erro: "Os dados enviados são inválidos.",
      campos: validacao.erros
    });
  }

  const { titulo, descricao, prioridade, status } = validacao.dados;

  db.prepare(`
    UPDATE chamados
    SET titulo = ?, descricao = ?, prioridade = ?, status = ?
    WHERE id = ?
  `).run(
    titulo,
    descricao,
    prioridade,
    status ?? chamadoExistente.status,
    id
  );

  return res.status(200).json(buscarChamado(id));
});

router.delete("/:id", (req, res) => {
  const id = converterId(req.params.id);

  if (id === null) {
    return res.status(400).json({
      erro: "O ID deve ser um número inteiro positivo."
    });
  }

  const resultado = db
    .prepare("DELETE FROM chamados WHERE id = ?")
    .run(id);

  if (resultado.changes === 0) {
    return res.status(404).json({
      erro: "Chamado não encontrado."
    });
  }

  return res.status(204).end();
});

export default router;