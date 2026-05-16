const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const standings = db.prepare(`
    SELECT
      u.id,
      u.username,
      COALESCE(SUM(p.points), 0)                              AS total_points,
      COUNT(p.id)                                              AS total_predictions,
      SUM(CASE WHEN p.points > 0 THEN 1 ELSE 0 END)           AS exact_scores,
      SUM(CASE WHEN p.points = 0 AND p.id IS NOT NULL THEN 1 ELSE 0 END) AS wrong_predictions
    FROM users u
    LEFT JOIN predictions p ON u.id = p.user_id
      AND p.match_id IN (SELECT id FROM matches WHERE is_finished = 1)
    WHERE u.is_admin = 0
    GROUP BY u.id, u.username
    ORDER BY total_points DESC, exact_scores DESC, wrong_predictions ASC, u.username ASC
  `).all();

  res.json(standings.map((row, idx) => ({ ...row, rank: idx + 1 })));
});

module.exports = router;
