import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { assetUrl } from '@/shared/lib/http';
import { useFavorites } from '@/features/account';
import { useCategories, useProducts } from '../hooks/useCatalog';
import { ProductGrid } from '../components/ProductGrid';

export default function HomePage() {
  useDocumentTitle();
  const { data: categories } = useCategories();
  const featured = useProducts({ featured: true, limit: 8 });
  const sale = useProducts({ onSale: true, limit: 4, sort: 'newest' });
  const favorites = useFavorites();

  return (
    <>
      <section className="relative isolate flex min-h-[70vh] items-end bg-neutral-900 text-white">
        <img src="https://picsum.photos/seed/norte-hero/1800/1100" alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70" />
        <div className="container-x pb-16 pt-32">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]">Nueva temporada</p>
          <h1 className="max-w-2xl text-5xl font-bold leading-tight sm:text-7xl">Ropa urbana<br />hecha para la calle.</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/tienda/hombre" className="btn bg-white text-ink hover:bg-neutral-200">Hombre</Link>
            <Link to="/tienda/mujer" className="btn border border-white text-white hover:bg-white hover:text-ink">Mujer</Link>
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ...(categories ?? []).map((c) => ({ to: `/tienda/${c.slug}`, label: c.name, img: c.imageUrl })),
            { to: '/tienda/novedades', label: 'Novedades', img: 'https://picsum.photos/seed/norte-new/800/1000' },
            { to: '/tienda/ofertas', label: 'Ofertas', img: 'https://picsum.photos/seed/norte-sale/800/1000' },
          ].slice(0, 4).map((c) => (
            <Link key={c.to} to={c.to} className="group relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <img src={assetUrl(c.img)} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" loading="lazy" />
              <span className="absolute bottom-4 left-4 bg-white px-3 py-1.5 text-sm font-bold uppercase tracking-wide">{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-x pb-16">
        <header className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold">Destacados</h2>
          <Link to="/tienda" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">Ver todo <ArrowRight className="h-4 w-4" /></Link>
        </header>
        <ProductGrid products={featured.data?.data} loading={featured.isLoading} favorites={favorites.ids} onToggleFavorite={favorites.toggle} />
      </section>

      {sale.data && sale.data.data.length > 0 && (
        <section className="bg-paper py-16">
          <div className="container-x">
            <header className="mb-6 flex items-end justify-between">
              <h2 className="text-2xl font-bold">Ofertas</h2>
              <Link to="/tienda/ofertas" className="inline-flex items-center gap-1 text-sm font-semibold hover:underline">Ver ofertas <ArrowRight className="h-4 w-4" /></Link>
            </header>
            <ProductGrid products={sale.data.data} favorites={favorites.ids} onToggleFavorite={favorites.toggle} />
          </div>
        </section>
      )}
    </>
  );
}
