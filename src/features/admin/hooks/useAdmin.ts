import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OrderStatus } from '@/shared/types';
import { adminApi, CategoryInput, CouponInput, DashboardRange, ProductInput } from '../api/admin.api';

export const useDashboard = (range: DashboardRange) => useQuery({ queryKey: ['admin', 'dashboard', range], queryFn: () => adminApi.dashboard(range), refetchInterval: 60_000, placeholderData: keepPreviousData });
export const useAdminOrder = (id?: string | null) => useQuery({ queryKey: ['admin', 'order', id], queryFn: () => adminApi.order(id!), enabled: !!id });
export const useAdminCustomers = (q: { search?: string; page?: number }) => useQuery({ queryKey: ['admin', 'customers', q], queryFn: () => adminApi.customers({ ...q, limit: 20 }), placeholderData: keepPreviousData });

export const useAdminProducts = (q: Parameters<typeof adminApi.products>[0]) =>
  useQuery({ queryKey: ['admin', 'products', q], queryFn: () => adminApi.products(q), placeholderData: keepPreviousData });
export const useAdminProduct = (id?: string) => useQuery({ queryKey: ['admin', 'product', id], queryFn: () => adminApi.product(id!), enabled: !!id });

export function useProductMutations(id?: string) {
  const qc = useQueryClient();
  const done = () => { qc.invalidateQueries({ queryKey: ['admin', 'products'] }); qc.invalidateQueries({ queryKey: ['admin', 'product', id] }); qc.invalidateQueries({ queryKey: ['products'] }); };
  return {
    create: useMutation({ mutationFn: (b: ProductInput) => adminApi.createProduct(b), onSuccess: done }),
    update: useMutation({ mutationFn: (b: Partial<ProductInput>) => adminApi.updateProduct(id!, b), onSuccess: done }),
    remove: useMutation({ mutationFn: (pid: string) => adminApi.deleteProduct(pid), onSuccess: done }),
    upload: useMutation({ mutationFn: (files: File[]) => adminApi.uploadImages(id!, files), onSuccess: done }),
    reorder: useMutation({ mutationFn: (ids: string[]) => adminApi.reorderImages(id!, ids), onSuccess: done }),
    removeImage: useMutation({ mutationFn: (imageId: string) => adminApi.removeImage(id!, imageId), onSuccess: done }),
    bulk: useMutation({ mutationFn: (v: { ids: string[]; isActive?: boolean; isFeatured?: boolean }) => adminApi.bulkProducts(v.ids, { isActive: v.isActive, isFeatured: v.isFeatured }), onSuccess: done }),
    duplicate: useMutation({ mutationFn: (pid: string) => adminApi.duplicateProduct(pid), onSuccess: done }),
    setStock: useMutation({ mutationFn: (v: { variantId: string; stock: number }) => adminApi.setVariantStock(v.variantId, v.stock), onSuccess: done }),
  };
}

export const useAdminCategories = () => useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.categories });
export function useCategoryMutations() {
  const qc = useQueryClient();
  const done = () => { qc.invalidateQueries({ queryKey: ['admin', 'categories'] }); qc.invalidateQueries({ queryKey: ['categories'] }); };
  return {
    create: useMutation({ mutationFn: (b: CategoryInput) => adminApi.createCategory(b), onSuccess: done }),
    update: useMutation({ mutationFn: ({ id, ...b }: Partial<CategoryInput> & { id: string }) => adminApi.updateCategory(id, b), onSuccess: done }),
    remove: useMutation({ mutationFn: adminApi.deleteCategory, onSuccess: done }),
  };
}

export const useAdminCoupons = () => useQuery({ queryKey: ['admin', 'coupons'], queryFn: adminApi.coupons });
export function useCouponMutations() {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
  return {
    create: useMutation({ mutationFn: (b: CouponInput) => adminApi.createCoupon(b), onSuccess: done }),
    update: useMutation({ mutationFn: ({ id, ...b }: Partial<CouponInput> & { id: string }) => adminApi.updateCoupon(id, b), onSuccess: done }),
    remove: useMutation({ mutationFn: adminApi.deleteCoupon, onSuccess: done }),
  };
}

export const useAdminOrders = (q: Parameters<typeof adminApi.orders>[0]) =>
  useQuery({ queryKey: ['admin', 'orders', q], queryFn: () => adminApi.orders(q), placeholderData: keepPreviousData });
export function useOrderStatusMutation() {
  const qc = useQueryClient();
  const done = (_: unknown, v: { id: string }) => { qc.invalidateQueries({ queryKey: ['admin', 'orders'] }); qc.invalidateQueries({ queryKey: ['admin', 'order', v.id] }); qc.invalidateQueries({ queryKey: ['admin', 'dashboard'] }); };
  return useMutation({ mutationFn: ({ id, status, note }: { id: string; status: OrderStatus; note?: string }) => adminApi.updateOrderStatus(id, status, note), onSuccess: done });
}
export function useOrderUpdateMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...b }: { id: string; trackingCarrier?: string | null; trackingNumber?: string | null; adminNote?: string | null }) => adminApi.updateOrder(id, b),
    onSuccess: (_, v) => { qc.invalidateQueries({ queryKey: ['admin', 'order', v.id] }); qc.invalidateQueries({ queryKey: ['admin', 'orders'] }); },
  });
}
