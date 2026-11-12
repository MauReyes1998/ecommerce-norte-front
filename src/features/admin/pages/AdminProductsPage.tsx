import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Plus } from 'lucide-react';
import { assetUrl } from '@/shared/lib/http';
import { formatMXN, GENDER_LABEL } from '@/shared/lib/format';
import { Badge, Button, Input, Pagination, Select, useToast } from '@/shared/ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAdminCategories, useAdminProducts, useProductMutations } from '../hooks/useAdmin';

export default function AdminProductsPage() {
  useDocumentTitle('Productos');
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const q = useDebounce(search);
  const page = Number(params.get('page') ?? 1);
  const lowStock = params.get('lowStock') === '1';
  const categoryId = params.get('cat') ?? undefined;
  const active = params.get('estado'); // '', 'activos', 'inactivos'
  const { data, isLoading } = useAdminProducts({ search: q || undefined, page, limit: 20, lowStock: lowStock || undefined, categoryId, isActive: active === 'activos' ? true : active === 'inactivos' ? false : undefined });
  const { data: categories } = useAdminCategories();
  const m = useProductMutations();
  const toast = useToast((s) => s.push);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const set = (k: string, v?: string) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); if (k !== 'page') n.delete('page'); setParams(n); setSelected(new Set()); };

  const ids = data?.data.map((p) => p.id) ?? [];
  const allSelected = ids.length > 0 && ids.every((id) => selected.has(id));
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(ids));
  const toggle = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const bulk = (data: { isActive?: boolean; isFeatured?: boolean }, label: string) =>
    m.bulk.mutate({ ids: [...selected], ...data }, { onSuccess: (r) => { toast(`${r.updated} productos: ${label}`); setSelected(new Set()); }, onError: (e) => toast(e.message, 'error') });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Productos {data && <span className="text-base font-normal text-muted">({data.meta.total})</span>}</h1>
        <Link to="/admin/productos/nuevo" className="btn-primary"><Plus className="h-4 w-4" /> Nuevo producto</Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-[1fr_180px_160px_auto]">
        <Input label="Buscar" placeholder="Nombre o SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select label="Categoría" value={categoryId ?? ''} onChange={(e) => set('cat', e.target.value || undefined)}>
          <option value="">Todas</option>
          {categories?.filter((c) => c.parentId).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Estado" value={active ?? ''} onChange={(e) => set('estado', e.target.value || undefined)}>
          <option value="">Todos</option><option value="activos">Activos</option><option value="inactivos">Inactivos</option>
        </Select>
        <label className="flex items-end gap-2 pb-3 text-sm"><input type="checkbox" className="h-4 w-4 accent-ink" checked={lowStock} onChange={(e) => set('lowStock', e.target.checked ? '1' : undefined)} /> Stock bajo</label>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border border-ink bg-white p-3 text-sm" role="toolbar" aria-label="Acciones en lote">
          <span className="font-semibold">{selected.size} seleccionados</span>
          <Button variant="outline" className="!py-1.5 text-xs" onClick={() => bulk({ isActive: true }, 'activados')} loading={m.bulk.isPending}>Activar</Button>
          <Button variant="outline" className="!py-1.5 text-xs" onClick={() => bulk({ isActive: false }, 'desactivados')} loading={m.bulk.isPending}>Desactivar</Button>
          <Button variant="outline" className="!py-1.5 text-xs" onClick={() => bulk({ isFeatured: true }, 'destacados')} loading={m.bulk.isPending}>Destacar</Button>
          <Button variant="outline" className="!py-1.5 text-xs" onClick={() => bulk({ isFeatured: false }, 'quitados de destacados')} loading={m.bulk.isPending}>Quitar destacado</Button>
          <button className="ml-auto text-xs underline" onClick={() => setSelected(new Set())}>Limpiar</button>
        </div>
      )}

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-muted">
            <tr><th className="p-3"><input type="checkbox" className="accent-ink" checked={allSelected} onChange={toggleAll} aria-label="Seleccionar todos" /></th><th className="p-3">Producto</th><th className="p-3">Categoría</th><th className="p-3 text-right">Precio</th><th className="p-3 text-right">Stock</th><th className="p-3">Estado</th><th className="p-3" /></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} className="p-6 text-center text-muted">Cargando…</td></tr>}
            {data?.data.map((p) => (
              <tr key={p.id} className={`border-t border-line ${selected.has(p.id) ? 'bg-paper' : ''}`}>
                <td className="p-3"><input type="checkbox" className="accent-ink" checked={selected.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Seleccionar ${p.name}`} /></td>
                <td className="p-3">
                  <Link to={`/admin/productos/${p.id}`} className="flex items-center gap-3 hover:underline">
                    <img src={assetUrl(p.images[0]?.url)} alt="" className="h-12 w-9 object-cover" />
                    <span><span className="block font-semibold">{p.name}</span><span className="text-xs text-muted">{GENDER_LABEL[p.gender]} · {p.variants.length} variantes · {p.images.length} fotos</span></span>
                  </Link>
                </td>
                <td className="p-3">{p.category.name}</td>
                <td className="p-3 text-right tabular-nums">{p.salePrice ? <><span className="price-sale font-semibold">{formatMXN(p.salePrice)}</span> <s className="text-xs text-muted">{formatMXN(p.basePrice)}</s></> : formatMXN(p.basePrice)}</td>
                <td className={`p-3 text-right font-semibold tabular-nums ${p.totalStock === 0 ? 'text-accent' : p.totalStock <= 5 ? 'text-amber-700' : ''}`}>{p.totalStock}</td>
                <td className="p-3"><Badge tone={p.isActive ? 'ENTREGADO' : 'CANCELADO'}>{p.isActive ? 'Activo' : 'Inactivo'}</Badge>{p.isFeatured && <Badge className="ml-1">Destacado</Badge>}</td>
                <td className="p-3 text-right">
                  <button className="p-1 text-muted hover:text-ink" title="Duplicar" aria-label={`Duplicar ${p.name}`} onClick={() => m.duplicate.mutate(p.id, { onSuccess: (np) => { toast('Producto duplicado (inactivo)'); navigate(`/admin/productos/${np.id}`); }, onError: (e) => toast(e.message, 'error') })}><Copy className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-muted">No hay productos con esos filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pagination meta={data.meta} onPage={(p) => set('page', String(p))} />}
    </div>
  );
}
