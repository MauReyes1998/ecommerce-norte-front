import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    // PWA: instalable en el celular y con el catálogo disponible aunque falle la red.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'NORTE · Ropa urbana',
        short_name: 'NORTE',
        description: 'Ropa urbana para hombre y mujer. Envíos a todo México.',
        lang: 'es-MX',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#111111',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // La SPA se sirve offline; lo que es del backend nunca pasa por el fallback.
        navigateFallbackDenylist: [/^\/api\//, /^\/uploads\//, /^\/sitemap\.xml$/],
        runtimeCaching: [
          {
            // Catálogo y categorías: red primero, caché si no hay conexión.
            urlPattern: /\/api\/v1\/(products|categories)(\/|\?|$)/,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-catalogo', networkTimeoutSeconds: 4, expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 } },
          },
          {
            // Imágenes de productos: caché primero, se renuevan en segundo plano.
            urlPattern: /\/uploads\/.*\.(png|jpe?g|webp|avif)$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'imagenes', expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'fuentes', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    // Las imágenes subidas por el admin y el sitemap se sirven desde el backend.
    proxy: { '/uploads': 'http://localhost:3000', '/sitemap.xml': 'http://localhost:3000' },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
