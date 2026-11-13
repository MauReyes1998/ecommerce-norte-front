import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Package, ShoppingCart, Store, Tags, Ticket, Users } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { Toaster } from '@/shared/ui';
import { cn } from '@/shared/lib/format';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Package },
  { to: '/admin/categorias', label: 'Categorías', icon: Tags },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/cupones', label: 'Cupones', icon: Ticket },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-white md:flex">
        <div className="border-b border-line p-5"><p className="text-xl font-black tracking-[0.2em]">NORTE</p><p className="text-xs text-muted">Panel de administración</p></div>
        <nav className="flex-1 p-3" aria-label="Admin">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('mb-1 flex items-center gap-3 px-3 py-2 text-sm', isActive ? 'bg-ink text-white' : 'hover:bg-neutral-100')}>
              <l.icon className="h-4 w-4" /> {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line p-3 text-sm">
          <p className="truncate px-3 text-muted">{user?.email}</p>
          <a href="/" className="mt-1 flex items-center gap-3 px-3 py-2 hover:bg-neutral-100"><Store className="h-4 w-4" /> Ver tienda</a>
          <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center gap-3 px-3 py-2 hover:bg-neutral-100"><LogOut className="h-4 w-4" /> Salir</button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-white p-2 md:hidden" aria-label="Admin">
          {links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => cn('whitespace-nowrap px-3 py-2 text-sm', isActive ? 'bg-ink text-white' : '')}>{l.label}</NavLink>)}
        </nav>
        <main className="flex-1 p-6 lg:p-10"><Outlet /></main>
      </div>
      <Toaster />
    </div>
  );
}
