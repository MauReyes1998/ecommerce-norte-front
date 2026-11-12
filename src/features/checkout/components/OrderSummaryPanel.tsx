import { CartItem, CartLine } from '@/features/cart';
import { formatMXN } from '@/shared/lib/format';
import { Quote } from '../api/checkout.api';

interface Props { items: CartItem[]; quote?: Quote; fallback: { subtotal: number; shippingCost: number; total: number } }

export function OrderSummaryPanel({ items, quote, fallback }: Props) {
  const t = quote ?? fallback;
  return (
    <aside className="h-fit bg-paper p-6 lg:sticky lg:top-24">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Tu pedido</h2>
      <div className="divide-y divide-line">
        {items.map((i) => <CartLine key={i.variantId} item={i} compact onQuantity={() => {}} onRemove={() => {}} />)}
      </div>
      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMXN(t.subtotal)}</dd></div>
        <div className="flex justify-between"><dt>Envío</dt><dd>{t.shippingCost === 0 ? 'Gratis' : formatMXN(t.shippingCost)}</dd></div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatMXN(t.total)}</dd></div>
      </dl>
      <p className="mt-4 text-xs text-muted">Pagas de forma segura con Mercado Pago: tarjeta, OXXO o transferencia.</p>
    </aside>
  );
}
