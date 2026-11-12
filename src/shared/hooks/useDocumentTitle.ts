import { useEffect } from 'react';

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · NORTE` : 'NORTE · Ropa urbana';
  }, [title]);
}
