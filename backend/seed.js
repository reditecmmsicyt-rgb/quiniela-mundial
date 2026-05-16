const bcrypt = require('bcryptjs');
const db = require('./db');

// Calendario oficial FIFA 2026 — horarios en hora de México (CDT, UTC-6)
const matches = [
  // ── Grupo A ──────────────────────────────────────────────────────────────
  { home: 'México',          hf: '🇲🇽', away: 'Sudáfrica',        af: '🇿🇦', date: '2026-06-11T13:00', group: 'Grupo A' },
  { home: 'Corea del Sur',   hf: '🇰🇷', away: 'República Checa',  af: '🇨🇿', date: '2026-06-11T20:00', group: 'Grupo A' },
  { home: 'República Checa', hf: '🇨🇿', away: 'Sudáfrica',        af: '🇿🇦', date: '2026-06-18T11:00', group: 'Grupo A' },
  { home: 'México',          hf: '🇲🇽', away: 'Corea del Sur',    af: '🇰🇷', date: '2026-06-18T18:00', group: 'Grupo A' },
  { home: 'República Checa', hf: '🇨🇿', away: 'México',           af: '🇲🇽', date: '2026-06-24T20:00', group: 'Grupo A' },
  { home: 'Sudáfrica',       hf: '🇿🇦', away: 'Corea del Sur',    af: '🇰🇷', date: '2026-06-24T20:00', group: 'Grupo A' },

  // ── Grupo B ──────────────────────────────────────────────────────────────
  { home: 'Canadá',  hf: '🇨🇦', away: 'Bosnia',  af: '🇧🇦', date: '2026-06-12T14:00', group: 'Grupo B' },
  { home: 'Catar',   hf: '🇶🇦', away: 'Suiza',   af: '🇨🇭', date: '2026-06-13T13:00', group: 'Grupo B' },
  { home: 'Suiza',   hf: '🇨🇭', away: 'Bosnia',  af: '🇧🇦', date: '2026-06-18T11:00', group: 'Grupo B' },
  { home: 'Canadá',  hf: '🇨🇦', away: 'Catar',   af: '🇶🇦', date: '2026-06-18T14:00', group: 'Grupo B' },
  { home: 'Suiza',   hf: '🇨🇭', away: 'Canadá',  af: '🇨🇦', date: '2026-06-24T11:00', group: 'Grupo B' },
  { home: 'Bosnia',  hf: '🇧🇦', away: 'Catar',   af: '🇶🇦', date: '2026-06-24T11:00', group: 'Grupo B' },

  // ── Grupo C ──────────────────────────────────────────────────────────────
  { home: 'Brasil',    hf: '🇧🇷', away: 'Marruecos', af: '🇲🇦', date: '2026-06-13T17:00', group: 'Grupo C' },
  { home: 'Haití',     hf: '🇭🇹', away: 'Escocia',   af: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '2026-06-13T20:00', group: 'Grupo C' },
  { home: 'Escocia',   hf: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', away: 'Marruecos', af: '🇲🇦', date: '2026-06-19T17:00', group: 'Grupo C' },
  { home: 'Brasil',    hf: '🇧🇷', away: 'Haití',     af: '🇭🇹', date: '2026-06-19T20:00', group: 'Grupo C' },
  { home: 'Escocia',   hf: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', away: 'Brasil',    af: '🇧🇷', date: '2026-06-24T17:00', group: 'Grupo C' },
  { home: 'Marruecos', hf: '🇲🇦', away: 'Haití',     af: '🇭🇹', date: '2026-06-24T17:00', group: 'Grupo C' },

  // ── Grupo D ──────────────────────────────────────────────────────────────
  { home: 'Estados Unidos', hf: '🇺🇸', away: 'Paraguay',  af: '🇵🇾', date: '2026-06-12T17:00', group: 'Grupo D' },
  { home: 'Australia',      hf: '🇦🇺', away: 'Turquía',   af: '🇹🇷', date: '2026-06-13T22:00', group: 'Grupo D' },
  { home: 'Estados Unidos', hf: '🇺🇸', away: 'Australia', af: '🇦🇺', date: '2026-06-19T11:00', group: 'Grupo D' },
  { home: 'Turquía',        hf: '🇹🇷', away: 'Paraguay',  af: '🇵🇾', date: '2026-06-19T20:00', group: 'Grupo D' },
  { home: 'Paraguay',       hf: '🇵🇾', away: 'Australia', af: '🇦🇺', date: '2026-06-25T18:00', group: 'Grupo D' },
  { home: 'Turquía',        hf: '🇹🇷', away: 'Estados Unidos', af: '🇺🇸', date: '2026-06-25T18:00', group: 'Grupo D' },

  // ── Grupo E ──────────────────────────────────────────────────────────────
  { home: 'Alemania',        hf: '🇩🇪', away: 'Curazao',         af: '🇨🇼', date: '2026-06-14T11:00', group: 'Grupo E' },
  { home: 'Costa de Marfil', hf: '🇨🇮', away: 'Ecuador',         af: '🇪🇨', date: '2026-06-14T18:00', group: 'Grupo E' },
  { home: 'Alemania',        hf: '🇩🇪', away: 'Costa de Marfil', af: '🇨🇮', date: '2026-06-20T15:00', group: 'Grupo E' },
  { home: 'Ecuador',         hf: '🇪🇨', away: 'Curazao',         af: '🇨🇼', date: '2026-06-20T18:00', group: 'Grupo E' },
  { home: 'Curazao',         hf: '🇨🇼', away: 'Costa de Marfil', af: '🇨🇮', date: '2026-06-25T15:00', group: 'Grupo E' },
  { home: 'Ecuador',         hf: '🇪🇨', away: 'Alemania',        af: '🇩🇪', date: '2026-06-25T15:00', group: 'Grupo E' },

  // ── Grupo F ──────────────────────────────────────────────────────────────
  { home: 'Países Bajos', hf: '🇳🇱', away: 'Japón',          af: '🇯🇵', date: '2026-06-14T14:00', group: 'Grupo F' },
  { home: 'Suecia',       hf: '🇸🇪', away: 'Túnez',          af: '🇹🇳', date: '2026-06-14T19:00', group: 'Grupo F' },
  { home: 'Países Bajos', hf: '🇳🇱', away: 'Suecia',         af: '🇸🇪', date: '2026-06-20T11:00', group: 'Grupo F' },
  { home: 'Túnez',        hf: '🇹🇳', away: 'Japón',          af: '🇯🇵', date: '2026-06-20T21:00', group: 'Grupo F' },
  { home: 'Japón',        hf: '🇯🇵', away: 'Suecia',         af: '🇸🇪', date: '2026-06-25T17:00', group: 'Grupo F' },
  { home: 'Túnez',        hf: '🇹🇳', away: 'Países Bajos',   af: '🇳🇱', date: '2026-06-25T17:00', group: 'Grupo F' },

  // ── Grupo G ──────────────────────────────────────────────────────────────
  { home: 'Bélgica',       hf: '🇧🇪', away: 'Egipto',        af: '🇪🇬', date: '2026-06-15T11:00', group: 'Grupo G' },
  { home: 'Irán',          hf: '🇮🇷', away: 'Nueva Zelanda', af: '🇳🇿', date: '2026-06-15T17:00', group: 'Grupo G' },
  { home: 'Bélgica',       hf: '🇧🇪', away: 'Irán',          af: '🇮🇷', date: '2026-06-21T11:00', group: 'Grupo G' },
  { home: 'Nueva Zelanda', hf: '🇳🇿', away: 'Egipto',        af: '🇪🇬', date: '2026-06-21T17:00', group: 'Grupo G' },
  { home: 'Egipto',        hf: '🇪🇬', away: 'Irán',          af: '🇮🇷', date: '2026-06-26T19:00', group: 'Grupo G' },
  { home: 'Nueva Zelanda', hf: '🇳🇿', away: 'Bélgica',       af: '🇧🇪', date: '2026-06-26T19:00', group: 'Grupo G' },

  // ── Grupo H ──────────────────────────────────────────────────────────────
  { home: 'España',         hf: '🇪🇸', away: 'Cabo Verde',    af: '🇨🇻', date: '2026-06-15T11:00', group: 'Grupo H' },
  { home: 'Arabia Saudita', hf: '🇸🇦', away: 'Uruguay',       af: '🇺🇾', date: '2026-06-15T17:00', group: 'Grupo H' },
  { home: 'España',         hf: '🇪🇸', away: 'Arabia Saudita',af: '🇸🇦', date: '2026-06-21T11:00', group: 'Grupo H' },
  { home: 'Uruguay',        hf: '🇺🇾', away: 'Cabo Verde',    af: '🇨🇻', date: '2026-06-21T17:00', group: 'Grupo H' },
  { home: 'Uruguay',        hf: '🇺🇾', away: 'España',        af: '🇪🇸', date: '2026-06-26T17:00', group: 'Grupo H' },
  { home: 'Cabo Verde',     hf: '🇨🇻', away: 'Arabia Saudita',af: '🇸🇦', date: '2026-06-26T18:00', group: 'Grupo H' },

  // ── Grupo I ──────────────────────────────────────────────────────────────
  { home: 'Francia',  hf: '🇫🇷', away: 'Senegal', af: '🇸🇳', date: '2026-06-16T14:00', group: 'Grupo I' },
  { home: 'Irak',     hf: '🇮🇶', away: 'Noruega', af: '🇳🇴', date: '2026-06-16T17:00', group: 'Grupo I' },
  { home: 'Francia',  hf: '🇫🇷', away: 'Irak',    af: '🇮🇶', date: '2026-06-22T16:00', group: 'Grupo I' },
  { home: 'Noruega',  hf: '🇳🇴', away: 'Senegal', af: '🇸🇳', date: '2026-06-22T19:00', group: 'Grupo I' },
  { home: 'Senegal',  hf: '🇸🇳', away: 'Irak',    af: '🇮🇶', date: '2026-06-26T14:00', group: 'Grupo I' },
  { home: 'Noruega',  hf: '🇳🇴', away: 'Francia', af: '🇫🇷', date: '2026-06-26T14:00', group: 'Grupo I' },

  // ── Grupo J ──────────────────────────────────────────────────────────────
  { home: 'Argentina', hf: '🇦🇷', away: 'Argelia',  af: '🇩🇿', date: '2026-06-16T19:00', group: 'Grupo J' },
  { home: 'Austria',   hf: '🇦🇹', away: 'Jordania', af: '🇯🇴', date: '2026-06-16T20:00', group: 'Grupo J' },
  { home: 'Argentina', hf: '🇦🇷', away: 'Austria',  af: '🇦🇹', date: '2026-06-22T11:00', group: 'Grupo J' },
  { home: 'Jordania',  hf: '🇯🇴', away: 'Argelia',  af: '🇩🇿', date: '2026-06-22T19:00', group: 'Grupo J' },
  { home: 'Argelia',   hf: '🇩🇿', away: 'Austria',  af: '🇦🇹', date: '2026-06-27T20:00', group: 'Grupo J' },
  { home: 'Jordania',  hf: '🇯🇴', away: 'Argentina',af: '🇦🇷', date: '2026-06-27T20:00', group: 'Grupo J' },

  // ── Grupo K ──────────────────────────────────────────────────────────────
  { home: 'Portugal',    hf: '🇵🇹', away: 'RD Congo',    af: '🇨🇩', date: '2026-06-17T11:00', group: 'Grupo K' },
  { home: 'Uzbekistán',  hf: '🇺🇿', away: 'Colombia',    af: '🇨🇴', date: '2026-06-17T19:00', group: 'Grupo K' },
  { home: 'Portugal',    hf: '🇵🇹', away: 'Uzbekistán',  af: '🇺🇿', date: '2026-06-23T11:00', group: 'Grupo K' },
  { home: 'Colombia',    hf: '🇨🇴', away: 'RD Congo',    af: '🇨🇩', date: '2026-06-23T19:00', group: 'Grupo K' },
  { home: 'Colombia',    hf: '🇨🇴', away: 'Portugal',    af: '🇵🇹', date: '2026-06-27T18:30', group: 'Grupo K' },
  { home: 'RD Congo',    hf: '🇨🇩', away: 'Uzbekistán',  af: '🇺🇿', date: '2026-06-27T18:30', group: 'Grupo K' },

  // ── Grupo L ──────────────────────────────────────────────────────────────
  { home: 'Inglaterra', hf: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Croacia', af: '🇭🇷', date: '2026-06-17T14:00', group: 'Grupo L' },
  { home: 'Ghana',      hf: '🇬🇭', away: 'Panamá',   af: '🇵🇦', date: '2026-06-17T19:00', group: 'Grupo L' },
  { home: 'Inglaterra', hf: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Ghana',   af: '🇬🇭', date: '2026-06-23T15:00', group: 'Grupo L' },
  { home: 'Panamá',     hf: '🇵🇦', away: 'Croacia',  af: '🇭🇷', date: '2026-06-23T18:00', group: 'Grupo L' },
  { home: 'Panamá',     hf: '🇵🇦', away: 'Inglaterra',af: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', date: '2026-06-27T16:00', group: 'Grupo L' },
  { home: 'Croacia',    hf: '🇭🇷', away: 'Ghana',    af: '🇬🇭', date: '2026-06-27T16:00', group: 'Grupo L' },
];

function insertMatches() {
  const stmt = db.prepare(`
    INSERT INTO matches (home_team, away_team, home_flag, away_flag, match_date, group_name, stage)
    VALUES (?, ?, ?, ?, ?, ?, 'Fase de Grupos')
  `);
  db.exec('BEGIN');
  for (const m of matches) {
    stmt.run(m.home, m.away, m.hf, m.af, m.date, m.group);
  }
  db.exec('COMMIT');
  return matches.length;
}

function seedMatchesIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM matches').get();
  if (count > 0) return;

  // Primera vez: crear admin si no existe
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@mundial2026.com'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)')
      .run('admin', 'admin@mundial2026.com', hash);
    console.log('👤 Admin creado: admin@mundial2026.com / admin123');
  }

  const total = insertMatches();
  console.log(`🌍 Seed: ${total} partidos insertados (fase de grupos, horarios hora México)`);
}

// Cuando se ejecuta directamente: reset completo (solo para desarrollo)
if (require.main === module) {
  console.log('🌱 Inicializando base de datos...');

  db.exec('DELETE FROM predictions');
  db.exec('DELETE FROM matches');
  db.exec('DELETE FROM users');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','matches','predictions')");

  const adminPwd = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)')
    .run('admin', 'admin@mundial2026.com', adminPwd);

  const userPwd = bcrypt.hashSync('pass123', 10);
  ['Carlos', 'Lucía', 'Pedro', 'Ana', 'Miguel', 'Sofía'].forEach(name => {
    db.prepare('INSERT INTO users (username, email, password) VALUES (?, ?, ?)')
      .run(name, `${name.toLowerCase()}@ejemplo.com`, userPwd);
  });

  const total = insertMatches();

  console.log(`✅ ${total} partidos insertados (72 partidos, fase de grupos)`);
  console.log('');
  console.log('👤 Administrador:');
  console.log('   Email: admin@mundial2026.com  |  Contraseña: admin123');
  console.log('');
  console.log('👥 Usuarios de prueba (contraseña: pass123):');
  console.log('   Carlos, Lucía, Pedro, Ana, Miguel, Sofía  @ejemplo.com');
}

module.exports = { seedMatchesIfEmpty };
