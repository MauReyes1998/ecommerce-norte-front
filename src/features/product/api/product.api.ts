import { http, Paged } from '@/shared/lib/http';
import { ProductDetail, ProductSummary } from '@/shared/types';

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  /** Nombre abreviado ("Ana L.") para no exponer el nombre completo. */
  author: string;
  isMine: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface ReviewSummary { average: number; count: number; distribution: Record<1 | 2 | 3 | 4 | 5, number> }
export interface ProductReviews extends Paged<Review> {
  summary: ReviewSummary;
  /** true solo si el usuario compró el producto. */
  canReview: boolean;
  mine: Review | null;
}
export interface ReviewInput { rating: number; title?: string; body: string }

export const productApi = {
  bySlug: (slug: string) => http.get<ProductDetail>(`/products/${slug}`),
  related: (slug: string) => http.get<ProductSummary[]>(`/products/${slug}/related`),
  reviews: (slug: string, page = 1) => http.get<ProductReviews>(`/products/${slug}/reviews`, { page, limit: 10 }),
  upsertReview: (slug: string, body: ReviewInput) => http.put<Review>(`/products/${slug}/reviews`, body),
  deleteReview: (id: string) => http.delete<void>(`/admin/reviews/${id}`),
  stockAlert: (slug: string, body: { variantId: string; email?: string }) =>
    http.post<{ email: string }>(`/products/${slug}/stock-alerts`, body),
};
