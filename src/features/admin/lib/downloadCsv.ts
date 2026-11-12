import { tokenStorage } from '@/shared/lib/http';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

/** Descarga un archivo de la API con el token (un <a href> normal no manda el Authorization). */
export async function downloadCsv(path: string, filename: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: { Authorization: `Bearer ${tokenStorage.get() ?? ''}` } });
  if (!res.ok) throw new Error('No se pudo exportar');
  const url = URL.createObjectURL(await res.blob());
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
