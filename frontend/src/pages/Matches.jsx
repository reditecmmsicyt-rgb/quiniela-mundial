import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const RESULT_LABELS = { L: 'Local', E: 'Empate', V: 'Visitante' };

function MatchCard({ match, onPredictionSaved }) {
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  const pred    = match.prediction;
  const started = new Date(match.match_date) <= new Date();
  const locked  = match.is_finished || started;

  useEffect(() => {
    setSelected(pred?.result ?? null);
  }, [pred]);

  async function handleSelect(result) {
    if (locked) return;
    setSelected(result);
    setSaving(true);
    setMsg('');
    try {
      await api.post(`/predictions/${match.id}`, { result });
      setMsg('✅ Guardado');
      onPredictionSaved();
    } catch (err) {
      setSelected(pred?.result ?? null);
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(''), 3000);
    }
  }

  function formatTime(d) {
    return new Date(d).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  function pointsBadge(pts) {
    if (pts === 1) return <span className="badge bg-green-500/20 text-green-400">+1 pt ✓</span>;
    return <span className="badge bg-red-500/20 text-red-400">0 pts</span>;
  }

  return (
    <div className={`card ${match.is_finished ? 'border-gray-600' : started ? 'border-orange-700/50' : 'border-gray-700'}`}>
      {/* Time + Group + Status */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-400 font-semibold">{formatTime(match.match_date)} · {match.group_name}</span>
        <div className="flex gap-2 items-center">
          {match.is_finished && <span className="badge bg-green-900/40 text-green-400">Finalizado</span>}
          {!match.is_finished && started && <span className="badge bg-orange-900/40 text-orange-400">En juego</span>}
          {!started && <span className="badge bg-gray-700 text-gray-300">Pendiente</span>}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2">
        {/* Home */}
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{match.home_flag}</div>
          <div className="font-semibold text-sm leading-tight">{match.home_team}</div>
        </div>

        {/* Score / VS */}
        <div className="flex-shrink-0 text-center min-w-[80px]">
          {match.is_finished ? (
            <div className="text-3xl font-black text-white">
              {match.home_score} – {match.away_score}
            </div>
          ) : (
            <div className="text-2xl font-bold text-gray-500">vs</div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 text-center">
          <div className="text-3xl mb-1">{match.away_flag}</div>
          <div className="font-semibold text-sm leading-tight">{match.away_team}</div>
        </div>
      </div>

      {/* Prediction section */}
      <div className="mt-4 pt-3 border-t border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* L / E / V buttons */}
          <div className="flex gap-2">
            {['L', 'E', 'V'].map(r => {
              const isSelected = selected === r;
              const isCorrect  = match.is_finished && pred?.result === r && pred?.points === 1;
              const isWrong    = match.is_finished && pred?.result === r && pred?.points === 0;
              return (
                <button
                  key={r}
                  onClick={() => handleSelect(r)}
                  disabled={locked || saving}
                  className={`w-14 h-10 rounded-lg font-bold text-sm transition-all border-2
                    ${isCorrect ? 'bg-green-600 border-green-400 text-white' :
                      isWrong   ? 'bg-red-800  border-red-600  text-white' :
                      isSelected && !locked ? 'bg-green-700 border-green-500 text-white' :
                      isSelected && locked  ? 'bg-gray-600  border-gray-500 text-white' :
                      locked ? 'bg-gray-800 border-gray-700 text-gray-600 cursor-default' :
                               'bg-gray-700 border-gray-600 text-gray-300 hover:border-green-500 hover:text-white'
                    }`}
                >
                  {r}
                </button>
              );
            })}
          </div>

          {/* Status */}
          <div className="text-sm">
            {match.is_finished && pred && pointsBadge(pred.points)}
            {!match.is_finished && !locked && selected && (
              <span className="text-gray-400 text-xs">
                {saving ? 'Guardando...' : RESULT_LABELS[selected]}
                {msg && <span className="ml-2">{msg}</span>}
              </span>
            )}
            {!match.is_finished && !locked && !selected && (
              <span className="text-gray-500 text-xs italic">Sin predicción</span>
            )}
            {locked && !match.is_finished && (
              <span className="text-gray-500 text-xs">
                {selected ? RESULT_LABELS[selected] : <span className="italic">Sin predicción</span>}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Matches() {
  const [matches, setMatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all'); // all | pending | finished

  const load = useCallback(async () => {
    try {
      const data = await api.get('/matches');
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = matches.filter(m => {
    if (filter === 'pending')  return !m.is_finished;
    if (filter === 'finished') return m.is_finished;
    return true;
  });

  // Agrupar por día (YYYY-MM-DD) en orden cronológico
  const days = {};
  filtered.forEach(m => {
    const day = m.match_date.slice(0, 10);
    if (!days[day]) days[day] = [];
    days[day].push(m);
  });

  function formatDayHeader(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
  }

  const totalPts = matches
    .filter(m => m.is_finished && m.prediction)
    .reduce((sum, m) => sum + (m.prediction?.points || 0), 0);

  const correctCount = matches.filter(m => m.is_finished && m.prediction?.points === 1).length;
  const wrongCount = matches.filter(m => m.is_finished && m.prediction?.points === 0 && m.prediction).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-green-400 text-xl">
      Cargando partidos...
    </div>
  );

  return (
    <div>
      {/* Header stats */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">⚽ Partidos</h1>
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-3xl font-black text-yellow-400">{totalPts}</div>
            <div className="text-xs text-gray-400 mt-1">Puntos totales</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-green-400">{correctCount}</div>
            <div className="text-xs text-gray-400 mt-1">Resultados correctos</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-black text-red-400">{wrongCount}</div>
            <div className="text-xs text-gray-400 mt-1">Incorrectos</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[['all','Todos'], ['pending','Pendientes'], ['finished','Finalizados']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === val ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Matches grouped by day */}
      {Object.keys(days).length === 0 ? (
        <div className="text-center text-gray-400 py-12">No hay partidos en esta categoría</div>
      ) : (
        Object.entries(days).map(([day, dayMatches]) => (
          <div key={day} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-shrink-0 bg-gradient-to-br from-emerald-700 to-green-600 rounded-lg px-3 py-1.5 text-center shadow-lg shadow-green-900/30">
                <div className="text-xs text-emerald-200 uppercase tracking-wider font-semibold">
                  {new Date(day + 'T12:00:00').toLocaleDateString('es-MX', { month: 'short' })}
                </div>
                <div className="text-2xl font-black text-white leading-none">
                  {new Date(day + 'T12:00:00').getDate()}
                </div>
              </div>
              <div>
                <h2 className="text-base font-bold text-white capitalize">
                  {formatDayHeader(day)}
                </h2>
                <p className="text-xs text-gray-400">{dayMatches.length} partido{dayMatches.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {dayMatches.map(m => (
                <MatchCard key={m.id} match={m} onPredictionSaved={load} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Points legend */}
      <div className="card mt-4 text-sm text-gray-400">
        <p className="font-medium text-gray-300 mb-2">Sistema de puntos:</p>
        <div className="flex gap-6 flex-wrap items-center">
          <span><span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">L</span> Local gana</span>
          <span><span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">E</span> Empate</span>
          <span><span className="font-bold text-white bg-gray-700 px-2 py-0.5 rounded">V</span> Visitante gana</span>
          <span className="border-l border-gray-700 pl-6">
            <span className="text-green-400 font-bold">1 pt</span> por acierto ·{' '}
            <span className="text-red-400 font-bold">0 pts</span> si fallas
          </span>
        </div>
      </div>
    </div>
  );
}
