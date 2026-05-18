const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { seedMatchesIfEmpty } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

// Seguridad: headers HTTP
app.use(helmet({ contentSecurityPolicy: false }));

// CORS: solo permitir el mismo origen en producción
const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? [process.env.ALLOWED_ORIGIN]
  : true; // en desarrollo permite cualquier origen
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Limitar tamaño del body
app.use(express.json({ limit: '10kb' }));

// Rate limiting en rutas de autenticación (máx 20 intentos / 15 min por IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Demasiados intentos. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);

// Servir frontend en producción
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/matches',     require('./routes/matches'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/admin',       require('./routes/admin'));
app.use('/api/settings',    require('./routes/settings'));

// Rutas del frontend (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, '0.0.0.0', () => {
  seedMatchesIfEmpty();
  console.log(`🌍 Mundial Quiniela API corriendo en http://0.0.0.0:${PORT}`);
});
