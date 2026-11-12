import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/product.api';

export const useProduct = (slug: string) => useQuery({ queryKey: ['product', slug], queryFn: () => productApi.bySlug(slug), enabled: !!slug });
export const useRelated = (slug: string) => useQuery({ queryKey: ['product', slug, 'related'], queryFn: () => productApi.related(slug), enabled: !!slug });
