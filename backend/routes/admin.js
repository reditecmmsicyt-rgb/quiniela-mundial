const express = require('express');
const bcrypt = require('bcryptjs');
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
  const actual = hs > as_ ? 'L' : as_ > hs ? 'V' : 'E';

  const updateMatch = db.prepare('UPDATE matches SET home_score = ?, away_score = ?, is_finished = 1 WHERE id = ?');
  const updatePts   = db.prepare('UPDATE predictions SET points = ? WHERE id = ?');
  const getPreds    = db.prepare('SELECT id, result FROM predictions WHERE match_id = ?');

  db.transaction(() => {
    updateMatch.run(hs, as_, id);
    getPreds.all(id).forEach(pred => {
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

router.put('/users/:id/password', (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }
  const user = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const hash = bcrypt.hashSync(password, 10);
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, id);
  res.json({ message: 'Contraseña actualizada' });
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id, is_admin FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (user.is_admin) return res.status(400).json({ error: 'No puedes eliminar un administrador' });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ message: 'Usuario eliminado' });
});

router.get('/users/:id/predictions', (req, res) => {
  const { id } = req.params;
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const predictions = db.prepare(`
    SELECT
      m.id          AS match_id,
      m.match_date,
      m.group_name,
      m.stage,
      m.home_team,  m.home_flag,
      m.away_team,  m.away_flag,
      m.home_score, m.away_score,
      m.is_finished,
      p.result,
      p.points
    FROM matches m
    LEFT JOIN predictions p ON p.match_id = m.id AND p.user_id = ?
    ORDER BY m.match_date ASC
  `).all(id);

  res.json({ user, predictions });
});

module.exports = router;
