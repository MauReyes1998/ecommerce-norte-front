import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/** Protege rutas; con admin=true exige rol ADMIN. */
export function RequireAuth({ admin = false }: { admin?: boolean }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container-x py-20 text-center text-muted">Cargando…</div>;
  if (!user) return <Navigate to="/cuenta/entrar" state={{ from: location.pathname }} replace />;
  if (admin && user.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <Outlet />;
}
