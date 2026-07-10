import express from 'express';
import { getLists, replaceLists, getStats, createGame, recordQuestion } from './db.js';
import { SEED_LIST_IDS } from './seed.js';

function isValidList(l) {
  return (
    l && typeof l === 'object' &&
    typeof l.id === 'string' && l.id &&
    typeof l.name === 'string' &&
    typeof l.color === 'string' &&
    (l.password === undefined || typeof l.password === 'string') &&
    Array.isArray(l.questions) && l.questions.every((q) => typeof q === 'string')
  );
}

export const api = express();
api.use(express.json({ limit: '2mb' }));

api.post('/api/admin/login', (req, res) => {
  const password = req.body?.password;
  const correct = process.env.ADMIN_PASSWORD || 'cambiame123';
  res.json({ ok: typeof password === 'string' && password === correct });
});

api.get('/api/lists', (_req, res) => {
  res.json(getLists());
});

api.put('/api/lists', (req, res) => {
  const lists = req.body;
  if (!Array.isArray(lists) || !lists.every(isValidList)) {
    res.status(400).json({ error: 'Formato de listas inválido' });
    return;
  }
  const ids = new Set(lists.map((l) => l.id));
  if (ids.size !== lists.length) {
    res.status(400).json({ error: 'Ids de lista duplicados' });
    return;
  }
  for (const seedId of SEED_LIST_IDS) {
    if (!ids.has(seedId)) {
      res.status(400).json({ error: 'No puedes eliminar una lista inicial' });
      return;
    }
  }
  replaceLists(lists);
  res.json({ ok: true });
});

api.get('/api/stats', (_req, res) => {
  res.json(getStats());
});

api.post('/api/games', (req, res) => {
  const label = typeof req.body?.label === 'string' ? req.body.label.slice(0, 200) : '';
  res.json({ id: createGame(label || 'Partida') });
});

api.post('/api/games/:id/question', (req, res) => {
  const gameId = Number(req.params.id);
  const catId = req.body?.catId;
  if (!Number.isInteger(gameId) || typeof catId !== 'string' || !catId) {
    res.status(400).json({ error: 'Petición inválida' });
    return;
  }
  if (!recordQuestion(gameId, catId)) {
    res.status(404).json({ error: 'Partida no encontrada' });
    return;
  }
  res.json({ ok: true });
});
