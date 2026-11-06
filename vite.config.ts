import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'logo-orthospine.png'],
      manifest: {
        name: 'ORTHO SPINE CENTER · Historias Médicas',
        short_name: 'ORTHO SPINE',
        description: 'Historia clínica, agenda y consultas para tu clínica.',
        theme_color: '#0f766e',
        background_color: '#f4f7f5',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        lang: 'es',
        categories: ['medical', 'health', 'productivity'],
        icons: [
          {
            src: '/logo-orthospine.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-orthospine.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/logo-orthospine.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/logo-orthospine.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//, /^\/assets\//],
        cleanupOutdatedCaches: true
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: 4173
  },
  // App Hosting serves the built SPA through Fastify; this fallback keeps direct
  // React Router URLs working while leaving API and real static-file requests alone.
  appType: 'spa'
});
