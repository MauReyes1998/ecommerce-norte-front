/** Cliente HTTP único. Agrega el token, desenvuelve { data, meta } y convierte errores en ApiError. */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'norte.token';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
}

export interface Paged<T> {
  data: T[];
  meta: PageMeta;
}

export const tokenStorage = {
  get: (): string | null => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (token: string | null) => {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token); else localStorage.removeItem(TOKEN_KEY);
    } catch { /* modo privado */ }
  },
};

export type Query = Record<string, string | number | boolean | string[] | undefined | null>;

function toQuery(q?: object): string {
  if (!q) return '';
  const params = new URLSearchParams();
  Object.entries(q as Query).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return;
    params.set(k, Array.isArray(v) ? v.join(',') : String(v));
  });
  const s = params.toString();
  return s ? `?${s}` : '';
}

interface Options {
  query?: object;
  body?: unknown;
  /** FormData para subir archivos; no se serializa a JSON. */
  form?: FormData;
}

async function request<T>(method: string, path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE_URL}${path}${toQuery(opts.query)}`, {
    method,
    headers,
    body: opts.form ?? (opts.body !== undefined ? JSON.stringify(opts.body) : undefined),
  });

  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = json?.error ?? {};
    if (res.status === 401) tokenStorage.set(null);
    throw new ApiError(res.status, err.code ?? 'ERROR', err.message ?? 'Algo salió mal', err.details);
  }
  // Listas paginadas regresan { data, meta }; el resto solo { data }.
  return 'meta' in json ? (json as T) : (json.data as T);
}

export const http = {
  get: <T>(path: string, query?: object) => request<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
  upload: <T>(path: string, form: FormData) => request<T>('POST', path, { form }),
};

/** Las imágenes subidas vienen como /uploads/...: se resuelven contra el backend. */
export function assetUrl(url: string | null | undefined): string {
  if (!url) return 'https://picsum.photos/seed/norte-placeholder/800/1067';
  if (url.startsWith('/')) return `${BASE_URL.replace(/\/api\/v1$/, '')}${url}`;
  return url;
}
