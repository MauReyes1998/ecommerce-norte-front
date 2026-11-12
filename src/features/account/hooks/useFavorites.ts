import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ProductSummary } from '@/shared/types';
import { useToast } from '@/shared/ui';
import { useAuth } from '@/features/auth';
import { accountApi } from '../api/account.api';

const KEY = ['favorites', 'ids'];

/** Ids de favoritos + toggle optimista. Sin sesión, manda a iniciar sesión. */
export function useFavorites() {
  const { isLoggedIn } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const toast = useToast((s) => s.push);

  const { data } = useQuery({ queryKey: KEY, queryFn: accountApi.favoriteIds, enabled: isLoggedIn, staleTime: 60_000 });
  const ids = new Set(data ?? []);

  const mutation = useMutation({
    mutationFn: async (p: ProductSummary) => (ids.has(p.id) ? accountApi.removeFavorite(p.id) : accountApi.addFavorite(p.slug)),
    onMutate: async (p) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData<string[]>(KEY) ?? [];
      qc.setQueryData<string[]>(KEY, prev.includes(p.id) ? prev.filter((x) => x !== p.id) : [...prev, p.id]);
      return { prev };
    },
    onError: (_e, _p, ctx) => { qc.setQueryData(KEY, ctx?.prev); toast('No se pudo actualizar favoritos', 'error'); },
    onSettled: () => { qc.invalidateQueries({ queryKey: KEY }); qc.invalidateQueries({ queryKey: ['favorites', 'list'] }); },
  });

  const toggle = (p: ProductSummary) => {
    if (!isLoggedIn) { toast('Inicia sesión para guardar favoritos'); navigate('/cuenta/entrar'); return; }
    mutation.mutate(p);
  };

  return { ids, toggle };
}

export const useFavoriteList = () => useQuery({ queryKey: ['favorites', 'list'], queryFn: accountApi.favorites });
