const bcrypt = require('bcryptjs');

// Reusar la misma conexión (respeta DB_PATH)
const db = require('./db');

const groups = [
  { name: 'Grupo A', teams: [
    ['México',          '🇲🇽'],
    ['Corea del Sur',   '🇰🇷'],
    ['Sudáfrica',       '🇿🇦'],
    ['República Checa', '🇨🇿'],
  ], dates: ['2026-06-11', '2026-06-12', '2026-06-16', '2026-06-16', '2026-06-21', '2026-06-21'] },

  { name: 'Grupo B', teams: [
    ['Canadá', '🇨🇦'],
    ['Suiza',  '🇨🇭'],
    ['Catar',  '🇶🇦'],
    ['Bosnia', '🇧🇦'],
  ], dates: ['2026-06-11', '2026-06-12', '2026-06-16', '2026-06-17', '2026-06-21', '2026-06-21'] },

  { name: 'Grupo C', teams: [
    ['Brasil',    '🇧🇷'],
    ['Marruecos', '🇲🇦'],
    ['Escocia',   '🏴󠁧󠁢󠁳󠁣󠁴󠁿'],
    ['Haití',     '🇭🇹'],
  ], dates: ['2026-06-12', '2026-06-13', '2026-06-17', '2026-06-17', '2026-06-22', '2026-06-22'] },

  { name: 'Grupo D', teams: [
    ['Estados Unidos', '🇺🇸'],
    ['Paraguay',       '🇵🇾'],
    ['Australia',      '🇦🇺'],
    ['Turquía',        '🇹🇷'],
  ], dates: ['2026-06-12', '2026-06-13', '2026-06-17', '2026-06-18', '2026-06-22', '2026-06-22'] },

  { name: 'Grupo E', teams: [
    ['Alemania',        '🇩🇪'],
    ['Ecuador',         '🇪🇨'],
    ['Costa de Marfil', '🇨🇮'],
    ['Curazao',         '🇨🇼'],
  ], dates: ['2026-06-13', '2026-06-14', '2026-06-18', '2026-06-18', '2026-06-23', '2026-06-23'] },

  { name: 'Grupo F', teams: [
    ['Países Bajos', '🇳🇱'],
    ['Japón',        '🇯🇵'],
    ['Túnez',        '🇹🇳'],
    ['Suecia',       '🇸🇪'],
  ], dates: ['2026-06-13', '2026-06-14', '2026-06-18', '2026-06-19', '2026-06-23', '2026-06-23'] },

  { name: 'Grupo G', teams: [
    ['Bélgica',       '🇧🇪'],
    ['Irán',          '🇮🇷'],
    ['Egipto',        '🇪🇬'],
    ['Nueva Zelanda', '🇳🇿'],
  ], dates: ['2026-06-14', '2026-06-15', '2026-06-19', '2026-06-19', '2026-06-24', '2026-06-24'] },

  { name: 'Grupo H', teams: [
    ['España',         '🇪🇸'],
    ['Uruguay',        '🇺🇾'],
    ['Arabia Saudita', '🇸🇦'],
    ['Cabo Verde',     '🇨🇻'],
  ], dates: ['2026-06-14', '2026-06-15', '2026-06-19', '2026-06-20', '2026-06-24', '2026-06-24'] },

  { name: 'Grupo I', teams: [
    ['Francia', '🇫🇷'],
    ['Senegal', '🇸🇳'],
    ['Noruega', '🇳🇴'],
    ['Irak',    '🇮🇶'],
  ], dates: ['2026-06-15', '2026-06-15', '2026-06-20', '2026-06-20', '2026-06-25', '2026-06-25'] },

  { name: 'Grupo J', teams: [
    ['Argentina', '🇦🇷'],
    ['Austria',   '🇦🇹'],
    ['Argelia',   '🇩🇿'],
    ['Jordania',  '🇯🇴'],
  ], dates: ['2026-06-15', '2026-06-16', '2026-06-20', '2026-06-21', '2026-06-25', '2026-06-25'] },

  { name: 'Grupo K', teams: [
    ['Portugal',   '🇵🇹'],
    ['Colombia',   '🇨🇴'],
    ['Uzbekistán', '🇺🇿'],
    ['RD Congo',   '🇨🇩'],
  ], dates: ['2026-06-16', '2026-06-16', '2026-06-21', '2026-06-21', '2026-06-26', '2026-06-26'] },

  { name: 'Grupo L', teams: [
    ['Inglaterra', '🏴󠁧󠁢󠁥󠁮󠁧󠁿'],
    ['Croacia',    '🇭🇷'],
    ['Ghana',      '🇬🇭'],
    ['Panamá',     '🇵🇦'],
  ], dates: ['2026-06-16', '2026-06-17', '2026-06-21', '2026-06-22', '2026-06-26', '2026-06-26'] },
];

// Horarios rotativos para los 6 partidos de cada grupo
const TIMES = ['13:00', '16:00', '19:00', '22:00', '19:00', '19:00'];

// Combinaciones: (0v1, 2v3), (0v2, 1v3), (0v3, 1v2)
const COMBOS = [[0,1,2,3], [0,2,1,3], [0,3,1,2]];

function insertMatches() {
  const insertMatch = db.prepare(`
    INSERT INTO matches (home_team, away_team, home_flag, away_flag, match_date, group_name, stage)
    VALUES (?, ?, ?, ?, ?, ?, 'Fase de Grupos')
  `);
  let total = 0;
  db.exec('BEGIN');
  for (const g of groups) {
    COMBOS.forEach(([a, b, c, d], round) => {
      const d1 = `${g.dates[round * 2]}T${TIMES[round * 2]}`;
      const d2 = `${g.dates[round * 2 + 1]}T${TIMES[round * 2 + 1]}`;
      insertMatch.run(g.teams[a][0], g.teams[b][0], g.teams[a][1], g.teams[b][1], d1, g.name);
      insertMatch.run(g.teams[c][0], g.teams[d][0], g.teams[c][1], g.teams[d][1], d2, g.name);
      total += 2;
    });
  }
  db.exec('COMMIT');
  return total;
}

// Llamado desde server.js al arrancar: solo siembra si la tabla está vacía
function seedMatchesIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) as count FROM matches').get();
  if (count > 0) return;
  const total = insertMatches();
  console.log(`🌍 Seed: ${total} partidos insertados (${groups.length} grupos)`);
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

  console.log(`✅ ${total} partidos insertados (${groups.length} grupos)`);
  console.log('');
  console.log('👤 Administrador:');
  console.log('   Email: admin@mundial2026.com  |  Contraseña: admin123');
  console.log('');
  console.log('👥 Usuarios de prueba (contraseña: pass123):');
  console.log('   Carlos, Lucía, Pedro, Ana, Miguel, Sofía  @ejemplo.com');
}

module.exports = { seedMatchesIfEmpty };
