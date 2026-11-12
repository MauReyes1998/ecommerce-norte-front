import { beforeEach, describe, expect, it } from 'vitest';
import { cartTotals, useCartStore } from './cart.store';

const item = { variantId: 'v1', productId: 'p1', slug: 'playera', name: 'Playera', imageUrl: null, size: 'M', color: 'Negro', unitPrice: 349, maxStock: 3 };

describe('cart store', () => {
  beforeEach(() => useCartStore.setState({ items: [], isOpen: false }));

  it('agrega y abre la bolsa', () => {
    useCartStore.getState().add(item);
    const s = useCartStore.getState();
    expect(s.items).toHaveLength(1);
    expect(s.isOpen).toBe(true);
  });

  it('suma cantidades de la misma variante sin pasar el stock', () => {
    useCartStore.getState().add(item, 2);
    useCartStore.getState().add(item, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('cantidad 0 elimina la línea', () => {
    useCartStore.getState().add(item);
    useCartStore.getState().setQuantity('v1', 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calcula envío y envío gratis', () => {
    expect(cartTotals([{ ...item, quantity: 2 }])).toMatchObject({ subtotal: 698, shippingCost: 149, total: 847, count: 2 });
    expect(cartTotals([{ ...item, quantity: 3 }]).shippingCost).toBe(0);
    expect(cartTotals([])).toMatchObject({ subtotal: 0, shippingCost: 0, total: 0 });
  });
});
