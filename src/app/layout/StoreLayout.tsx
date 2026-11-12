import { Outlet, ScrollRestoration } from 'react-router-dom';
import { CartDrawer } from '@/features/cart';
import { Header } from './Header';
import { Footer } from './Footer';
import { WhatsAppButton } from './WhatsAppButton';

export function StoreLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:p-2">Ir al contenido</a>
      <Header />
      <main id="main" className="flex-1"><Outlet /></main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
      <ScrollRestoration />
    </div>
  );
}
