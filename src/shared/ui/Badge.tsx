import { cn } from '@/shared/lib/format';

const tones: Record<string, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  PAGADO: 'bg-blue-100 text-blue-800',
  ENVIADO: 'bg-violet-100 text-violet-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-neutral-200 text-neutral-700',
};

export const Badge = ({ children, tone = 'default', className }: { children: React.ReactNode; tone?: string; className?: string }) => (
  <span className={cn('inline-block rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wide', tones[tone] ?? 'bg-neutral-100 text-neutral-700', className)}>
    {children}
  </span>
);
