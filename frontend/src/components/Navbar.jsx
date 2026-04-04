import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg font-medium transition-colors ${
      isActive ? 'bg-green-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
    }`;

  return (
    <nav className="bg-gray-900 border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <span className="font-bold text-green-400 text-lg hidden sm:block">Mundial 2026</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/partidos" className={linkClass}>Partidos</NavLink>
            <NavLink to="/tabla"    className={linkClass}>Tabla</NavLink>
            <NavLink to="/pago"     className={linkClass}>Pago</NavLink>
            {user?.is_admin && <NavLink to="/admin" className={linkClass}>Admin</NavLink>}
          </div>

          {/* User info */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-sm text-gray-400">
              Hola, <span className="text-green-400 font-semibold">{user?.username}</span>
              {user?.is_admin && <span className="ml-1 badge bg-yellow-500/20 text-yellow-400">Admin</span>}
            </span>
            <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
              Salir
            </button>
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-700" onClick={() => setOpen(!open)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-3 space-y-1">
            <NavLink to="/partidos" className={linkClass} onClick={() => setOpen(false)}>⚽ Partidos</NavLink>
            <NavLink to="/tabla"    className={linkClass} onClick={() => setOpen(false)}>🏆 Tabla</NavLink>
            <NavLink to="/pago"     className={linkClass} onClick={() => setOpen(false)}>💳 Pago</NavLink>
            {user?.is_admin && <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>⚙️ Admin</NavLink>}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-sm text-gray-400 px-3">@{user?.username}</span>
              <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">Salir</button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
