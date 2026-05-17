import React, { useState, useEffect } from 'react';
import { api } from '../api';

const R_COLOR = {
  L: 'bg-blue-600/30 text-blue-300 border-blue-700/50',
  E: 'bg-yellow-600/30 text-yellow-300 border-yellow-700/50',
  V: 'bg-red-600/30 text-red-300 border-red-700/50',
};
const R_LABEL = { L: 'L', E: 'E', V: 'V' };

export default function PublicPredictions() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(null);

  useEffect(() => {
    api.get('/predictions/public')
      .then(d => {
        setData(d);
        // Activar el primer día con partidos
        if (d.matches.length > 0) {
          setActiveDay(d.matches[0].match_date.slice(0, 10));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-green-400 text-xl">
      Cargando predicciones...
    </div>
  );

  if (!data || data.matches.length === 0) return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="text-xl font-bold text-gray-300 mb-2">Aún no hay predicciones públicas</h2>
      <p className="text-gray-500 text-sm">Las predicciones se revelan cuando el partido comienza.</p>
    </div>
  );

  const { users, matches, predictions } = data;

  // Agrupar por día
  const days = {};
  matches.forEach(m => {
    const day = m.match_date.slice(0, 10);
    if (!days[day]) days[day] = [];
    days[day].push(m);
  });

  const dayKeys = Object.keys(days);

  function formatDayTab(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  const dayMatches = days[activeDay] ?? [];

  // Agrupar por grupo dentro del día
  const byGroup = {};
  dayMatches.forEach(m => {
    const g = m.group_name || m.stage;
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(m);
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">👁️ Predicciones públicas</h1>
      <p className="text-gray-400 text-sm mb-6">
        Se muestran las predicciones de todos una vez que el partido comienza.
      </p>

      {/* Tabs de días */}
      <div className="flex gap-2 flex-wrap mb-6">
        {dayKeys.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeDay === day
                ? 'bg-gradient-to-r from-emerald-600 to-green-500 text-white shadow-lg shadow-green-900/30'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700 border border-gray-700/50'
            }`}
          >
            {formatDayTab(day)}
          </button>
        ))}
      </div>

      {/* Tabla por grupo */}
      {Object.entries(byGroup).map(([groupName, gMatches]) => (
        <div key={groupName} className="mb-8">
          {/* Encabezado de grupo */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">{groupName}</span>
            <div className="flex-1 h-px bg-gray-700/60"></div>
          </div>

          <div className="card p-0 overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-gray-700">
                  {/* Columna de partido */}
                  <th className="px-4 py-3 text-left text-gray-400 text-xs uppercase font-semibold w-48">
                    Partido
                  </th>
                  {/* Columna por usuario */}
                  {users.map(u => (
                    <th key={u.id} className="px-3 py-3 text-center text-gray-300 text-xs font-semibold">
                      {u.username}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gMatches.map((m, idx) => {
                  const actual = m.is_finished
                    ? (m.home_score > m.away_score ? 'L' : m.away_score > m.home_score ? 'V' : 'E')
                    : null;
                  return (
                    <tr key={m.id} className={`border-b border-gray-700/40 ${idx % 2 === 0 ? 'bg-gray-800/20' : ''}`}>
                      {/* Info del partido */}
                      <td className="px-4 py-3">
                        <div className="text-xs text-gray-500 mb-0.5">{formatTime(m.match_date)}h</div>
                        <div className="font-semibold text-white text-xs leading-tight">
                          {m.home_flag} {m.home_team}
                        </div>
                        <div className="font-semibold text-white text-xs leading-tight">
                          {m.away_flag} {m.away_team}
                        </div>
                        {m.is_finished && (
                          <div className="text-xs text-yellow-400 font-bold mt-0.5">
                            {m.home_score}–{m.away_score}
                          </div>
                        )}
                      </td>
                      {/* Predicción de cada usuario */}
                      {users.map(u => {
                        const pred = predictions[m.id]?.[u.id];
                        const isCorrect = actual && pred?.result === actual;
                        const isWrong   = actual && pred && pred.result !== actual;
                        return (
                          <td key={u.id} className="px-3 py-3 text-center">
                            {pred ? (
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border
                                ${isCorrect ? 'bg-green-600/40 text-green-300 border-green-500/50' :
                                  isWrong   ? 'bg-red-600/30 text-red-300 border-red-600/40' :
                                  R_COLOR[pred.result]}`}>
                                {R_LABEL[pred.result]}
                              </span>
                            ) : (
                              <span className="text-gray-600 text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Leyenda */}
      <div className="card mt-2 text-xs text-gray-400 flex gap-4 flex-wrap">
        <span><span className="inline-block w-5 h-5 rounded bg-blue-600/30 text-blue-300 text-center font-bold text-xs leading-5 border border-blue-700/50">L</span> Local gana</span>
        <span><span className="inline-block w-5 h-5 rounded bg-yellow-600/30 text-yellow-300 text-center font-bold text-xs leading-5 border border-yellow-700/50">E</span> Empate</span>
        <span><span className="inline-block w-5 h-5 rounded bg-red-600/30 text-red-300 text-center font-bold text-xs leading-5 border border-red-600/40">V</span> Visitante gana</span>
        <span><span className="inline-block w-5 h-5 rounded bg-green-600/40 text-green-300 text-center font-bold text-xs leading-5 border border-green-500/50">✓</span> Acertó</span>
        <span><span className="inline-block w-5 h-5 rounded bg-red-600/30 text-red-300 text-center font-bold text-xs leading-5 border border-red-600/40">✗</span> Falló</span>
      </div>
    </div>
  );
}
