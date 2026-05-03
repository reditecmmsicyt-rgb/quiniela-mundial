const express = require('express');
const cors = require('cors');
const path = require('path');
const { seedMatchesIfEmpty } = require('./seed');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
  seedMatchesIfEmpty();
  console.log(`🌍 Mundial Quiniela API corriendo en http://localhost:${PORT}`);
});
