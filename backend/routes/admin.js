const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate, requireAdmin);

/* ── Matches ── */

router.get('/matches', (req, res) => {
  const matches = db.prepare('SELECT * FROM matches ORDER BY match_date ASC').all();
  res.json(matches);
});

router.post('/matches', (req, res) => {
  const { home_team, away_team, home_flag = '', away_flag = '', match_date, group_name = '', stage = 'Fase de Grupos' } = req.body;
  if (!home_team || !away_team || !match_date) {
    return res.status(400).json({ error: 'Equipo local, visitante y fecha son obligatorios' });
  }
  const result = db.prepare(`
    INSERT INTO matches (home_team, away_team, home_flag, away_flag, match_date, group_name, stage)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(home_team, away_team, home_flag, away_flag, match_date, group_name, stage);

  res.status(201).json(db.prepare('SELECT * FROM matches WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/matches/:id', (req, res) => {
  const { id } = req.params;
  const { home_team, away_team, home_flag, away_flag, match_date, group_name, stage } = req.body;
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  db.prepare(`
    UPDATE matches SET
      home_team  = COALESCE(?, home_team),
      away_team  = COALESCE(?, away_team),
      home_flag  = COALESCE(?, home_flag),
      away_flag  = COALESCE(?, away_flag),
      match_date = COALESCE(?, match_date),
      group_name = COALESCE(?, group_name),
      stage      = COALESCE(?, stage)
    WHERE id = ?
  `).run(home_team, away_team, home_flag, away_flag, match_date, group_name, stage, id);

  res.json(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
});

router.put('/matches/:id/result', (req, res) => {
  const { id } = req.params;
  const { home_score, away_score } = req.body;
  if (home_score === undefined || away_score === undefined) {
    return res.status(400).json({ error: 'Marcador requerido' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });

  const hs = parseInt(home_score);
  const as_ = parseInt(away_score);

  db.prepare('UPDATE matches SET home_score = ?, away_score = ?, is_finished = 1 WHERE id = ?').run(hs, as_, id);

  const actual = hs > as_ ? 'L' : as_ > hs ? 'V' : 'E';

  const predictions = db.prepare('SELECT * FROM predictions WHERE match_id = ?').all(id);
  const updatePts = db.prepare('UPDATE predictions SET points = ? WHERE id = ?');

  db.transaction(() => {
    predictions.forEach(pred => {
      updatePts.run(pred.result === actual ? 1 : 0, pred.id);
    });
  })();

  res.json(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
});

router.delete('/matches/:id', (req, res) => {
  const { id } = req.params;
  if (!db.prepare('SELECT id FROM matches WHERE id = ?').get(id)) {
    return res.status(404).json({ error: 'Partido no encontrado' });
  }
  db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  res.json({ message: 'Partido eliminado' });
});

/* ── Users ── */

router.get('/users', (req, res) => {
  const users = db.prepare(
    'SELECT id, username, email, is_admin, created_at FROM users ORDER BY username ASC'
  ).all();
  res.json(users);
});

router.put('/users/:id/admin', (req, res) => {
  const { id } = req.params;
  const { is_admin } = req.body;
  db.prepare('UPDATE users SET is_admin = ? WHERE id = ?').run(is_admin ? 1 : 0, id);
  res.json({ message: 'Rol actualizado' });
});

module.exports = router;
