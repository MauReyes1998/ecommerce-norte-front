import { useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DeliveryMethod } from '@/shared/types';
import { useCart } from '@/features/cart';
import { checkoutApi, Quote } from '../api/checkout.api';

/** Cotiza el carrito en el servidor y sincroniza cantidades si el stock cambió. */
export function useQuote(delivery: DeliveryMethod = 'ENVIO', couponCode?: string) {
  const cart = useCart();
  const items = cart.items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }));
  const query = useQuery({
    queryKey: ['cart-quote', items, delivery, couponCode ?? null],
    queryFn: () => checkoutApi.quote(items, delivery, couponCode),
    enabled: items.length > 0,
    staleTime: 30_000,
  });

  useEffect(() => {
    const q = query.data;
    if (!q || q.isValid) return;
    q.lines.forEach((l) => {
      if (l.issue === 'NO_DISPONIBLE' || l.issue === 'SIN_STOCK') cart.remove(l.variantId);
      else if (l.issue === 'STOCK_INSUFICIENTE') cart.setQuantity(l.variantId, l.quantity);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}

export const useCreateOrder = () => useMutation({ mutationFn: checkoutApi.createOrder });

export const issueLabel = (q: Quote) =>
  q.lines.filter((l) => l.issue !== 'OK').map((l) =>
    l.issue === 'STOCK_INSUFICIENTE' ? `${l.productName} (${l.size}): solo quedan ${l.available}, ajustamos la cantidad.`
    : `${l.productName} (${l.size}) ya no está disponible y se quitó de tu bolsa.`);
