import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

const RESULT_LABEL = { L: 'Local', E: 'Empate', V: 'Visitante' };

function ResetPasswordModal({ user, onClose }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setMsg('Las contraseñas no coinciden'); return; }
    setSaving(true);
    setMsg('');
    try {
      await api.put(`/admin/users/${user.id}/password`, { password });
      setMsg('✅ Contraseña actualizada');
      setPassword(''); setConfirm('');
    } catch (err) {
      setMsg('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <h3 className="font-bold text-lg mb-1">Resetear contraseña</h3>
        <p className="text-sm text-gray-400 mb-4">{user.username} · {user.email}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Nueva contraseña</label>
            <input
              className="input w-full"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Confirmar contraseña</label>
            <input
              className="input w-full"
              type="password"
              placeholder="Repite la contraseña"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              required
            />
          </div>
          {msg && <p className="text-sm">{msg}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cerrar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UserPredictionsModal({ user, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${user.id}/predictions`)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user.id]);

  const predictions = data?.predictions ?? [];
  const filled   = predictions.filter(p => p.result !== null);
  const correct  = filled.filter(p => p.points > 0).length;
  const finished = predictions.filter(p => p.is_finished).length;

  function resultColor(p) {
    if (!p.is_finished || p.result === null) return 'text-gray-500';
    return p.points > 0 ? 'text-green-400' : 'text-red-400';
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-2xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{user.username}</h3>
            <p className="text-xs text-gray-400">
              {filled.length} predicciones · {correct} aciertos de {finished} partidos jugados
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">✕</button>
        </div>

        {loading ? (
          <div className="text-gray-400 text-center py-8">Cargando...</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800">
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="px-3 py-2 text-left">Partido</th>
                  <th className="px-3 py-2 text-center">Predicción</th>
                  <th className="px-3 py-2 text-center">Resultado</th>
                  <th className="px-3 py-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map(p => (
                  <tr key={p.match_id} className="border-b border-gray-700/40">
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-400">{p.group_name} · {new Date(p.match_date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })} {p.match_date.slice(11,16)}h</div>
                      <div className="font-medium">{p.home_flag} {p.home_team} vs {p.away_flag} {p.away_team}</div>
                    </td>
                    <td className={`px-3 py-2 text-center font-semibold ${p.result ? resultColor(p) : 'text-gray-600'}`}>
                      {p.result ? RESULT_LABEL[p.result] : '—'}
                    </td>
                    <td className="px-3 py-2 text-center text-gray-400">
                      {p.is_finished ? `${p.home_score}–${p.away_score}` : '—'}
                    </td>
                    <td className="px-3 py-2 text-center font-bold">
                      {p.is_finished && p.result !== null
                        ? <span className={p.points > 0 ? 'text-green-400' : 'text-red-400'}>{p.points}</span>
                        : <span className="text-gray-600">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultModal({ match, onClose, onSaved }) {
  const [home, setHome] = useState(match.home_score ?? '');
  const [away, setAway] = useState(match.away_score ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.put(`/admin/matches/${match.id}/result`, {
        home_score: parseInt(home),
        away_score: parseInt(away),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <h3 className="font-bold text-lg mb-4">Registrar Resultado</h3>
        <p className="text-gray-400 text-sm mb-4">
          {match.home_flag} {match.home_team} vs {match.away_flag} {match.away_team}
        </p>
        {error && <div className="text-red-400 text-sm mb-3">{error}</div>}
        <form onSubmit={handleSave}>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">{match.home_team}</p>
              <input
                type="number" min="0" max="30"
                className="score-input w-full"
                value={home}
                onChange={e => setHome(e.target.value)}
                required
              />
            </div>
            <span className="text-2xl font-bold text-gray-400">–</span>
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-400 mb-1">{match.away_team}</p>
              <input
                type="number" min="0" max="30"
                className="score-input w-full"
                value={away}
                onChange={e => setAway(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1" disabled={saving}>
              {saving ? 'Guardando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddMatchForm({ onAdded }) {
  const empty = { home_team: '', away_team: '', home_flag: '', away_flag: '', match_date: '', group_name: '', stage: 'Fase de Grupos' };
  const [form, setForm]     = useState(empty);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const stages = ['Fase de Grupos', 'Octavos de Final', 'Cuartos de Final', 'Semifinal', 'Tercer Lugar', 'Final'];

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      await api.post('/admin/matches', form);
      setForm(empty);
      setMsg('✅ Partido creado');
      onAdded();
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="card mb-6">
      <h3 className="font-bold text-lg mb-4">➕ Agregar Partido</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Equipo Local</label>
          <input className="input" placeholder="Ej: Argentina" value={form.home_team} onChange={f('home_team')} required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Equipo Visitante</label>
          <input className="input" placeholder="Ej: Brasil" value={form.away_team} onChange={f('away_team')} required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bandera Local (emoji)</label>
          <input className="input" placeholder="🇦🇷" value={form.home_flag} onChange={f('home_flag')} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Bandera Visitante (emoji)</label>
          <input className="input" placeholder="🇧🇷" value={form.away_flag} onChange={f('away_flag')} />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Fecha y Hora</label>
          <input className="input" type="datetime-local" value={form.match_date} onChange={f('match_date')} required />
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Grupo</label>
          <input className="input" placeholder="Ej: Grupo A" value={form.group_name} onChange={f('group_name')} />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-400 mb-1">Fase</label>
          <select className="input" value={form.stage} onChange={f('stage')}>
            {stages.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Creando...' : 'Crear Partido'}
          </button>
          {msg && <span className="text-sm">{msg}</span>}
        </div>
      </form>
    </div>
  );
}

export default function Admin() {
  const [tab, setTab]           = useState('matches'); // matches | users
  const [matches, setMatches]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [loadingM, setLoadingM] = useState(true);
  const [loadingU, setLoadingU] = useState(false);
  const [modal, setModal]             = useState(null);
  const [userModal, setUserModal]     = useState(null);
  const [resetModal, setResetModal]   = useState(null);
  const [deleting, setDeleting]       = useState(null);
  const [seeding, setSeeding]         = useState(null);
  const [seedMsg, setSeedMsg]         = useState('');

  const loadMatches = useCallback(async () => {
    setLoadingM(true);
    try { setMatches(await api.get('/admin/matches')); }
    catch (e) { console.error(e); }
    finally { setLoadingM(false); }
  }, []);

  const loadUsers = useCallback(async () => {
    setLoadingU(true);
    try { setUsers(await api.get('/admin/users')); }
    catch (e) { console.error(e); }
    finally { setLoadingU(false); }
  }, []);

  useEffect(() => { loadMatches(); }, [loadMatches]);
  useEffect(() => { if (tab === 'users') loadUsers(); }, [tab, loadUsers]);

  async function handleSeed(id) {
    setSeeding(id);
    setSeedMsg('');
    try {
      const res = await api.post(`/admin/matches/${id}/seed-predictions`);
      setSeedMsg(`✅ ${res.seeded} predicciones sembradas`);
      setTimeout(() => setSeedMsg(''), 4000);
    } catch (e) {
      setSeedMsg(`❌ ${e.message}`);
    } finally {
      setSeeding(null);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este partido? Se borrarán todas las predicciones asociadas.')) return;
    setDeleting(id);
    try { await api.delete(`/admin/matches/${id}`); loadMatches(); }
    catch (e) { alert(e.message); }
    finally { setDeleting(null); }
  }

  function formatDate(d) {
    return new Date(d).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">⚙️ Panel de Administración</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('matches')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'matches' ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          ⚽ Partidos ({matches.length})
        </button>
        <button onClick={() => setTab('users')} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${tab === 'users' ? 'bg-green-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
          👥 Usuarios
        </button>
      </div>

      {tab === 'matches' && (
        <>
          <AddMatchForm onAdded={loadMatches} />

          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Lista de Partidos</h3>
            {seedMsg && <span className="text-sm">{seedMsg}</span>}
          </div>
          {loadingM ? (
            <div className="text-gray-400 text-center py-8">Cargando...</div>
          ) : (
            <div className="space-y-2">
              {matches.map(m => (
                <div key={m.id} className="card flex items-center gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">
                        {m.home_flag} {m.home_team} vs {m.away_flag} {m.away_team}
                      </span>
                      {m.is_finished && (
                        <span className="badge bg-green-900/40 text-green-400">
                          {m.home_score}–{m.away_score}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {m.group_name && <>{m.group_name} · </>}
                      {m.stage} · {formatDate(m.match_date)}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    <button
                      onClick={() => handleSeed(m.id)}
                      className="bg-purple-700/60 hover:bg-purple-600/80 border border-purple-600/50 text-purple-200 text-xs py-1.5 px-3 rounded-lg transition-colors"
                      disabled={seeding === m.id}
                      title="Insertar predicciones aleatorias de prueba para todos los usuarios"
                    >
                      {seeding === m.id ? '...' : '🎲 Sembrar'}
                    </button>
                    <button
                      onClick={() => setModal(m)}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      {m.is_finished ? '✏️ Editar resultado' : '📝 Resultado'}
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="btn-danger text-xs py-1.5 px-3"
                      disabled={deleting === m.id}
                    >
                      {deleting === m.id ? '...' : '🗑️'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'users' && (
        <div className="card p-0 overflow-hidden">
          {loadingU ? (
            <div className="text-gray-400 text-center py-8">Cargando...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Usuario</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-center">Rol</th>
                  <th className="px-4 py-3 text-left hidden md:table-cell">Registro</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-b border-gray-700/50">
                    <td className="px-4 py-3 font-medium">{u.username}</td>
                    <td className="px-4 py-3 text-gray-400">{u.email}</td>
                    <td className="px-4 py-3 text-center">
                      {u.is_admin
                        ? <span className="badge bg-yellow-500/20 text-yellow-400">Admin</span>
                        : <span className="badge bg-gray-700 text-gray-300">Usuario</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">
                      {new Date(u.created_at).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-3 justify-end">
                        {!u.is_admin && (
                          <button
                            onClick={() => setUserModal(u)}
                            className="text-xs text-green-400 hover:text-green-300 underline"
                          >
                            Ver predicciones
                          </button>
                        )}
                        <button
                          onClick={() => setResetModal(u)}
                          className="text-xs text-yellow-400 hover:text-yellow-300 underline"
                        >
                          Reset contraseña
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <ResultModal
          match={modal}
          onClose={() => setModal(null)}
          onSaved={loadMatches}
        />
      )}

      {userModal && (
        <UserPredictionsModal
          user={userModal}
          onClose={() => setUserModal(null)}
        />
      )}

      {resetModal && (
        <ResetPasswordModal
          user={resetModal}
          onClose={() => setResetModal(null)}
        />
      )}
    </div>
  );
}
