import { ReactNode, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { Toaster } from '@/shared/ui';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: (count, err) => (err as { status?: number }).status === 404 ? false : count < 2, refetchOnWindowFocus: false } },
  }));
  const bootstrap = useAuthStore((s) => s.bootstrap);
  useEffect(() => { void bootstrap(); }, [bootstrap]);
  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
