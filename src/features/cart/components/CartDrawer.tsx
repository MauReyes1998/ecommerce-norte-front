import { Link } from 'react-router-dom';
import { Button, Drawer } from '@/shared/ui';
import { formatMXN } from '@/shared/lib/format';
import { useCart } from '../hooks/useCart';
import { CartLine } from './CartLine';
import { FREE_SHIPPING_FROM } from '../store/cart.store';

export function CartDrawer() {
  const cart = useCart();
  const missing = FREE_SHIPPING_FROM - cart.subtotal;

  return (
    <Drawer open={cart.isOpen} onClose={cart.close} title={`Tu bolsa (${cart.count})`}>
      {cart.items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted">Tu bolsa está vacía.</p>
          <Button variant="outline" onClick={cart.close}>Seguir comprando</Button>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 divide-y divide-line overflow-y-auto px-5">
            {cart.items.map((i) => (
              <CartLine key={i.variantId} item={i} onQuantity={(q) => cart.setQuantity(i.variantId, q)} onRemove={() => cart.remove(i.variantId)} />
            ))}
          </div>
          <footer className="space-y-3 border-t border-line p-5">
            {missing > 0 ? (
              <p className="text-xs text-muted">Agrega <strong>{formatMXN(missing)}</strong> más y el envío es gratis.</p>
            ) : (
              <p className="text-xs font-semibold text-green-700">Tienes envío gratis.</p>
            )}
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatMXN(cart.subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Envío</span><span>{cart.shippingCost === 0 ? 'Gratis' : formatMXN(cart.shippingCost)}</span></div>
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatMXN(cart.total)}</span></div>
            <Link to="/checkout" onClick={cart.close} className="btn-primary w-full">Pagar</Link>
          </footer>
        </div>
      )}
    </Drawer>
  );
}
