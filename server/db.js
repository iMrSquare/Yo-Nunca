import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SEED_LISTS, SEED_CHALLENGES } from './seed.js';

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

  CREATE TABLE IF NOT EXISTS challenges (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    position INTEGER NOT NULL,
    text     TEXT NOT NULL
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

const insertChallenge = db.prepare(
  'INSERT INTO challenges (position, text) VALUES (?, ?)'
);

function insertChallenges(texts) {
  texts.forEach((text, i) => insertChallenge.run(i, text));
}

if (db.prepare('SELECT COUNT(*) AS n FROM challenges').get().n === 0) {
  insertChallenges(SEED_CHALLENGES);
}

// Migración aditiva: CREATE TABLE IF NOT EXISTS no toca una tabla `games` ya
// existente de una versión anterior, así que las columnas nuevas se añaden a mano.
function ensureColumn(table, column, def) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${def}`);
  }
}
ensureColumn('games', 'challenges_shown', 'INTEGER NOT NULL DEFAULT 0');
ensureColumn('games', 'challenges_enabled', 'INTEGER NOT NULL DEFAULT 0');

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

export function getChallenges() {
  return db.prepare('SELECT text FROM challenges ORDER BY position').all().map((r) => r.text);
}

export function replaceChallenges(texts) {
  db.exec('BEGIN');
  try {
    db.exec('DELETE FROM challenges;');
    insertChallenges(texts);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

export function getStats() {
  const games = db.prepare('SELECT COUNT(*) AS n FROM games').get().n;
  const questions = db.prepare('SELECT COALESCE(SUM(questions_shown), 0) AS n FROM games').get().n;
  const challenges = db.prepare('SELECT COALESCE(SUM(challenges_shown), 0) AS n FROM games').get().n;
  const byCat = {};
  for (const row of db.prepare('SELECT list_id, count FROM cat_usage').all()) {
    byCat[row.list_id] = row.count;
  }
  const recent = db
    .prepare(`
      SELECT id, label, questions_shown AS n, challenges_shown AS challenges,
             challenges_enabled AS challengesEnabled, started_at AS startedAt
      FROM games ORDER BY id DESC LIMIT 8
    `)
    .all()
    .map((r) => ({ ...r, challengesEnabled: !!r.challengesEnabled }));
  return { games: Number(games), questions: Number(questions), challenges: Number(challenges), byCat, recent };
}

export function createGame(label, challengesEnabled) {
  const { lastInsertRowid } = db
    .prepare('INSERT INTO games (label, started_at, challenges_enabled) VALUES (?, ?, ?)')
    .run(label, Date.now(), challengesEnabled ? 1 : 0);
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

export function recordChallenge(gameId) {
  const { changes } = db
    .prepare('UPDATE games SET challenges_shown = challenges_shown + 1 WHERE id = ?')
    .run(gameId);
  return !!changes;
}

export function deleteGame(gameId) {
  const { changes } = db.prepare('DELETE FROM games WHERE id = ?').run(gameId);
  return !!changes;
}
