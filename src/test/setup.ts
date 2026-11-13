import '@testing-library/jest-dom/vitest';

// Node 25+ expone globalThis.localStorage (vacío si no se pasa --localstorage-file) y tapa el de jsdom,
// así que zustand/persist truena con "Cannot read properties of undefined (reading 'setItem')".
// Si el global no sirve, usamos el de jsdom o, en su defecto, uno en memoria.
function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() { return map.size; },
    clear: () => map.clear(),
    getItem: (k) => map.get(k) ?? null,
    key: (i) => [...map.keys()][i] ?? null,
    removeItem: (k) => { map.delete(k); },
    setItem: (k, v) => { map.set(k, String(v)); },
  };
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  if (typeof globalThis[name]?.setItem === 'function') continue;
  const fromJsdom = typeof window !== 'undefined' && window !== globalThis ? window[name] : undefined;
  const value = typeof fromJsdom?.setItem === 'function' ? fromJsdom : memoryStorage();
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });
}
