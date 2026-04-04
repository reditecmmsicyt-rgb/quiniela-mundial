const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, (req, res) => {
  const matches = db.prepare('SELECT * FROM matches ORDER BY match_date ASC').all();
  const predictions = db.prepare('SELECT * FROM predictions WHERE user_id = ?').all(req.user.id);

  const predMap = {};
  predictions.forEach(p => { predMap[p.match_id] = p; });

  res.json(matches.map(m => ({ ...m, prediction: predMap[m.id] || null })));
});

module.exports = router;
