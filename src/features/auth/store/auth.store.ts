import { create } from 'zustand';
import { tokenStorage } from '@/shared/lib/http';
import { User } from '@/shared/types';
import { authApi, Session } from '../api/auth.api';

interface AuthState {
  user: User | null;
  /** true mientras se verifica el token guardado al abrir la app. */
  loading: boolean;
  setSession: (s: Session) => void;
  setUser: (u: User) => void;
  logout: () => void;
  bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: !!tokenStorage.get(),
  setSession: (s) => { tokenStorage.set(s.accessToken); set({ user: s.user, loading: false }); },
  setUser: (user) => set({ user }),
  logout: () => { tokenStorage.set(null); set({ user: null, loading: false }); },
  bootstrap: async () => {
    if (!tokenStorage.get()) return set({ loading: false });
    try { set({ user: await authApi.me(), loading: false }); }
    catch { tokenStorage.set(null); set({ user: null, loading: false }); }
  },
}));
