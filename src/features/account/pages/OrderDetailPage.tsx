import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { assetUrl } from '@/shared/lib/http';
import { formatDate, formatMXN } from '@/shared/lib/format';
import { Button, ErrorBox, Skeleton } from '@/shared/ui';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useOrder } from '../hooks/useAccount';
import { accountApi } from '../api/account.api';
import { OrderStatusBadge } from '../components/OrderStatusBadge';

/** Página de confirmación y seguimiento. Mercado Pago regresa aquí con ?pago=exito|pendiente|error. */
export default function OrderDetailPage() {
  const { id = '' } = useParams();
  const [params] = useSearchParams();
  const pago = params.get('pago');
  const { data: order, isLoading, error } = useOrder(id, pago === 'exito');
  const retry = useMutation({ mutationFn: () => accountApi.retryCheckout(id), onSuccess: (r) => { window.location.href = r.checkoutUrl; } });
  useDocumentTitle(order ? `Pedido ${order.number}` : 'Pedido');

  if (error) return <div className="container-x py-20"><ErrorBox message={error.message} /></div>;
  if (isLoading || !order) return <div className="container-x max-w-3xl space-y-4 py-10"><Skeleton className="h-10 w-1/2" /><Skeleton className="h-40" /></div>;

  const a = order.shippingAddress;
  const banner =
    order.status === 'PAGADO' || order.paymentStatus === 'APPROVED' ? { icon: CheckCircle2, cls: 'bg-green-50 text-green-800', text: order.deliveryMethod === 'RECOGER' ? 'Pago confirmado. Te avisaremos por correo cuando esté listo para recoger.' : 'Pago confirmado. Te avisaremos por correo cuando lo enviemos.' }
    : pago === 'error' || order.paymentStatus === 'REJECTED' ? { icon: XCircle, cls: 'bg-red-50 text-accent', text: 'El pago no se completó. Puedes intentarlo de nuevo.' }
    : pago === 'exito' ? { icon: Clock, cls: 'bg-amber-50 text-amber-800', text: 'Estamos confirmando tu pago con Mercado Pago…' }
    : order.status === 'PENDIENTE' ? { icon: Clock, cls: 'bg-amber-50 text-amber-800', text: 'Tu pedido está pendiente de pago.' } : null;

  return (
    <div className="container-x max-w-3xl py-10">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pedido {order.number}</h1>
          <p className="text-sm text-muted">{formatDate(order.createdAt)} · {order.email}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </header>

      {banner && (
        <div className={`mb-6 flex items-center gap-3 px-4 py-3 text-sm ${banner.cls}`} role="status">
          <banner.icon className="h-5 w-5 shrink-0" /> {banner.text}
          {order.status === 'PENDIENTE' && pago !== 'exito' && (
            <Button className="ml-auto" onClick={() => retry.mutate()} loading={retry.isPending}>Pagar ahora</Button>
          )}
        </div>
      )}

      {order.trackingNumber && <p className="mb-4 text-sm"><strong>Guía de envío:</strong> {order.trackingCarrier ? `${order.trackingCarrier} · ` : ''}{order.trackingNumber}</p>}
      <ul className="divide-y divide-line border-y border-line">
        {order.items.map((i) => (
          <li key={i.id} className="flex gap-4 py-4">
            <img src={assetUrl(i.imageUrl)} alt="" className="h-20 w-16 object-cover" />
            <div className="flex-1">
              <p className="font-semibold">{i.productName}</p>
              <p className="text-sm text-muted">{i.size} · {i.color} · {i.quantity} × {formatMXN(i.unitPrice)}</p>
            </div>
            <p className="font-semibold">{formatMXN(i.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        <div className="text-sm">
          <h2 className="label">{order.deliveryMethod === 'RECOGER' ? 'Recoger en tienda' : 'Envío a'}</h2>
          <p className="font-semibold">{order.deliveryMethod === 'RECOGER' ? `Recoge: ${a.fullName}` : a.fullName}</p>
          <p>{a.street} {a.extNumber}{a.intNumber ? ` int. ${a.intNumber}` : ''}</p>
          <p>{a.neighborhood}, {a.city}</p>
          <p>{a.state}, CP {a.postalCode}</p>
          <p className="text-muted">Tel. {a.phone}</p>
        </div>
        <dl className="space-y-1 text-sm">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMXN(order.subtotal)}</dd></div>
          {(order.discount ?? 0) > 0 && (
            <div className="flex justify-between text-green-700"><dt>Descuento{order.couponCode ? ` (${order.couponCode})` : ''}</dt><dd>-{formatMXN(order.discount ?? 0)}</dd></div>
          )}
          <div className="flex justify-between">
            <dt>{order.deliveryMethod === 'RECOGER' ? 'Entrega' : 'Envío'}</dt>
            <dd>{order.deliveryMethod === 'RECOGER' ? 'Recoger en tienda' : order.shippingCost === 0 ? 'Gratis' : formatMXN(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatMXN(order.total)}</dd></div>
        </dl>
      </div>

      <Link to="/tienda" className="btn-outline mt-10">Seguir comprando</Link>
    </div>
  );
}
