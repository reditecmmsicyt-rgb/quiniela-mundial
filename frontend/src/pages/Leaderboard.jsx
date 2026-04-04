import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function Leaderboard() {
  const { user }              = useAuth();
  const [standings, setStandings] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/leaderboard')
      .then(setStandings)
      .catch(console.error)
      .finally(() => setLoading(false));

    // Refresh every 30s
    const id = setInterval(() => {
      api.get('/leaderboard').then(setStandings).catch(() => {});
    }, 30000);
    return () => clearInterval(id);
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-green-400 text-xl">
      Cargando tabla...
    </div>
  );

  const myRow = standings.find(s => s.id === user?.id);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🏆 Tabla de Posiciones</h1>

      {/* My position highlight */}
      {myRow && (
        <div className="card border-green-600 mb-6 bg-green-900/20">
          <p className="text-sm text-gray-400 mb-1">Tu posición</p>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-black text-green-400">#{myRow.rank}</span>
            <div>
              <p className="font-bold text-white">{myRow.username}</p>
              <p className="text-sm text-gray-400">
                {myRow.total_points} pts · {myRow.exact_scores} correctos · {myRow.wrong_predictions} incorrectos
              </p>
            </div>
          </div>
        </div>
      )}

      {standings.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          Aún no hay partidos finalizados
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Jugador</th>
                <th className="px-4 py-3 text-center">Pts</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Correctos</th>
                <th className="px-4 py-3 text-center hidden sm:table-cell">Incorrectos</th>
                <th className="px-4 py-3 text-center hidden md:table-cell">Predicciones</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const isMe = row.id === user?.id;
                return (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-700/50 transition-colors ${
                      isMe ? 'bg-green-900/20' : idx % 2 === 0 ? 'bg-gray-800/30' : ''
                    }`}
                  >
                    <td className="px-4 py-3 font-bold">
                      {MEDALS[row.rank] ?? <span className="text-gray-500">{row.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${isMe ? 'text-green-400' : 'text-white'}`}>
                        {row.username}
                      </span>
                      {isMe && <span className="ml-2 badge bg-green-800/50 text-green-400">Tú</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-black text-yellow-400 text-base">
                      {row.total_points}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-green-400">
                      {row.exact_scores}
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell text-red-400">
                      {row.wrong_predictions}
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell text-gray-400">
                      {row.total_predictions}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-gray-600 mt-3 text-center">
        Actualización automática cada 30 segundos
      </p>
    </div>
  );
}
