import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }

export function Modal({ open, onClose, title, children, wide }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`relative max-h-[90vh] w-full overflow-y-auto bg-white p-6 shadow-xl ${wide ? 'max-w-3xl' : 'max-w-lg'}`}>
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-neutral-100" aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </header>
        {children}
      </div>
    </div>
  );
}
