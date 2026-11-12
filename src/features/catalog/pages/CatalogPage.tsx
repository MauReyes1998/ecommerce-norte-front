import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { Gender } from '@/shared/types';
import { Drawer, ErrorBox, Pagination } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useFavorites } from '@/features/account';
import { useCategories, useFilterOptions, useProducts } from '../hooks/useCatalog';
import { useCatalogParams } from '../hooks/useCatalogParams';
import { ProductGrid } from '../components/ProductGrid';
import { FilterPanel } from '../components/FilterPanel';
import { ProductFilters, ProductSort } from '../api/catalog.api';

const TITLES: Record<string, string> = { novedades: 'Novedades', ofertas: 'Ofertas', hombre: 'Hombre', mujer: 'Mujer' };

/** /tienda, /tienda/:categoria (hombre, mujer, hombre-playeras, novedades, ofertas) y /buscar?q= */
export default function CatalogPage({ mode }: { mode?: 'search' } = {}) {
  const { categoria } = useParams();
  const fixed = useMemo<Partial<ProductFilters>>(() => {
    if (categoria === 'ofertas') return { onSale: true };
    if (categoria === 'novedades') return { sort: 'newest' };
    return categoria ? { category: categoria } : {};
  }, [categoria]);

  const { filters, update, clear } = useCatalogParams(fixed);
  const { data: categories } = useCategories();
  const { data, isLoading, isFetching, error } = useProducts(filters);
  const { data: options } = useFilterOptions({ category: filters.category, gender: filters.gender as Gender | undefined });
  const favorites = useFavorites();
  const [mobileFilters, setMobileFilters] = useState(false);

  const current = useMemo(() => {
    for (const root of categories ?? []) {
      if (root.slug === categoria) return root;
      const child = root.children.find((c) => c.slug === categoria);
      if (child) return { ...child, parent: root };
    }
    return null;
  }, [categories, categoria]);

  const title = mode === 'search' ? `Resultados para "${filters.search ?? ''}"` : TITLES[categoria ?? ''] ?? current?.name ?? 'Toda la tienda';
  useDocumentTitle(title);

  const subcats = current && 'children' in current && current.children.length ? current.children : (current as { parent?: { children: { id: string; slug: string; name: string }[] } })?.parent?.children;

  return (
    <div className="container-x py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          {data && <p className="mt-1 text-sm text-muted">{data.meta.total} productos</p>}
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline lg:hidden" onClick={() => setMobileFilters(true)}><SlidersHorizontal className="h-4 w-4" /> Filtros</button>
          <label className="text-sm">
            <span className="sr-only">Ordenar por</span>
            <select className="input w-auto" value={filters.sort} onChange={(e) => update({ orden: e.target.value as ProductSort })}>
              <option value="newest">Más nuevo</option>
              <option value="price_asc">Menor precio</option>
              <option value="price_desc">Mayor precio</option>
            </select>
          </label>
        </div>
      </header>

      {subcats && subcats.length > 0 && (
        <nav className="mb-6 flex gap-2 overflow-x-auto pb-1 text-sm" aria-label="Subcategorías">
          {subcats.map((c) => (
            <a key={c.id} href={`/tienda/${c.slug}`} className={`whitespace-nowrap border px-3 py-1.5 ${c.slug === categoria ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}>{c.name}</a>
          ))}
        </nav>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block"><FilterPanel options={options} filters={filters} onChange={update} onClear={clear} /></aside>
        <section aria-busy={isFetching} className={isFetching ? 'opacity-70 transition' : 'transition'}>
          {error ? <ErrorBox message={error.message} /> : (
            <>
              <ProductGrid products={data?.data} loading={isLoading} favorites={favorites.ids} onToggleFavorite={favorites.toggle} />
              {data && <Pagination meta={data.meta} onPage={(p) => { update({ pagina: p }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
            </>
          )}
        </section>
      </div>

      <Drawer open={mobileFilters} onClose={() => setMobileFilters(false)} title="Filtros" side="left">
        <div className="p-5"><FilterPanel options={options} filters={filters} onChange={update} onClear={clear} /></div>
      </Drawer>
    </div>
  );
}
