import { http } from '@/shared/lib/http';
import { CouponType, DeliveryMethod, Order, ShippingAddress } from '@/shared/types';

export interface QuoteLine {
  variantId: string; productId: string; productName: string; productSlug: string; imageUrl: string | null;
  sku: string; size: string; color: string; unitPrice: number; requested: number; quantity: number; available: number; lineTotal: number;
  issue: 'OK' | 'SIN_STOCK' | 'STOCK_INSUFICIENTE' | 'NO_DISPONIBLE';
}
export type CouponIssue = 'NO_EXISTE' | 'INACTIVO' | 'NO_VIGENTE' | 'AGOTADO' | 'MINIMO';
export interface Quote {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  coupon: { code: string; type: CouponType; value: number } | null;
  couponIssue: CouponIssue | null;
  shippingCost: number;
  total: number;
  isValid: boolean;
}

export interface PickupContact { fullName: string; phone: string }

export interface CreateOrderInput {
  items: { variantId: string; quantity: number }[];
  deliveryMethod?: DeliveryMethod;
  couponCode?: string;
  /** Obligatoria para envío a domicilio. */
  shippingAddress?: ShippingAddress;
  /** Obligatorio para recoger en tienda. */
  pickupContact?: PickupContact;
  email?: string;
}
export interface CreateOrderResult { order: Order; checkoutUrl: string | null }

export const checkoutApi = {
  quote: (items: { variantId: string; quantity: number }[], deliveryMethod: DeliveryMethod = 'ENVIO', couponCode?: string) =>
    http.post<Quote>('/cart/quote', { items, deliveryMethod, couponCode }),
  createOrder: (body: CreateOrderInput) => http.post<CreateOrderResult>('/orders', body),
};
