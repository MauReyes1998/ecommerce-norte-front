import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate, formatMXN } from '@/shared/lib/format';
import { Badge, Input, Pagination } from '@/shared/ui';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAdminCustomers } from '../hooks/useAdmin';

export default function AdminCustomersPage() {
  useDocumentTitle('Clientes');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search);
  const { data, isLoading } = useAdminCustomers({ search: q || undefined, page });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Clientes {data && <span className="text-base font-normal text-muted">({data.meta.total})</span>}</h1>
      <Input label="Buscar" placeholder="Nombre o correo" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="max-w-md" />
      <div className="overflow-x-auto border border-line bg-white">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase text-muted"><tr><th className="p-3">Cliente</th><th className="p-3">Teléfono</th><th className="p-3">Registro</th><th className="p-3 text-right">Pedidos</th><th className="p-3 text-right">Gastado</th><th className="p-3">Último pedido</th></tr></thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted">Cargando…</td></tr>}
            {data?.data.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3"><span className="font-semibold">{c.name}</span> {c.role === 'ADMIN' && <Badge className="ml-1">Admin</Badge>}<span className="block text-xs text-muted">{c.email}</span></td>
                <td className="p-3">{c.phone ?? <span className="text-muted">—</span>}</td>
                <td className="p-3 text-muted">{formatDate(c.createdAt)}</td>
                <td className="p-3 text-right tabular-nums">{c.ordersCount > 0 ? <Link to={`/admin/pedidos?search=${encodeURIComponent(c.email)}`} className="underline">{c.ordersCount}</Link> : 0}</td>
                <td className="p-3 text-right font-semibold tabular-nums">{formatMXN(c.totalSpent)}</td>
                <td className="p-3 text-muted">{c.lastOrderAt ? formatDate(c.lastOrderAt) : '—'}</td>
              </tr>
            ))}
            {data && data.data.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted">Sin clientes.</td></tr>}
          </tbody>
        </table>
      </div>
      {data && <Pagination meta={data.meta} onPage={setPage} />}
    </div>
  );
}
