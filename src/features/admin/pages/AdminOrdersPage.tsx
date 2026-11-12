import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { OrderStatus } from '@/shared/types';
import { formatDate, formatMXN, ORDER_STATUS_LABEL } from '@/shared/lib/format';
import { Button, Input, Pagination, useToast } from '@/shared/ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { OrderStatusBadge } from '@/features/account';
import { useAdminOrders, useOrderStatusMutation } from '../hooks/useAdmin';
import { NEXT, OrderDrawer } from '../components/OrderDrawer';
import { downloadCsv } from '../lib/downloadCsv';
import { adminApi } from '../api/admin.api';

const STATUS_TABS: (OrderStatus | '')[] = ['', 'PENDIENTE', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

export default function AdminOrdersPage() {
  useDocumentTitle('Pedidos');
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const q = useDebounce(search);
  const status = (params.get('status') as OrderStatus) || undefined;
  const page = Number(params.get('page') ?? 1);
  const open = params.get('open');
  const { data, isLoading } = useAdminOrders({ status, search: q || undefined, page, limit: 20 });
  const mutation = useOrderStatusMutation();
  const toast = useToast((s) => s.push);
  const [exporting, setExporting] = useState(false);
  const set = (k: string, v?: string) => { const n = new URLSearchParams(params); if (v) n.set(k, v); else n.delete(k); if (k !== 'page' && k !== 'open') n.delete('page'); setParams(n); };

  const quick = (id: string, number: string, next: OrderStatus) => {
    if (next === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido ${number}? Se regresará el stock.`)) return;
    mutation.mutate({ id, status: next }, { onSuccess: () => toast(`Pedido ${number}: ${ORDER_STATUS_LABEL[next]}`), onError: (e) => toast(e.message, 'error') });
  };
  const exportCsv = async () => {
    setExporting(true);
    try { await downloadCsv(adminApi.ordersCsvUrl({ status, search: q || undefined }), 'pedidos.csv'); } catch (e) { toast((e as Error).message, 'error'); }
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Pedidos {data && <span className="text-base font-normal text-muted">({data.meta.total})</span>}</h1>
        <Button variant="outline" onClick={exportCsv} loading={exporting}><Download className="h-4 w-4" /> Exportar CSV</Button>
      </header>

      <nav className="flex gap-1 overflow-x-auto border-b border-line" aria-label="Estatus">
        {STATUS_TABS.map((s) => (
          <button key={s} onClick={() => set('status', s || undefined)} aria-pressed={(status ?? '') === s}
            className={`whitespace-nowrap px-3 py-2 text-sm ${(status ?? '') === s ? 'border-b-2 border-ink font-semibold' : 'text-muted hover:text-ink'}`}>
            {s ? ORDER_STATUS_LABEL[s] : 'Todos'}
          </button>
        ))}
      </nav>

      <Input label="Buscar" placeholder="Número de pedido o correo" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-md" />

      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-muted"><tr><th className="p-3">Pedido</th><th className="p-3">Cliente</th><th className="p-3">Fecha</th><th className="p-3 text-right">Total</th><th className="p-3">Estatus</th><th className="p-3" /></tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted">Cargando…</td></tr>}
            {data?.data.map((o) => (
              <tr key={o.id} className="border-t border-line hover:bg-paper">
                <td className="p-3 font-semibold"><button onClick={() => set('open', o.id)} className="hover:underline">{o.number}</button></td>
                <td className="p-3">{o.shippingAddress?.fullName ?? ''}<span className="block text-xs text-muted">{o.email}</span></td>
                <td className="p-3 text-muted">{formatDate(o.createdAt)}</td>
                <td className="p-3 text-right font-semibold tabular-nums">{formatMXN(o.total)}</td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3 text-right">
                  {NEXT[o.status].filter((n) => n !== 'CANCELADO').map((n) => <Button key={n} variant="outline" className="ml-1 !px-2 !py-1 text-xs" onClick={() => n === 'ENVIADO' ? set('open', o.id) : quick(o.id, o.number, n)} loading={mutation.isPending && mutation.variables?.id === o.id}>{ORDER_STATUS_LABEL[n]}</Button>)}
                </td>
              </tr>
            ))}
            {data && data.data.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">Sin pedidos.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pagination meta={data.meta} onPage={(p) => set('page', String(p))} />}

      <OrderDrawer id={open} onClose={() => set('open', undefined)} />
    </div>
  );
}
