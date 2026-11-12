import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';

export function useAuth() {
  const { user, loading, logout } = useAuthStore();
  return { user, loading, isAdmin: user?.role === 'ADMIN', isLoggedIn: !!user, logout };
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({ mutationFn: authApi.login, onSuccess: setSession });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({ mutationFn: authApi.register, onSuccess: setSession });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({ mutationFn: authApi.updateMe, onSuccess: setUser });
}
