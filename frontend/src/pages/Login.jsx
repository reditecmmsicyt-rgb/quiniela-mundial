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
    <div className="min-h-[88vh] flex items-center justify-center">
      <div className="w-full max-w-md">

        {/* Header festivo */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-3 drop-shadow-lg">🏆</div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 bg-clip-text text-transparent tracking-tight">
            Liguilla Mundialista
          </h1>
          <p className="text-emerald-400 font-semibold mt-1 tracking-widest text-sm uppercase">
            FIFA World Cup 2026 ⚽
          </p>
        </div>

        {/* Card con borde festivo */}
        <div className="card-festive">
          <h2 className="text-xl font-bold mb-6 text-center text-gray-100">Iniciar Sesión</h2>

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
            <button type="submit" className="btn-primary w-full mt-2 py-3 text-base" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar al torneo →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-5">
            ¿Sin cuenta?{' '}
            <Link to="/registro" className="text-amber-400 hover:text-amber-300 font-semibold">
              Regístrate aquí
            </Link>
          </p>
        </div>

        {/* Decoración inferior */}
        <p className="text-center text-xs text-gray-600 mt-6">
          🇲🇽 México · 🇺🇸 USA · 🇨🇦 Canadá — Junio/Julio 2026
        </p>
      </div>
    </div>
  );
}
