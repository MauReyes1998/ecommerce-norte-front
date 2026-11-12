import { FormEvent, useEffect, useState } from 'react';
import { OrderStatus } from '@/shared/types';
import { assetUrl } from '@/shared/lib/http';
import { cn, formatDate, formatMXN, ORDER_STATUS_LABEL } from '@/shared/lib/format';
import { Button, Drawer, Input, Textarea, useToast } from '@/shared/ui';
import { OrderStatusBadge } from '@/features/account';
import { useAdminOrder, useOrderStatusMutation, useOrderUpdateMutation } from '../hooks/useAdmin';

export const NEXT: Record<OrderStatus, OrderStatus[]> = { PENDIENTE: ['PAGADO', 'CANCELADO'], PAGADO: ['ENVIADO', 'CANCELADO'], ENVIADO: ['ENTREGADO'], ENTREGADO: [], CANCELADO: [] };
const CARRIERS = ['Estafeta', 'DHL', 'FedEx', 'Paquetexpress', 'Correos de México', 'J&T', 'Otro'];

export function OrderDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data: o, isLoading } = useAdminOrder(id);
  const status = useOrderStatusMutation();
  const update = useOrderUpdateMutation();
  const toast = useToast((s) => s.push);
  const [ship, setShip] = useState({ trackingCarrier: '', trackingNumber: '' });
  const [note, setNote] = useState('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => { if (o) { setShip({ trackingCarrier: o.trackingCarrier ?? '', trackingNumber: o.trackingNumber ?? '' }); setNote(o.adminNote ?? ''); setStatusNote(''); } }, [o]);

  const change = (next: OrderStatus) => {
    if (!o) return;
    if (next === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido ${o.number}? Se regresará el stock.`)) return;
    if (next === 'ENVIADO' && !o.trackingNumber && !ship.trackingNumber && !window.confirm('No has capturado la guía. ¿Marcar como enviado de todos modos?')) return;
    const go = () => status.mutate({ id: o.id, status: next, note: statusNote || undefined }, { onSuccess: () => toast(`Pedido ${o.number}: ${ORDER_STATUS_LABEL[next]}`), onError: (e) => toast(e.message, 'error') });
    // Si capturó guía y va a enviar, primero la guarda para que vaya en el correo.
    if (next === 'ENVIADO' && ship.trackingNumber && ship.trackingNumber !== o.trackingNumber) update.mutate({ id: o.id, ...ship }, { onSuccess: go });
    else go();
  };
  const saveShip = (e: FormEvent) => { e.preventDefault(); if (o) update.mutate({ id: o.id, trackingCarrier: ship.trackingCarrier || null, trackingNumber: ship.trackingNumber || null }, { onSuccess: () => toast('Guía guardada') }); };
  const saveNote = () => { if (o) update.mutate({ id: o.id, adminNote: note || null }, { onSuccess: () => toast('Nota guardada') }); };

  return (
    <Drawer open={!!id} onClose={onClose} title={o ? `Pedido ${o.number}` : 'Pedido'}>
      {isLoading || !o ? <p className="p-5 text-sm text-muted">Cargando…</p> : (
        <div className="space-y-6 p-5 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={o.status} />
            <span className="text-muted">{formatDate(o.createdAt)}</span>
            <span className="text-muted">· Pago: {o.paymentStatus}{o.mpPaymentId ? ` (${o.mpPaymentId})` : ''}</span>
          </div>

          {NEXT[o.status].length > 0 && (
            <section className="space-y-2 border border-line bg-paper p-3">
              <p className="label">Cambiar estatus</p>
              <input className="input" placeholder="Nota para el historial (opcional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} aria-label="Nota" />
              <div className="flex flex-wrap gap-2">
                {NEXT[o.status].map((n) => <Button key={n} variant={n === 'CANCELADO' ? 'ghost' : 'primary'} onClick={() => change(n)} loading={status.isPending}>{ORDER_STATUS_LABEL[n]}</Button>)}
              </div>
            </section>
          )}

          <section>
            <p className="label">Artículos ({o.itemCount})</p>
            <ul className="divide-y divide-line border-y border-line">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-2">
                  <img src={assetUrl(i.imageUrl)} alt="" className="h-12 w-9 object-cover" />
                  <span className="flex-1">{i.productName}<span className="block text-xs text-muted">{i.sku} · {i.size} / {i.color} · {i.quantity} × {formatMXN(i.unitPrice)}</span></span>
                  <span className="font-semibold tabular-nums">{formatMXN(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMXN(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt>Envío</dt><dd>{formatMXN(o.shippingCost)}</dd></div>
              <div className="flex justify-between border-t border-line pt-1 font-bold"><dt>Total</dt><dd>{formatMXN(o.total)}</dd></div>
            </dl>
          </section>

          <section>
            <p className="label">Cliente y envío</p>
            <p className="font-semibold">{o.shippingAddress.fullName} <span className="font-normal text-muted">· {o.email}{o.userId ? '' : ' · invitado'}</span></p>
            <p>{o.shippingAddress.street} {o.shippingAddress.extNumber}{o.shippingAddress.intNumber ? ` int. ${o.shippingAddress.intNumber}` : ''}</p>
            <p>{o.shippingAddress.neighborhood}, {o.shippingAddress.city}, {o.shippingAddress.state}, CP {o.shippingAddress.postalCode}</p>
            <p className="text-muted">Tel. {o.shippingAddress.phone}{o.shippingAddress.references ? ` · ${o.shippingAddress.references}` : ''}</p>
          </section>

          {(o.status === 'PAGADO' || o.status === 'ENVIADO' || o.status === 'ENTREGADO') && (
            <form onSubmit={saveShip} className="space-y-2">
              <p className="label">Guía de envío</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="sr-only" htmlFor="carrier">Paquetería</label>
                  <input id="carrier" list="carriers" className="input" placeholder="Paquetería" value={ship.trackingCarrier} onChange={(e) => setShip({ ...ship, trackingCarrier: e.target.value })} />
                  <datalist id="carriers">{CARRIERS.map((c) => <option key={c} value={c} />)}</datalist>
                </div>
                <Input label="Número de guía" id="tracking" value={ship.trackingNumber} onChange={(e) => setShip({ ...ship, trackingNumber: e.target.value })} className="[&>label]:sr-only" placeholder="Número de guía" />
              </div>
              <Button type="submit" variant="outline" loading={update.isPending}>Guardar guía</Button>
            </form>
          )}

          <section className="space-y-2">
            <Textarea label="Nota interna (no la ve el cliente)" value={note} onChange={(e) => setNote(e.target.value)} />
            <Button variant="outline" onClick={saveNote} loading={update.isPending} disabled={note === (o.adminNote ?? '')}>Guardar nota</Button>
          </section>

          <section>
            <p className="label">Historial</p>
            <ol className="relative ml-2 border-l border-line pl-4">
              {o.history.map((h) => (
                <li key={h.id} className="relative pb-4">
                  <span className={cn('absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white', h.toStatus === 'CANCELADO' ? 'bg-accent' : 'bg-ink')} />
                  <p className="font-semibold">{ORDER_STATUS_LABEL[h.toStatus]}{h.fromStatus && h.fromStatus !== h.toStatus ? <span className="font-normal text-muted"> (antes: {ORDER_STATUS_LABEL[h.fromStatus]})</span> : null}</p>
                  <p className="text-xs text-muted">{formatDate(h.createdAt)} · {h.actor}{h.note ? ` · ${h.note}` : ''}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
}
