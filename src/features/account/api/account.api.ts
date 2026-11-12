import { http, Paged } from '@/shared/lib/http';
import { Order, OrderSummary, ProductSummary, ShippingAddress } from '@/shared/types';

export interface Address extends ShippingAddress { id: string; isDefault: boolean }
export type AddressInput = ShippingAddress & { isDefault?: boolean };

export const accountApi = {
  addresses: () => http.get<Address[]>('/account/addresses'),
  createAddress: (body: AddressInput) => http.post<Address>('/account/addresses', body),
  updateAddress: (id: string, body: Partial<AddressInput>) => http.patch<Address>(`/account/addresses/${id}`, body),
  deleteAddress: (id: string) => http.delete<void>(`/account/addresses/${id}`),
  favorites: () => http.get<ProductSummary[]>('/account/favorites'),
  favoriteIds: () => http.get<string[]>('/account/favorites/ids'),
  addFavorite: (slug: string) => http.post<void>(`/account/favorites/${slug}`),
  removeFavorite: (productId: string) => http.delete<void>(`/account/favorites/${productId}`),
  orders: (page = 1) => http.get<Paged<OrderSummary>>('/orders', { page, limit: 10 }),
  order: (id: string) => http.get<Order>(`/orders/${id}`),
  retryCheckout: (id: string) => http.post<{ checkoutUrl: string }>(`/orders/${id}/checkout`),
};
