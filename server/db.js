import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_LISTS } from './seed.js';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, 'yonunca.db'));

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS lists (
    id       TEXT PRIMARY KEY,
    name     TEXT NOT NULL,
    color    TEXT NOT NULL,
    password TEXT,
    position INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS questions (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    list_id  TEXT NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    text     TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS games (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    label           TEXT NOT NULL,
    started_at      INTEGER NOT NULL,
    questions_shown INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS cat_usage (
    list_id TEXT PRIMARY KEY,
    count   INTEGER NOT NULL DEFAULT 0
  );
`);

const insertList = db.prepare(
  'INSERT INTO lists (id, name, color, password, position) VALUES (?, ?, ?, ?, ?)'
);
const insertQuestion = db.prepare(
  'INSERT INTO questions (list_id, position, text) VALUES (?, ?, ?)'
);

function insertLists(lists) {
  lists.forEach((l, i) => {
    insertList.run(l.id, l.name, l.color, l.password ?? null, i);
    l.questions.forEach((q, j) => insertQuestion.run(l.id, j, q));
  });
}

if (db.prepare('SELECT COUNT(*) AS n FROM lists').get().n === 0) {
  insertLists(SEED_LISTS);
}

export function getLists() {
  const lists = db.prepare('SELECT id, name, color, password FROM lists ORDER BY position').all();
  const byList = db.prepare('SELECT list_id, text FROM questions ORDER BY position').all();
  return lists.map((l) => ({
    id: l.id,
    name: l.name,
    color: l.color,
    ...(l.password ? { password: l.password } : {}),
    questions: byList.filter((q) => q.list_id === l.id).map((q) => q.text),
  }));
}

export function replaceLists(lists) {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM questions; DELETE FROM lists;');
    insertLists(lists);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function getStats() {
  const games = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
  const questions = db.prepare('SELECT COALESCE(SUM(questions_shown), 0) AS n FROM games').get().n;
  const byCat = {};
  for (const row of db.prepare('SELECT list_id, count FROM cat_usage').all()) {
    byCat[row.list_id] = row.count;
  }
  const recent = db
    .prepare('SELECT label, questions_shown AS n, started_at AS startedAt FROM games ORDER BY id DESC LIMIT 8')
    .all();
  return { games: Number(games), questions: Number(questions), byCat, recent };
}

export function createGame(label) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO games (label, started_at) VALUES (?, ?)')
    .run(label, Date.now());
  return Number(lastInsertRowid);
}

export function recordQuestion(gameId, catId) {
  const { changes } = db
    .prepare('UPDATE games SET questions_shown = questions_shown + 1 WHERE id = ?')
    .run(gameId);
  if (!changes) return false;
  db.prepare(
    'INSERT INTO cat_usage (list_id, count) VALUES (?, 1) ON CONFLICT(list_id) DO UPDATE SET count = count + 1'
  ).run(catId);
  return true;
}
