import { cn, formatMXN } from '@/shared/lib/format';
import { FilterOptions, ProductFilters } from '../api/catalog.api';

interface Props {
  options?: FilterOptions;
  filters: ProductFilters;
  onChange: (patch: Record<string, string | string[] | number | undefined>) => void;
  onClear: () => void;
}

const toggle = (list: string[] = [], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export function FilterPanel({ options, filters, onChange, onClear }: Props) {
  const active = (filters.sizes?.length ?? 0) + (filters.colors?.length ?? 0) + (filters.minPrice || filters.maxPrice ? 1 : 0) + (filters.onSale ? 1 : 0);
  return (
    <div className="space-y-8 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold uppercase tracking-wide">Filtros</h2>
        {active > 0 && <button onClick={onClear} className="text-xs underline">Limpiar ({active})</button>}
      </div>

      <fieldset>
        <legend className="label">Talla</legend>
        <div className="flex flex-wrap gap-2">
          {options?.sizes.map((s) => (
            <button key={s} onClick={() => onChange({ talla: toggle(filters.sizes, s) })} aria-pressed={filters.sizes?.includes(s)}
              className={cn('min-w-[2.5rem] border px-2 py-1.5', filters.sizes?.includes(s) ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink')}>{s}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Color</legend>
        <div className="flex flex-wrap gap-2">
          {options?.colors.map((c) => (
            <button key={c.name} onClick={() => onChange({ color: toggle(filters.colors, c.name) })} aria-pressed={filters.colors?.includes(c.name)} title={c.name}
              className={cn('h-7 w-7 rounded-full border-2', filters.colors?.includes(c.name) ? 'border-ink ring-2 ring-ink ring-offset-2' : 'border-line')} style={{ background: c.hex ?? '#ddd' }}>
              <span className="sr-only">{c.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Precio</legend>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" className="input" placeholder={options ? `${options.priceRange.min}` : 'Mín'} aria-label="Precio mínimo"
            value={filters.minPrice ?? ''} onChange={(e) => onChange({ min: e.target.value ? Number(e.target.value) : undefined })} />
          <span>–</span>
          <input type="number" inputMode="numeric" className="input" placeholder={options ? `${options.priceRange.max}` : 'Máx'} aria-label="Precio máximo"
            value={filters.maxPrice ?? ''} onChange={(e) => onChange({ max: e.target.value ? Number(e.target.value) : undefined })} />
        </div>
        {options && <p className="mt-1 text-xs text-muted">Entre {formatMXN(options.priceRange.min)} y {formatMXN(options.priceRange.max)}</p>}
      </fieldset>

      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" className="h-4 w-4 accent-ink" checked={!!filters.onSale} onChange={(e) => onChange({ oferta: e.target.checked ? '1' : undefined })} />
        Solo ofertas
      </label>
    </div>
  );
}
