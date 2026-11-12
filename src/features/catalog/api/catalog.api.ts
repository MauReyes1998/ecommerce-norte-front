import { http, Paged } from '@/shared/lib/http';
import { Category, Gender, ProductSummary } from '@/shared/types';

export type ProductSort = 'newest' | 'price_asc' | 'price_desc';

export interface ProductFilters {
  category?: string;
  gender?: Gender;
  sizes?: string[];
  colors?: string[];
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  featured?: boolean;
  search?: string;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  sizes: string[];
  colors: { name: string; hex: string | null }[];
  priceRange: { min: number; max: number };
}

export const catalogApi = {
  categories: () => http.get<Category[]>('/categories'),
  products: (filters: ProductFilters) => http.get<Paged<ProductSummary>>('/products', filters),
  filterOptions: (q: { category?: string; gender?: Gender }) => http.get<FilterOptions>('/products/filters', q),
};
