const bcrypt = require('bcryptjs');
const db = require('./db');

// Calendario oficial FIFA 2026 — fuente: TUDN/WorldCupLocalTime
// Horarios en UTC (hora México CDT = UTC-6, se suma +6h)
const matches = [
  // ── Grupo A ──────────────────────────────────────────────────────────────
  { home: 'México',          hf: '🇲🇽', away: 'Sudáfrica',        af: '🇿🇦', date: '2026-06-11T19:00Z', group: 'Grupo A' }, // 1:00 PM CST
  { home: 'Corea del Sur',   hf: '🇰🇷', away: 'República Checa',  af: '🇨🇿', date: '2026-06-12T02:00Z', group: 'Grupo A' }, // 8:00 PM CST
  { home: 'República Checa', hf: '🇨🇿', away: 'Sudáfrica',        af: '🇿🇦', date: '2026-06-18T16:00Z', group: 'Grupo A' }, // 10:00 AM CST
  { home: 'México',          hf: '🇲🇽', away: 'Corea del Sur',    af: '🇰🇷', date: '2026-06-19T01:00Z', group: 'Grupo A' }, // 7:00 PM CST
  { home: 'República Checa', hf: '🇨🇿', away: 'México',           af: '🇲🇽', date: '2026-06-25T01:00Z', group: 'Grupo A' }, // 7:00 PM CST
  { home: 'Sudáfrica',       hf: '🇿🇦', away: 'Corea del Sur',    af: '🇰🇷', date: '2026-06-25T01:00Z', group: 'Grupo A' }, // 7:00 PM CST

  // ── Grupo B ──────────────────────────────────────────────────────────────
  { home: 'Canadá',  hf: '🇨🇦', away: 'Bosnia',  af: '🇧🇦', date: '2026-06-12T19:00Z', group: 'Grupo B' }, // 1:00 PM CST
  { home: 'Catar',   hf: '🇶🇦', away: 'Suiza',   af: '🇨🇭', date: '2026-06-13T19:00Z', group: 'Grupo B' }, // 1:00 PM CST
  { home: 'Suiza',   hf: '🇨🇭', away: 'Bosnia',  af: '🇧🇦', date: '2026-06-18T19:00Z', group: 'Grupo B' }, // 1:00 PM CST
  { home: 'Canadá',  hf: '🇨🇦', away: 'Catar',   af: '🇶🇦', date: '2026-06-18T22:00Z', group: 'Grupo B' }, // 4:00 PM CST
  { home: 'Suiza',   hf: '🇨🇭', away: 'Canadá',  af: '🇨🇦', date: '2026-06-24T19:00Z', group: 'Grupo B' }, // 1:00 PM CST
  { home: 'Bosnia',  hf: '🇧🇦', away: 'Catar',   af: '🇶🇦', date: '2026-06-24T19:00Z', group: 'Grupo B' }, // 1:00 PM CST

  // ── Grupo C ──────────────────────────────────────────────────────────────
  { home: 'Brasil',    hf: '🇧🇷', away: 'Marruecos', af: '🇲🇦', date: '2026-06-13T22:00Z', group: 'Grupo C' }, // 4:00 PM CST
  { home: 'Haití',     hf: '🇭🇹', away: 'Escocia',   af: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', date: '2026-06-14T01:00Z', group: 'Grupo C' }, // 7:00 PM CST
  { home: 'Escocia',   hf: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', away: 'Marruecos', af: '🇲🇦', date: '2026-06-19T22:00Z', group: 'Grupo C' }, // 4:00 PM CST
  { home: 'Brasil',    hf: '🇧🇷', away: 'Haití',     af: '🇭🇹', date: '2026-06-20T00:30Z', group: 'Grupo C' }, // 6:30 PM CST
  { home: 'Escocia',   hf: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', away: 'Brasil',    af: '🇧🇷', date: '2026-06-24T22:00Z', group: 'Grupo C' }, // 4:00 PM CST
  { home: 'Marruecos', hf: '🇲🇦', away: 'Haití',     af: '🇭🇹', date: '2026-06-24T22:00Z', group: 'Grupo C' }, // 4:00 PM CST

  // ── Grupo D ──────────────────────────────────────────────────────────────
  { home: 'Estados Unidos', hf: '🇺🇸', away: 'Paraguay',  af: '🇵🇾', date: '2026-06-13T01:00Z', group: 'Grupo D' }, // 7:00 PM CST jun 12
  { home: 'Australia',      hf: '🇦🇺', away: 'Turquía',   af: '🇹🇷', date: '2026-06-14T04:00Z', group: 'Grupo D' }, // 10:00 PM CST jun 13
  { home: 'Estados Unidos', hf: '🇺🇸', away: 'Australia', af: '🇦🇺', date: '2026-06-19T19:00Z', group: 'Grupo D' }, // 1:00 PM CST
  { home: 'Turquía',        hf: '🇹🇷', away: 'Paraguay',  af: '🇵🇾', date: '2026-06-20T03:00Z', group: 'Grupo D' }, // 9:00 PM CST
  { home: 'Turquía',        hf: '🇹🇷', away: 'Estados Unidos', af: '🇺🇸', date: '2026-06-26T02:00Z', group: 'Grupo D' }, // 8:00 PM CST jun 25
  { home: 'Paraguay',       hf: '🇵🇾', away: 'Australia', af: '🇦🇺', date: '2026-06-26T02:00Z', group: 'Grupo D' }, // 8:00 PM CST jun 25

  // ── Grupo E ──────────────────────────────────────────────────────────────
  { home: 'Alemania',        hf: '🇩🇪', away: 'Curazao',         af: '🇨🇼', date: '2026-06-14T17:00Z', group: 'Grupo E' }, // 11:00 AM CST
  { home: 'Costa de Marfil', hf: '🇨🇮', away: 'Ecuador',         af: '🇪🇨', date: '2026-06-14T23:00Z', group: 'Grupo E' }, // 5:00 PM CST
  { home: 'Alemania',        hf: '🇩🇪', away: 'Costa de Marfil', af: '🇨🇮', date: '2026-06-20T20:00Z', group: 'Grupo E' }, // 2:00 PM CST
  { home: 'Ecuador',         hf: '🇪🇨', away: 'Curazao',         af: '🇨🇼', date: '2026-06-21T00:00Z', group: 'Grupo E' }, // 6:00 PM CST
  { home: 'Curazao',         hf: '🇨🇼', away: 'Costa de Marfil', af: '🇨🇮', date: '2026-06-25T20:00Z', group: 'Grupo E' }, // 2:00 PM CST
  { home: 'Ecuador',         hf: '🇪🇨', away: 'Alemania',        af: '🇩🇪', date: '2026-06-25T20:00Z', group: 'Grupo E' }, // 2:00 PM CST

  // ── Grupo F ──────────────────────────────────────────────────────────────
  { home: 'Países Bajos', hf: '🇳🇱', away: 'Japón',        af: '🇯🇵', date: '2026-06-14T14:00Z', group: 'Grupo F' }, // 2:00 PM
  { home: 'Suecia',       hf: '🇸🇪', away: 'Túnez',        af: '🇹🇳', date: '2026-06-15T02:00Z', group: 'Grupo F' }, // 8:00 PM CST
  { home: 'Países Bajos', hf: '🇳🇱', away: 'Suecia',       af: '🇸🇪', date: '2026-06-20T17:00Z', group: 'Grupo F' }, // 11:00 AM CST
  { home: 'Túnez',        hf: '🇹🇳', away: 'Japón',        af: '🇯🇵', date: '2026-06-21T04:00Z', group: 'Grupo F' }, // 10:00 PM CST
  { home: 'Japón',        hf: '🇯🇵', away: 'Suecia',       af: '🇸🇪', date: '2026-06-25T23:00Z', group: 'Grupo F' }, // 5:00 PM CST
  { home: 'Túnez',        hf: '🇹🇳', away: 'Países Bajos', af: '🇳🇱', date: '2026-06-25T23:00Z', group: 'Grupo F' }, // 5:00 PM CST

  // ── Grupo G ──────────────────────────────────────────────────────────────
  { home: 'Bélgica',       hf: '🇧🇪', away: 'Egipto',        af: '🇪🇬', date: '2026-06-15T19:00Z', group: 'Grupo G' }, // 1:00 PM CST
  { home: 'Irán',          hf: '🇮🇷', away: 'Nueva Zelanda', af: '🇳🇿', date: '2026-06-16T01:00Z', group: 'Grupo G' }, // 7:00 PM CST
  { home: 'Bélgica',       hf: '🇧🇪', away: 'Irán',          af: '🇮🇷', date: '2026-06-21T19:00Z', group: 'Grupo G' }, // 1:00 PM CST
  { home: 'Nueva Zelanda', hf: '🇳🇿', away: 'Egipto',        af: '🇪🇬', date: '2026-06-22T01:00Z', group: 'Grupo G' }, // 7:00 PM CST
  { home: 'Egipto',        hf: '🇪🇬', away: 'Irán',          af: '🇮🇷', date: '2026-06-27T03:00Z', group: 'Grupo G' }, // 9:00 PM CST jun 26
  { home: 'Nueva Zelanda', hf: '🇳🇿', away: 'Bélgica',       af: '🇧🇪', date: '2026-06-27T03:00Z', group: 'Grupo G' }, // 9:00 PM CST jun 26

  // ── Grupo H ──────────────────────────────────────────────────────────────
  { home: 'España',         hf: '🇪🇸', away: 'Cabo Verde',    af: '🇨🇻', date: '2026-06-15T16:00Z', group: 'Grupo H' }, // 10:00 AM CST
  { home: 'Arabia Saudita', hf: '🇸🇦', away: 'Uruguay',       af: '🇺🇾', date: '2026-06-15T22:00Z', group: 'Grupo H' }, // 4:00 PM CST
  { home: 'España',         hf: '🇪🇸', away: 'Arabia Saudita',af: '🇸🇦', date: '2026-06-21T16:00Z', group: 'Grupo H' }, // 10:00 AM CST
  { home: 'Uruguay',        hf: '🇺🇾', away: 'Cabo Verde',    af: '🇨🇻', date: '2026-06-21T22:00Z', group: 'Grupo H' }, // 4:00 PM CST
  { home: 'Cabo Verde',     hf: '🇨🇻', away: 'Arabia Saudita',af: '🇸🇦', date: '2026-06-27T00:00Z', group: 'Grupo H' }, // 6:00 PM CST jun 26
  { home: 'Uruguay',        hf: '🇺🇾', away: 'España',        af: '🇪🇸', date: '2026-06-27T00:00Z', group: 'Grupo H' }, // 6:00 PM CST jun 26

  // ── Grupo I ──────────────────────────────────────────────────────────────
  { home: 'Francia',  hf: '🇫🇷', away: 'Senegal', af: '🇸🇳', date: '2026-06-16T19:00Z', group: 'Grupo I' }, // 1:00 PM CST
  { home: 'Irak',     hf: '🇮🇶', away: 'Noruega', af: '🇳🇴', date: '2026-06-16T22:00Z', group: 'Grupo I' }, // 4:00 PM CST
  { home: 'Francia',  hf: '🇫🇷', away: 'Irak',    af: '🇮🇶', date: '2026-06-22T21:00Z', group: 'Grupo I' }, // 3:00 PM CST
  { home: 'Noruega',  hf: '🇳🇴', away: 'Senegal', af: '🇸🇳', date: '2026-06-23T00:00Z', group: 'Grupo I' }, // 6:00 PM CST
  { home: 'Noruega',  hf: '🇳🇴', away: 'Francia', af: '🇫🇷', date: '2026-06-26T19:00Z', group: 'Grupo I' }, // 1:00 PM CST
  { home: 'Senegal',  hf: '🇸🇳', away: 'Irak',    af: '🇮🇶', date: '2026-06-26T19:00Z', group: 'Grupo I' }, // 1:00 PM CST

  // ── Grupo J ──────────────────────────────────────────────────────────────
  { home: 'Argentina', hf: '🇦🇷', away: 'Argelia',  af: '🇩🇿', date: '2026-06-17T01:00Z', group: 'Grupo J' }, // 7:00 PM CST jun 16
  { home: 'Austria',   hf: '🇦🇹', away: 'Jordania', af: '🇯🇴', date: '2026-06-17T04:00Z', group: 'Grupo J' }, // 10:00 PM CST jun 16
  { home: 'Argentina', hf: '🇦🇷', away: 'Austria',  af: '🇦🇹', date: '2026-06-22T17:00Z', group: 'Grupo J' }, // 11:00 AM CST
  { home: 'Jordania',  hf: '🇯🇴', away: 'Argelia',  af: '🇩🇿', date: '2026-06-23T03:00Z', group: 'Grupo J' }, // 9:00 PM CST
  { home: 'Argelia',   hf: '🇩🇿', away: 'Austria',  af: '🇦🇹', date: '2026-06-28T02:00Z', group: 'Grupo J' }, // 8:00 PM CST jun 27
  { home: 'Jordania',  hf: '🇯🇴', away: 'Argentina',af: '🇦🇷', date: '2026-06-28T02:00Z', group: 'Grupo J' }, // 8:00 PM CST jun 27

  // ── Grupo K ──────────────────────────────────────────────────────────────
  { home: 'Portugal',   hf: '🇵🇹', away: 'RD Congo',   af: '🇨🇩', date: '2026-06-17T17:00Z', group: 'Grupo K' }, // 11:00 AM CST
  { home: 'Uzbekistán', hf: '🇺🇿', away: 'Colombia',   af: '🇨🇴', date: '2026-06-18T02:00Z', group: 'Grupo K' }, // 8:00 PM CST
  { home: 'Portugal',   hf: '🇵🇹', away: 'Uzbekistán', af: '🇺🇿', date: '2026-06-23T17:00Z', group: 'Grupo K' }, // 11:00 AM CST
  { home: 'Colombia',   hf: '🇨🇴', away: 'RD Congo',   af: '🇨🇩', date: '2026-06-24T02:00Z', group: 'Grupo K' }, // 8:00 PM CST
  { home: 'Colombia',   hf: '🇨🇴', away: 'Portugal',   af: '🇵🇹', date: '2026-06-27T23:30Z', group: 'Grupo K' }, // 5:30 PM CST
  { home: 'RD Congo',   hf: '🇨🇩', away: 'Uzbekistán', af: '🇺🇿', date: '2026-06-27T23:30Z', group: 'Grupo K' }, // 5:30 PM CST

  // ── Grupo L ──────────────────────────────────────────────────────────────
  { home: 'Inglaterra', hf: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Croacia',    af: '🇭🇷', date: '2026-06-17T20:00Z', group: 'Grupo L' }, // 2:00 PM CST
  { home: 'Ghana',      hf: '🇬🇭', away: 'Panamá',    af: '🇵🇦', date: '2026-06-17T23:00Z', group: 'Grupo L' }, // 5:00 PM CST
  { home: 'Inglaterra', hf: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away: 'Ghana',     af: '🇬🇭', date: '2026-06-23T20:00Z', group: 'Grupo L' }, // 2:00 PM CST
  { home: 'Panamá',     hf: '🇵🇦', away: 'Croacia',   af: '🇭🇷', date: '2026-06-23T23:00Z', group: 'Grupo L' }, // 5:00 PM CST
  { home: 'Panamá',     hf: '🇵🇦', away: 'Inglaterra', af: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', date: '2026-06-27T21:00Z', group: 'Grupo L' }, // 3:00 PM CST
  { home: 'Croacia',    hf: '🇭🇷', away: 'Ghana',     af: '🇬🇭', date: '2026-06-27T21:00Z', group: 'Grupo L' }, // 3:00 PM CST
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
  const adminExists = db.prepare("SELECT id FROM users WHERE email = 'admin@mundial2026.com'").get();
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)')
      .run('admin', 'admin@mundial2026.com', hash);
    console.log('👤 Admin creado: admin@mundial2026.com / admin123');
  }

  const { count } = db.prepare('SELECT COUNT(*) as count FROM matches').get();
  if (count > 0) return;
  const total = insertMatches();
  console.log(`🌍 Seed: ${total} partidos insertados (horarios UTC oficiales)`);
}

if (require.main === module) {
  console.log('🌱 Inicializando base de datos...');
  db.exec('DELETE FROM predictions');
  db.exec('DELETE FROM matches');
  db.exec('DELETE FROM users');
  db.exec("DELETE FROM sqlite_sequence WHERE name IN ('users','matches','predictions')");

  const adminPwd = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, 1)')
    .run('admin', 'admin@mundial2026.com', adminPwd);

  const total = insertMatches();
  console.log(`✅ ${total} partidos insertados`);
  console.log('👤 Admin: admin@mundial2026.com / admin123');
}

module.exports = { seedMatchesIfEmpty, matches };
