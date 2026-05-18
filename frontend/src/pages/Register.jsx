import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]     = useState({ username: '', email: '', password: '', invite_code: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password, form.invite_code);
      navigate('/partidos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-4 py-8">

      {/* Pelota flotante */}
      <div className="animate-float mb-2 select-none">
        <div className="text-8xl drop-shadow-2xl">⚽</div>
      </div>

      {/* Título */}
      <div className="text-center mb-8">
        <h1
          className="text-5xl sm:text-6xl font-black tracking-tight glow-gold animate-shimmer"
          style={{
            background: 'linear-gradient(90deg, #fde68a, #f59e0b, #fbbf24, #f97316, #fbbf24, #f59e0b, #fde68a)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Quiniela Mundialista
        </h1>
        <p className="text-emerald-400 font-bold mt-2 tracking-[0.2em] text-sm uppercase">
          FIFA World Cup 2026
        </p>
        <div className="flex items-center justify-center gap-3 mt-4">
          {[['🇲🇽','México'],['🇺🇸','USA'],['🇨🇦','Canadá']].map(([flag, name]) => (
            <div key={name} className="flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 rounded-full px-3 py-1">
              <span className="text-lg">{flag}</span>
              <span className="text-xs font-semibold text-gray-300">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card de registro */}
      <div className="w-full max-w-sm">
        <div className="card-festive">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-100">Crear Cuenta</h2>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Nombre de usuario</label>
              <input
                type="text"
                className="input"
                placeholder="Ej: jugador123"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Código de invitación
              </label>
              <input
                type="text"
                className="input"
                placeholder="Solicítalo al organizador"
                value={form.invite_code}
                onChange={e => setForm(f => ({ ...f, invite_code: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full mt-2 py-3 text-base" disabled={loading}>
              {loading ? 'Registrando...' : 'Unirme al torneo →'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-700/50 text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold">
              Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
