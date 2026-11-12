import { http } from '@/shared/lib/http';
import { ProductDetail, ProductSummary } from '@/shared/types';

export const productApi = {
  bySlug: (slug: string) => http.get<ProductDetail>(`/products/${slug}`),
  related: (slug: string) => http.get<ProductSummary[]>(`/products/${slug}/related`),
};
