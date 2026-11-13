import { useEffect } from 'react';

const SITE = 'NORTE';
const DEFAULT_TITLE = 'NORTE · Ropa urbana';
const DEFAULT_DESCRIPTION = 'NORTE · ropa urbana para hombre y mujer. Envíos a todo México.';
/** Imagen por defecto para compartir (1200×630). Súbela a public/og.jpg. */
const DEFAULT_IMAGE = '/og.jpg';

export interface SeoProps {
  title?: string;
  description?: string;
  /** Ruta relativa (/uploads/...) o URL absoluta. */
  image?: string | null;
  /** Ruta canónica; por defecto la ruta actual. */
  path?: string;
  type?: 'website' | 'product';
  /** Páginas privadas o de resultados que no deben indexarse. */
  noindex?: boolean;
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Título, descripción, Open Graph y canonical de la página actual.
 * Google sí ejecuta JS y lo lee; WhatsApp/Facebook solo leen las etiquetas estáticas de index.html.
 */
export function useSeo({ title, description, image, path, type = 'website', noindex = false }: SeoProps) {
  useEffect(() => {
    const origin = window.location.origin;
    const fullTitle = title ? `${title} · ${SITE}` : DEFAULT_TITLE;
    const desc = (description ?? DEFAULT_DESCRIPTION).replace(/\s+/g, ' ').trim().slice(0, 160);
    const url = `${origin}${path ?? window.location.pathname}`;
    const img = image ?? DEFAULT_IMAGE;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', img.startsWith('http') ? img : `${origin}${img}`);
    setCanonical(url);
  }, [title, description, image, path, type, noindex]);
}

/** Atajo para páginas que solo necesitan título. */
export function useDocumentTitle(title?: string, noindex = false) {
  useSeo({ title, noindex });
}
