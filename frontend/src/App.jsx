import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Matches from './pages/Matches';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import Payment from './pages/Payment';
import PublicPredictions from './pages/PublicPredictions';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-green-400 text-xl">Cargando...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.is_admin) return <Navigate to="/partidos" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/partidos" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <main className="max-w-5xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to={user ? '/partidos' : '/login'} replace />} />
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/registro" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/partidos"    element={<ProtectedRoute><Matches /></ProtectedRoute>} />
          <Route path="/tabla"       element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          <Route path="/pago"        element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/admin"         element={<AdminRoute><Admin /></AdminRoute>} />
          <Route path="/predicciones" element={<ProtectedRoute><PublicPredictions /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
