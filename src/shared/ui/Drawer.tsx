import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/format';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  side?: 'right' | 'left';
}

/** Panel lateral accesible: cierra con Esc y con clic fuera, bloquea el scroll del fondo. */
export function Drawer({ open, onClose, title, children, side = 'right' }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open, onClose]);

  return (
    <div className={cn('fixed inset-0 z-50', !open && 'pointer-events-none')} aria-hidden={!open}>
      <div className={cn('absolute inset-0 bg-black/40 transition-opacity', open ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
      <aside
        role="dialog" aria-modal="true" aria-label={title}
        className={cn('absolute top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300',
          side === 'right' ? 'right-0' : 'left-0',
          open ? 'translate-x-0' : side === 'right' ? 'translate-x-full' : '-translate-x-full')}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  );
}
