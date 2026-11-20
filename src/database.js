import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const caminhoBanco = resolve("data/chamados.sqlite");

mkdirSync(dirname(caminhoBanco), { recursive: true });

export const db = new Database(caminhoBanco);

db.exec(`
  CREATE TABLE IF NOT EXISTS chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL CHECK (length(trim(titulo)) >= 5),
    descricao TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
    prioridade TEXT NOT NULL
      CHECK (prioridade IN ('baixa', 'media', 'alta')),
    status TEXT NOT NULL DEFAULT 'aberto'
      CHECK (status IN ('aberto', 'em_andamento', 'concluido')),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);