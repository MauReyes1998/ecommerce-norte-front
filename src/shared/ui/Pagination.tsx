import { PageMeta } from '@/shared/lib/http';
import { Button } from './Button';

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (p: number) => void }) {
  if (meta.totalPages <= 1) return null;
  return (
    <nav className="mt-10 flex items-center justify-center gap-4 text-sm" aria-label="Paginación">
      <Button variant="outline" disabled={meta.page <= 1} onClick={() => onPage(meta.page - 1)}>Anterior</Button>
      <span className="text-muted">Página {meta.page} de {meta.totalPages}</span>
      <Button variant="outline" disabled={!meta.hasNext} onClick={() => onPage(meta.page + 1)}>Siguiente</Button>
    </nav>
  );
}
