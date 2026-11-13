import { FormEvent, useState } from 'react';
import { Tag, X } from 'lucide-react';
import { CartItem, CartLine } from '@/features/cart';
import { formatMXN } from '@/shared/lib/format';
import { DeliveryMethod } from '@/shared/types';
import { Button, Input } from '@/shared/ui';
import { CouponIssue, Quote } from '../api/checkout.api';

export const COUPON_ISSUE_LABEL: Record<CouponIssue, string> = {
  NO_EXISTE: 'Ese cupón no existe.',
  INACTIVO: 'Ese cupón ya no está activo.',
  NO_VIGENTE: 'Ese cupón no está vigente.',
  AGOTADO: 'Ese cupón ya alcanzó su límite de usos.',
  MINIMO: 'Tu compra no alcanza el mínimo para usar ese cupón.',
};

interface CouponControls {
  /** Código que el cliente pidió aplicar (null = ninguno). */
  code: string | null;
  onApply: (code: string) => void;
  onRemove: () => void;
}

interface Props {
  items: CartItem[];
  quote?: Quote;
  fallback: { subtotal: number; shippingCost: number; total: number };
  delivery?: DeliveryMethod;
  coupon?: CouponControls;
}

export function OrderSummaryPanel({ items, quote, fallback, delivery = 'ENVIO', coupon }: Props) {
  const t = quote ?? fallback;
  const pickup = delivery === 'RECOGER';
  const discount = quote?.discount ?? 0;
  const applied = quote?.coupon ?? null;
  const issue = coupon?.code && quote ? quote.couponIssue : null;
  const [draft, setDraft] = useState('');

  const apply = (e: FormEvent) => {
    e.preventDefault();
    const code = draft.trim().toUpperCase();
    if (code) coupon?.onApply(code);
  };
  const remove = () => { setDraft(''); coupon?.onRemove(); };

  return (
    <aside className="h-fit bg-paper p-6 lg:sticky lg:top-24">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide">Tu pedido</h2>
      <div className="divide-y divide-line">
        {items.map((i) => <CartLine key={i.variantId} item={i} compact onQuantity={() => {}} onRemove={() => {}} />)}
      </div>

      {coupon && (
        <div className="mt-4 border-t border-line pt-4">
          {applied ? (
            <p className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2"><Tag className="h-4 w-4" aria-hidden /> Cupón <strong>{applied.code}</strong> aplicado</span>
              <button type="button" onClick={remove} className="text-muted hover:text-ink" aria-label="Quitar cupón"><X className="h-4 w-4" /></button>
            </p>
          ) : (
            <form onSubmit={apply} className="flex items-end gap-2">
              <Input label="Cupón" placeholder="Ej. BIENVENIDO10" autoComplete="off" className="flex-1" value={draft}
                onChange={(e) => setDraft(e.target.value.toUpperCase())} />
              <Button type="submit" variant="outline" disabled={!draft.trim()}>Aplicar</Button>
            </form>
          )}
          {issue && <p role="alert" className="mt-2 text-xs text-accent">{COUPON_ISSUE_LABEL[issue] ?? 'Cupón inválido.'}</p>}
        </div>
      )}

      <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatMXN(t.subtotal)}</dd></div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <dt>Descuento{applied ? ` (${applied.code})` : ''}</dt><dd>-{formatMXN(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>{pickup ? 'Entrega' : 'Envío'}</dt>
          <dd>{pickup ? 'Recoger en tienda · Gratis' : t.shippingCost === 0 ? 'Gratis' : formatMXN(t.shippingCost)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Total</dt><dd>{formatMXN(t.total)}</dd></div>
      </dl>
      <p className="mt-4 text-xs text-muted">Pagas de forma segura con Mercado Pago: tarjeta, OXXO o transferencia.</p>
    </aside>
  );
}
