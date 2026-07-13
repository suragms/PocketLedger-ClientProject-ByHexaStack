import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.svg'],
      manifest: {
        name: 'PocketLedger',
        short_name: 'PocketLedger',
        description: 'Personal Finance Management Platform',
        theme_color: '#6366f1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity'],
        display_override: ['window-controls-overlay', 'standalone'],
        icons: [
          { src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-192-maskable.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'maskable' },
          { src: '/icons/icon-512-maskable.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
          { src: '/favicon.svg', sizes: '48x48', type: 'image/svg+xml', purpose: 'any' },
        ],
        screenshots: [],
        shortcuts: [
          { name: 'Dashboard', short_name: 'Home', url: '/', icons: [{ src: '/favicon.svg', sizes: '48x48', type: 'image/svg+xml' }] },
          { name: 'Transactions', short_name: 'Txns', url: '/transactions', icons: [{ src: '/favicon.svg', sizes: '48x48', type: 'image/svg+xml' }] },
          { name: 'Add Transaction', short_name: 'Add', url: '/transactions/new', icons: [{ src: '/favicon.svg', sizes: '48x48', type: 'image/svg+xml' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,woff,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24,
              },
              networkTimeoutSeconds: 5,
              backgroundSync: {
                name: 'pocketledger-sync',
                options: {
                  maxRetentionTime: 24 * 60,
                },
              },
            },
          },
          {
            urlPattern: /\.(?:js|css|html|svg|png|jpg|jpeg|gif|ico|woff2|woff|ttf|eot)(?:\?.*)?$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5130',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
