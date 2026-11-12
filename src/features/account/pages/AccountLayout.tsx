import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { cn } from '@/shared/lib/format';

const links = [
  { to: '/cuenta', label: 'Mis pedidos', end: true },
  { to: '/cuenta/direcciones', label: 'Direcciones' },
  { to: '/cuenta/favoritos', label: 'Favoritos' },
  { to: '/cuenta/perfil', label: 'Perfil' },
];

export default function AccountLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="container-x grid gap-10 py-10 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="mb-6 text-lg font-bold">Hola, {user?.name.split(' ')[0]}</p>
        <nav className="flex gap-2 overflow-x-auto lg:flex-col" aria-label="Mi cuenta">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('whitespace-nowrap px-3 py-2 text-sm', isActive ? 'bg-ink text-white' : 'hover:bg-neutral-100')}>{l.label}</NavLink>
          ))}
          <button onClick={() => { logout(); navigate('/'); }} className="whitespace-nowrap px-3 py-2 text-left text-sm text-muted hover:bg-neutral-100">Cerrar sesión</button>
        </nav>
      </aside>
      <section><Outlet /></section>
    </div>
  );
}
