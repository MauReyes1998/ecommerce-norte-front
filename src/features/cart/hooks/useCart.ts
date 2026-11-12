import { useMemo } from 'react';
import { cartTotals, useCartStore } from '../store/cart.store';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const totals = useMemo(() => cartTotals(items), [items]);
  const { add, setQuantity, remove, clear, open, close, isOpen } = useCartStore();
  return { items, ...totals, add, setQuantity, remove, clear, open, close, isOpen };
}
