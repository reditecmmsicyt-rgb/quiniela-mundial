const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/:matchId', authenticate, (req, res) => {
  const matchId = parseInt(req.params.matchId);
  const { result } = req.body;

  if (!['L', 'E', 'V'].includes(result)) {
    return res.status(400).json({ error: 'Resultado inválido. Debe ser L, E o V' });
  }

  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
  if (match.is_finished) {
    return res.status(400).json({ error: 'No puedes predecir un partido ya finalizado' });
  }
  const cutoff = new Date(new Date(match.match_date).getTime() - 5 * 60 * 1000);
  if (cutoff <= new Date()) {
    return res.status(400).json({ error: 'Las predicciones cierran 5 minutos antes del partido' });
  }

  db.prepare(`
    INSERT INTO predictions (user_id, match_id, result)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id, match_id) DO UPDATE SET
      result = excluded.result,
      updated_at = CURRENT_TIMESTAMP
  `).run(req.user.id, matchId, result);

  res.json(db.prepare('SELECT * FROM predictions WHERE user_id = ? AND match_id = ?').get(req.user.id, matchId));
});

router.delete('/:matchId', authenticate, (req, res) => {
  const matchId = parseInt(req.params.matchId);
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId);
  if (!match) return res.status(404).json({ error: 'Partido no encontrado' });
  const cutoffDel = new Date(new Date(match.match_date).getTime() - 5 * 60 * 1000);
  if (match.is_finished || cutoffDel <= new Date()) {
    return res.status(400).json({ error: 'No puedes eliminar esta predicción' });
  }
  db.prepare('DELETE FROM predictions WHERE user_id = ? AND match_id = ?').run(req.user.id, matchId);
  res.json({ message: 'Predicción eliminada' });
});

module.exports = router;
