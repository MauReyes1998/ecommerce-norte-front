import { http, Paged } from '@/shared/lib/http';
import { CouponType, Gender, Order, OrderStatus, ProductImage } from '@/shared/types';

export interface AdminCoupon {
  id: string; code: string; type: CouponType; value: number; minSubtotal: number | null;
  startsAt: string | null; endsAt: string | null; maxUses: number | null; usedCount: number; isActive: boolean; createdAt: string;
}
export interface CouponInput {
  code: string; type: CouponType; value?: number; minSubtotal?: number | null;
  startsAt?: string | null; endsAt?: string | null; maxUses?: number | null; isActive?: boolean;
}

export interface AdminVariant {
  id?: string; sku: string; size: string; color: string; colorHex?: string | null; stock: number; price?: number | null; salePrice?: number | null; isActive?: boolean;
}
export interface AdminProduct {
  id: string; name: string; slug: string; description: string; gender: Gender; category: { id: string; name: string; slug: string };
  basePrice: number; salePrice: number | null; isFeatured: boolean; isActive: boolean; totalStock: number;
  images: ProductImage[]; variants: (AdminVariant & { id: string })[]; createdAt: string;
}
export interface ProductInput {
  name: string; slug?: string; description: string; gender: Gender; categoryId: string; basePrice: number; salePrice?: number | null;
  isFeatured?: boolean; isActive?: boolean; variants: AdminVariant[];
}
export interface AdminCategory { id: string; name: string; slug: string; parentId: string | null; imageUrl: string | null; sortOrder: number; isActive: boolean; productCount?: number }
export interface CategoryInput { name: string; slug?: string; parentId?: string | null; imageUrl?: string | null; sortOrder?: number; isActive?: boolean }
export interface OrderEvent { id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; note: string | null; actor: string; createdAt: string }
export interface AdminOrderRow extends Order { itemCount?: number }
export interface AdminOrderDetail extends Order { userId: string | null; mpPaymentId: string | null; trackingCarrier: string | null; trackingNumber: string | null; adminNote: string | null; history: OrderEvent[]; itemCount: number }
export interface AdminCustomer { id: string; name: string; email: string; phone: string | null; role: 'CUSTOMER' | 'ADMIN'; createdAt: string; ordersCount: number; totalSpent: number; lastOrderAt: string | null }
export type DashboardRange = 7 | 30 | 90;
export interface DashboardStats {
  rangeDays: number;
  today: { orders: number; revenue: number };
  month: { orders: number; revenue: number };
  range: { orders: number; revenue: number; avgTicket: number; unitsSold: number; newCustomers: number };
  revenueChangePct: number | null;
  conversion: { created: number; paid: number; cancelled: number; rate: number };
  pendingOrders: number;
  salesByCategory: { categoryId: string; categoryName: string; revenue: number; units: number }[];
  recentOrders: { id: string; number: number; email: string; customerName: string; status: OrderStatus; total: number; createdAt: string }[];
  topProducts: { productId: string | null; productName: string; units: number; revenue: number }[];
  lowStock: { variantId: string; productName: string; sku: string; size: string; color: string; stock: number }[];
  salesByDay: { date: string; revenue: number; orders: number }[];
}

export const adminApi = {
  coupons: () => http.get<AdminCoupon[]>('/admin/coupons'),
  createCoupon: (b: CouponInput) => http.post<AdminCoupon>('/admin/coupons', b),
  updateCoupon: (id: string, b: Partial<CouponInput>) => http.patch<AdminCoupon>(`/admin/coupons/${id}`, b),
  deleteCoupon: (id: string) => http.delete<void>(`/admin/coupons/${id}`),
  dashboard: (range: DashboardRange) => http.get<DashboardStats>('/admin/dashboard', { range }),
  reportCsvUrl: (type: 'dias' | 'productos' | 'categorias', range: DashboardRange) => `/admin/reports/${type}.csv?range=${range}`,
  bulkProducts: (ids: string[], data: { isActive?: boolean; isFeatured?: boolean }) => http.patch<{ updated: number }>('/admin/products/bulk', { ids, ...data }),
  duplicateProduct: (id: string) => http.post<AdminProduct>(`/admin/products/${id}/duplicate`),
  setVariantStock: (variantId: string, stock: number) => http.patch<{ id: string; stock: number }>(`/admin/variants/${variantId}/stock`, { stock }),
  order: (id: string) => http.get<AdminOrderDetail>(`/admin/orders/${id}`),
  updateOrder: (id: string, b: { trackingCarrier?: string | null; trackingNumber?: string | null; adminNote?: string | null }) => http.patch<AdminOrderDetail>(`/admin/orders/${id}`, b),
  customers: (q: { search?: string; page?: number; limit?: number }) => http.get<Paged<AdminCustomer>>('/admin/customers', q),
  ordersCsvUrl: (q: { status?: OrderStatus; search?: string }) => { const p = new URLSearchParams(); if (q.status) p.set('status', q.status); if (q.search) p.set('search', q.search); return `/admin/orders/export.csv?${p}`; },
  products: (q: { search?: string; categoryId?: string; isActive?: boolean; lowStock?: boolean; page?: number; limit?: number }) => http.get<Paged<AdminProduct>>('/admin/products', q),
  product: (id: string) => http.get<AdminProduct>(`/admin/products/${id}`),
  createProduct: (b: ProductInput) => http.post<AdminProduct>('/admin/products', b),
  updateProduct: (id: string, b: Partial<ProductInput>) => http.patch<AdminProduct>(`/admin/products/${id}`, b),
  deleteProduct: (id: string) => http.delete<void>(`/admin/products/${id}`),
  uploadImages: (id: string, files: File[]) => { const f = new FormData(); files.forEach((x) => f.append('images', x)); return http.upload<AdminProduct>(`/admin/products/${id}/images`, f); },
  reorderImages: (id: string, imageIds: string[]) => http.patch<AdminProduct>(`/admin/products/${id}/images/order`, { imageIds }),
  removeImage: (id: string, imageId: string) => http.delete<AdminProduct>(`/admin/products/${id}/images/${imageId}`),
  categories: () => http.get<AdminCategory[]>('/admin/categories'),
  createCategory: (b: CategoryInput) => http.post<AdminCategory>('/admin/categories', b),
  updateCategory: (id: string, b: Partial<CategoryInput>) => http.patch<AdminCategory>(`/admin/categories/${id}`, b),
  deleteCategory: (id: string) => http.delete<void>(`/admin/categories/${id}`),
  orders: (q: { status?: OrderStatus; search?: string; page?: number; limit?: number }) => http.get<Paged<AdminOrderRow>>('/admin/orders', q),
  updateOrderStatus: (id: string, status: OrderStatus, note?: string) => http.patch<AdminOrderDetail>(`/admin/orders/${id}/status`, { status, note }),
};
