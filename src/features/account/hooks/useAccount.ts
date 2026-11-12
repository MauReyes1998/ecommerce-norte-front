import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountApi, AddressInput } from '../api/account.api';

export const useAddresses = (enabled = true) => useQuery({ queryKey: ['addresses'], queryFn: accountApi.addresses, enabled });

export function useAddressMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['addresses'] });
  return {
    create: useMutation({ mutationFn: (b: AddressInput) => accountApi.createAddress(b), onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, ...b }: Partial<AddressInput> & { id: string }) => accountApi.updateAddress(id, b), onSuccess: invalidate }),
    remove: useMutation({ mutationFn: accountApi.deleteAddress, onSuccess: invalidate }),
  };
}

export const useMyOrders = (page: number) => useQuery({ queryKey: ['orders', 'mine', page], queryFn: () => accountApi.orders(page) });
export const useOrder = (id: string, poll = false) =>
  useQuery({ queryKey: ['orders', id], queryFn: () => accountApi.order(id), enabled: !!id,
    // Después de pagar, el webhook puede tardar unos segundos: se consulta cada 4 s hasta que cambie.
    refetchInterval: (q) => (poll && q.state.data?.status === 'PENDIENTE' ? 4000 : false) });
