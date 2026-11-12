import { http } from '@/shared/lib/http';
import { Order, ShippingAddress } from '@/shared/types';

export interface QuoteLine {
  variantId: string; productId: string; productName: string; productSlug: string; imageUrl: string | null;
  sku: string; size: string; color: string; unitPrice: number; requested: number; quantity: number; available: number; lineTotal: number;
  issue: 'OK' | 'SIN_STOCK' | 'STOCK_INSUFICIENTE' | 'NO_DISPONIBLE';
}
export interface Quote { lines: QuoteLine[]; subtotal: number; shippingCost: number; total: number; isValid: boolean }

export interface CreateOrderInput { items: { variantId: string; quantity: number }[]; shippingAddress: ShippingAddress; email?: string }
export interface CreateOrderResult { order: Order; checkoutUrl: string | null }

export const checkoutApi = {
  quote: (items: { variantId: string; quantity: number }[]) => http.post<Quote>('/cart/quote', { items }),
  createOrder: (body: CreateOrderInput) => http.post<CreateOrderResult>('/orders', body),
};
