import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { catalogApi, ProductFilters } from '../api/catalog.api';
import { Gender } from '@/shared/types';

export const catalogKeys = {
  categories: ['categories'] as const,
  products: (f: ProductFilters) => ['products', f] as const,
  filters: (q: { category?: string; gender?: Gender }) => ['product-filters', q] as const,
};

export const useCategories = () => useQuery({ queryKey: catalogKeys.categories, queryFn: catalogApi.categories, staleTime: 10 * 60_000 });

export const useProducts = (filters: ProductFilters) =>
  useQuery({ queryKey: catalogKeys.products(filters), queryFn: () => catalogApi.products(filters), placeholderData: keepPreviousData });

export const useFilterOptions = (q: { category?: string; gender?: Gender }) =>
  useQuery({ queryKey: catalogKeys.filters(q), queryFn: () => catalogApi.filterOptions(q), staleTime: 5 * 60_000 });
