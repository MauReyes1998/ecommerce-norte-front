import { http } from '@/shared/lib/http';
import { User } from '@/shared/types';

export interface Session { user: User; accessToken: string; expiresIn: string }

export const authApi = {
  login: (body: { email: string; password: string }) => http.post<Session>('/auth/login', body),
  register: (body: { email: string; name: string; phone?: string; password: string }) => http.post<Session>('/auth/register', body),
  me: () => http.get<User>('/auth/me'),
  updateMe: (body: { name?: string; phone?: string }) => http.patch<User>('/auth/me', body),
  forgotPassword: (email: string) => http.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => http.post<{ message: string }>('/auth/reset-password', { token, password }),
};
