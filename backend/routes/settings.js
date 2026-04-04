const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const KEYS = ['pago_monto', 'pago_fecha_limite', 'pago_metodos', 'pago_notas'];

// GET — cualquier usuario autenticado
router.get('/payment', authenticate, (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'pago_%'").all();
  const data = {};
  rows.forEach(r => { data[r.key] = r.value; });
  res.json(data);
});

// PUT — solo admin
router.put('/payment', authenticate, requireAdmin, (req, res) => {
  const update = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  db.transaction(() => {
    KEYS.forEach(k => {
      if (req.body[k] !== undefined) update.run(String(req.body[k]), k);
    });
  })();
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'pago_%'").all();
  const data = {};
  rows.forEach(r => { data[r.key] = r.value; });
  res.json(data);
});

module.exports = router;
