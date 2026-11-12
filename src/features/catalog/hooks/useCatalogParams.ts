import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductFilters, ProductSort } from '../api/catalog.api';
import { Gender } from '@/shared/types';

/** Los filtros viven en la URL: se pueden compartir y el botón atrás funciona. */
export function useCatalogParams(fixed: Partial<ProductFilters> = {}) {
  const [params, setParams] = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const list = (k: string) => params.get(k)?.split(',').filter(Boolean) ?? [];
    const num = (k: string) => (params.get(k) ? Number(params.get(k)) : undefined);
    return {
      ...fixed,
      sizes: list('talla'),
      colors: list('color'),
      minPrice: num('min'),
      maxPrice: num('max'),
      onSale: params.get('oferta') === '1' || fixed.onSale,
      search: params.get('q') ?? undefined,
      sort: (params.get('orden') as ProductSort) ?? 'newest',
      page: num('pagina') ?? 1,
      limit: 24,
      gender: (params.get('genero') as Gender) ?? fixed.gender,
    };
  }, [params, fixed]);

  const update = useCallback(
    (patch: Partial<Record<'talla' | 'color' | 'min' | 'max' | 'oferta' | 'q' | 'orden' | 'pagina' | 'genero', string | string[] | number | undefined>>) => {
      const next = new URLSearchParams(params);
      if (!('pagina' in patch)) next.delete('pagina'); // cualquier cambio de filtro regresa a la página 1
      Object.entries(patch).forEach(([k, v]) => {
        const val = Array.isArray(v) ? v.join(',') : v === undefined ? '' : String(v);
        if (val) next.set(k, val); else next.delete(k);
      });
      setParams(next, { replace: false });
    },
    [params, setParams],
  );

  return { filters, update, clear: () => setParams({}) };
}
