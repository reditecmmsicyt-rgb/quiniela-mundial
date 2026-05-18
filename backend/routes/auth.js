const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }
  if (username.trim().length > 30) {
    return res.status(400).json({ error: 'El nombre de usuario no puede superar 30 caracteres' });
  }
  if (email.length > 100) {
    return res.status(400).json({ error: 'Email demasiado largo' });
  }
  if (password.length < 6 || password.length > 72) {
    return res.status(400).json({ error: 'La contraseña debe tener entre 6 y 72 caracteres' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
    ).run(username.trim(), email.toLowerCase().trim(), hashedPassword);

    const payload = { id: result.lastInsertRowid, username: username.trim(), email: email.toLowerCase().trim(), is_admin: 0 };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: payload });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'El nombre de usuario o email ya está registrado' });
    }
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const payload = { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: payload });
});

router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, username, email, is_admin FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
});


module.exports = router;
