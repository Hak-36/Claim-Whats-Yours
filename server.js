// server.js — optional. Run: node server.js
import express from 'express';
import fs from 'node:fs';
import { SCHEMES } from './rules.js';

const app = express();
app.use(express.json());
app.use(express.static('.'));           // serves index.html / app.js / rules.js
fs.mkdirSync('data', { recursive: true });

const counts = () => {
  const c = {};
  try {
    fs.readFileSync('data/views.jsonl', 'utf8').split('\n').filter(Boolean)
      .forEach((l) => { const { id } = JSON.parse(l); c[id] = (c[id] || 0) + 1; });
  } catch {}
  return c;
};

// Public, auditable catalogue (no user data, no rule functions)
app.get('/api/schemes', (_req, res) =>
  res.json(SCHEMES.map(({ id, name, benefit, category, source }) => ({ id, name, benefit, category, source }))));

// Anonymous usage signal: which schemes people actually need
app.post('/api/views', (req, res) => {
  const { id } = req.body || {};
  if (!SCHEMES.some((s) => s.id === id)) return res.status(400).json({ error: 'unknown scheme' });
  fs.appendFileSync('data/views.jsonl', JSON.stringify({ id, t: Date.now() }) + '\n');
  res.json({ ok: true });
});

app.get('/api/analytics', (_req, res) => {
  const c = counts();
  res.json(Object.entries(c).sort((a, b) => b[1] - a[1]).map(([id, n]) => ({ id, n })));
});

app.listen(process.env.PORT || 3000, () => console.log('http://localhost:3000'));
