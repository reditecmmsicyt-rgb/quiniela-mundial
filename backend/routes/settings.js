const express = require('express');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const KEYS = ['pago_monto', 'pago_fecha_limite', 'pago_metodos', 'pago_notas'];
const INVITE_KEYS = ['invite_enabled', 'invite_code'];

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

// GET código de invitación — solo admin
router.get('/invite', authenticate, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('invite_enabled','invite_code')").all();
  const data = {};
  rows.forEach(r => { data[r.key] = r.value; });
  res.json(data);
});

// PUT código de invitación — solo admin
router.put('/invite', authenticate, requireAdmin, (req, res) => {
  const { invite_enabled, invite_code } = req.body;
  const update = db.prepare('UPDATE settings SET value = ? WHERE key = ?');
  db.transaction(() => {
    if (invite_enabled !== undefined) update.run(invite_enabled ? '1' : '0', 'invite_enabled');
    if (invite_code !== undefined) {
      if (!invite_code.trim()) return;
      update.run(invite_code.trim(), 'invite_code');
    }
  })();
  const rows = db.prepare("SELECT key, value FROM settings WHERE key IN ('invite_enabled','invite_code')").all();
  const data = {};
  rows.forEach(r => { data[r.key] = r.value; });
  res.json(data);
});

module.exports = router;
