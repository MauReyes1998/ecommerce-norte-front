import { FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useCart } from '@/features/cart';
import { useAuth } from '@/features/auth';
import { useCategories } from '@/features/catalog';
import { cn } from '@/shared/lib/format';

const nav = [
  { to: '/tienda/hombre', label: 'Hombre' },
  { to: '/tienda/mujer', label: 'Mujer' },
  { to: '/tienda/novedades', label: 'Novedades' },
  { to: '/tienda/ofertas', label: 'Ofertas', accent: true },
];

export function Header() {
  const cart = useCart();
  const { user, isAdmin } = useAuth();
  const { data: categories } = useCategories();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState('');

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    navigate(`/buscar?q=${encodeURIComponent(q.trim())}`);
    setSearch(false); setMenu(false);
  };

  const childrenOf = (label: string) => categories?.find((c) => c.name === label)?.children ?? [];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-x flex h-16 items-center gap-4">
        <button className="p-2 lg:hidden" onClick={() => setMenu(true)} aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
        <Link to="/" className="text-2xl font-black tracking-[0.2em]">NORTE</Link>

        <nav className="ml-8 hidden items-center gap-6 lg:flex" aria-label="Principal">
          {nav.map((n) => (
            <div key={n.to} className="group relative">
              <NavLink to={n.to} className={({ isActive }) => cn('py-5 text-sm font-semibold uppercase tracking-wide hover:underline', n.accent && 'text-accent', isActive && 'underline')}>{n.label}</NavLink>
              {childrenOf(n.label).length > 0 && (
                <div className="invisible absolute left-0 top-full w-56 border border-line bg-white p-4 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="space-y-2 text-sm">
                    {childrenOf(n.label).map((c) => <li key={c.id}><Link to={`/tienda/${c.slug}`} className="hover:underline">{c.name}</Link></li>)}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <form onSubmit={submitSearch} className={cn('items-center', search ? 'flex' : 'hidden md:flex')}>
            <label className="sr-only" htmlFor="search">Buscar</label>
            <input id="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar" className="w-40 border-b border-line bg-transparent px-2 py-1 text-sm focus:border-ink focus:outline-none" />
            <button type="submit" className="p-2" aria-label="Buscar"><Search className="h-5 w-5" /></button>
          </form>
          <button className="p-2 md:hidden" onClick={() => setSearch((s) => !s)} aria-label="Mostrar búsqueda"><Search className="h-5 w-5" /></button>
          <Link to={isAdmin ? '/admin' : user ? '/cuenta' : '/cuenta/entrar'} className="p-2" aria-label={user ? 'Mi cuenta' : 'Iniciar sesión'}><User className="h-5 w-5" /></Link>
          <button onClick={cart.open} className="relative p-2" aria-label={`Bolsa, ${cart.count} artículos`}>
            <ShoppingBag className="h-5 w-5" />
            {cart.count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">{cart.count}</span>}
          </button>
        </div>
      </div>

      <div className={cn('fixed inset-0 z-50 lg:hidden', !menu && 'pointer-events-none')} aria-hidden={!menu}>
        <div className={cn('absolute inset-0 bg-black/40 transition-opacity', menu ? 'opacity-100' : 'opacity-0')} onClick={() => setMenu(false)} />
        <nav className={cn('absolute left-0 top-0 h-full w-80 max-w-full overflow-y-auto bg-white p-6 transition-transform', menu ? 'translate-x-0' : '-translate-x-full')} aria-label="Menú">
          <button className="mb-6 p-1" onClick={() => setMenu(false)} aria-label="Cerrar menú"><X className="h-5 w-5" /></button>
          <ul className="space-y-4">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} onClick={() => setMenu(false)} className={cn('text-lg font-bold uppercase', n.accent && 'text-accent')}>{n.label}</Link>
                {childrenOf(n.label).length > 0 && (
                  <ul className="mt-2 space-y-1 pl-3 text-sm">
                    {childrenOf(n.label).map((c) => <li key={c.id}><Link to={`/tienda/${c.slug}`} onClick={() => setMenu(false)}>{c.name}</Link></li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
