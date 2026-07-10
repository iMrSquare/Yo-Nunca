// Servidor de producción: sirve el build de Vite (dist/) y la API sobre SQLite.
// Uso: npm run build && npm start
import express from 'express';
import path from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { api } from './api.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

if (!existsSync(dist)) {
  console.error('No existe dist/. Ejecuta primero: npm run build');
  process.exit(1);
}

const app = express();
app.use(api);
app.use(express.static(dist));
// Fallback SPA: cualquier otra ruta (p. ej. /adm) devuelve index.html
app.use((_req, res) => res.sendFile(path.join(dist, 'index.html')));

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => {
  console.log(`Yo Nunca escuchando en http://localhost:${port}`);
});
