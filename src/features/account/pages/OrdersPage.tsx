import { useState } from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '@/shared/lib/http';
import { formatDate, formatMXN } from '@/shared/lib/format';
import { Empty, Pagination, Skeleton } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useMyOrders } from '../hooks/useAccount';
import { OrderStatusBadge } from '../components/OrderStatusBadge';

export default function OrdersPage() {
  useDocumentTitle('Mis pedidos');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyOrders(page);
  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20" />)}</div>;
  if (!data?.data.length) return <Empty title="Todavía no tienes pedidos"><Link to="/tienda" className="underline">Ir a la tienda</Link></Empty>;
  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">Mis pedidos</h1>
      <ul className="divide-y divide-line border-y border-line">
        {data.data.map((o) => (
          <li key={o.id}>
            <Link to={`/pedido/${o.id}`} className="flex items-center gap-4 py-4 hover:bg-paper">
              <img src={assetUrl(o.firstImage)} alt="" className="h-16 w-12 object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{o.number} <span className="ml-2 text-xs font-normal text-muted">{formatDate(o.createdAt)}</span></p>
                <p className="text-sm text-muted">{o.itemCount} {o.itemCount === 1 ? 'artículo' : 'artículos'} · {formatMXN(o.total)}</p>
              </div>
              <OrderStatusBadge status={o.status} />
            </Link>
          </li>
        ))}
      </ul>
      <Pagination meta={data.meta} onPage={setPage} />
    </>
  );
}
