import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/partidos');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[92vh] flex flex-col items-center justify-center px-4 py-8">

      {/* Trofeo flotante */}
      <div className="animate-float mb-2 select-none">
        <div className="text-8xl drop-shadow-2xl">🏆</div>
      </div>

      {/* Título principal */}
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

        {/* Países sede */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {[['🇲🇽','México'],['🇺🇸','USA'],['🇨🇦','Canadá']].map(([flag, name]) => (
            <div key={name} className="flex items-center gap-1.5 bg-gray-800/60 border border-gray-700/50 rounded-full px-3 py-1">
              <span className="text-lg">{flag}</span>
              <span className="text-xs font-semibold text-gray-300">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Card de login */}
      <div className="w-full max-w-sm">
        <div className="card-festive">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-100">
            Iniciar Sesión
          </h2>

          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              className="btn-primary w-full mt-2 py-3 text-base"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar al torneo →'}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-gray-700/50 text-center text-sm text-gray-400">
            ¿Sin cuenta?{' '}
            <Link to="/registro" className="text-amber-400 hover:text-amber-300 font-semibold">
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Estadísticas decorativas */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[['48','Grupos'],['104','Partidos'],['32','Países']].map(([num, label]) => (
            <div key={label} className="bg-gray-900/50 border border-gray-700/40 rounded-lg py-2 text-center">
              <div className="text-lg font-black text-emerald-400">{num}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
