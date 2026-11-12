import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const MAX_QTY = 10;
export const SHIPPING_COST = 149;
export const FREE_SHIPPING_FROM = 999;

export interface CartItem {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  size: string;
  color: string;
  unitPrice: number;
  quantity: number;
  /** stock conocido al momento de agregar; el servidor lo vuelve a validar en checkout. */
  maxStock: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, quantity = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const cap = Math.min(MAX_QTY, item.maxStock);
          if (existing) {
            return {
              isOpen: true,
              items: s.items.map((i) => i.variantId === item.variantId ? { ...i, quantity: Math.min(cap, i.quantity + quantity) } : i),
            };
          }
          return { isOpen: true, items: [...s.items, { ...item, quantity: Math.min(cap, quantity) }] };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: quantity <= 0
            ? s.items.filter((i) => i.variantId !== variantId)
            : s.items.map((i) => i.variantId === variantId ? { ...i, quantity: Math.min(MAX_QTY, i.maxStock, quantity) } : i),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: 'norte.cart', partialize: (s) => ({ items: s.items }) },
  ),
);

/** Totales calculados en el cliente para mostrar; el backend recalcula al cotizar y al pagar. */
export function cartTotals(items: CartItem[]) {
  const subtotal = Math.round(items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) / 100;
  const shippingCost = subtotal === 0 || subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_COST;
  const count = items.reduce((s, i) => s + i.quantity, 0);
  return { subtotal, shippingCost, total: Math.round((subtotal + shippingCost) * 100) / 100, count };
}
