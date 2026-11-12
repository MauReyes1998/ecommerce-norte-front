import { create } from 'zustand';
import { CheckCircle2, XCircle } from 'lucide-react';

interface Toast { id: number; message: string; kind: 'ok' | 'error' }
interface ToastState { toasts: Toast[]; push: (message: string, kind?: Toast['kind']) => void; remove: (id: number) => void }

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, kind = 'ok') => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, message, kind }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="flex items-center gap-2 bg-ink px-4 py-3 text-sm text-white shadow-lg">
          {t.kind === 'ok' ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-red-400" />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
