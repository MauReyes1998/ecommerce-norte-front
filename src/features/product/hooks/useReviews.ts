import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productApi, ReviewInput } from '../api/product.api';

export const useReviews = (slug: string, page = 1) =>
  useQuery({ queryKey: ['reviews', slug, page], queryFn: () => productApi.reviews(slug, page), enabled: !!slug });

export function useReviewMutations(slug: string) {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: ['reviews', slug] });
  return {
    save: useMutation({ mutationFn: (b: ReviewInput) => productApi.upsertReview(slug, b), onSuccess: done }),
    remove: useMutation({ mutationFn: (id: string) => productApi.deleteReview(id), onSuccess: done }),
  };
}
