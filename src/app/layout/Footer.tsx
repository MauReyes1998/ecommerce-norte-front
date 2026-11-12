import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <div className="container-x grid gap-8 py-12 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-black tracking-[0.2em]">NORTE</p>
          <p className="mt-2 text-muted">Ropa urbana para hombre y mujer. Envíos a todo México.</p>
        </div>
        <div>
          <p className="label">Tienda</p>
          <ul className="space-y-1">
            <li><Link to="/tienda/hombre" className="hover:underline">Hombre</Link></li>
            <li><Link to="/tienda/mujer" className="hover:underline">Mujer</Link></li>
            <li><Link to="/tienda/novedades" className="hover:underline">Novedades</Link></li>
            <li><Link to="/tienda/ofertas" className="hover:underline">Ofertas</Link></li>
          </ul>
        </div>
        <div>
          <p className="label">Ayuda</p>
          <ul className="space-y-1 text-muted">
            <li>Envíos de 3 a 5 días hábiles</li>
            <li>Cambios hasta 30 días</li>
            <li>Pagos con Mercado Pago</li>
          </ul>
        </div>
        <div>
          <p className="label">Cuenta</p>
          <ul className="space-y-1">
            <li><Link to="/cuenta" className="hover:underline">Mis pedidos</Link></li>
            <li><Link to="/cuenta/favoritos" className="hover:underline">Favoritos</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} NORTE · Hecho en México</p>
    </footer>
  );
}
