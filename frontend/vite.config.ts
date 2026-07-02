import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_URL || 'http://127.0.0.1:3013'

  return {
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'DealerX',
        short_name: 'DealerX',
        description: 'Commercial Vehicle Dealership Management',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/[^/]+\/(auth|users)\/.*/i,
            handler: 'NetworkOnly',
            options: { cacheName: 'auth-no-cache' },
          },
          {
            urlPattern: /^https?:\/\/[^/]+\/(vehicles|leads|sales|customers|deals|dashboard|analytics|ai|tasks|calendar|messages|settings|tenants)\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: API_URL, changeOrigin: true },
      '/users': { target: API_URL, changeOrigin: true },
      '/tenants': { target: API_URL, changeOrigin: true },
      '/vehicles': { target: API_URL, changeOrigin: true },
      '/leads': { target: API_URL, changeOrigin: true },
      '/sales': { target: API_URL, changeOrigin: true },
      '/customers': { target: API_URL, changeOrigin: true },
      '/deals': { target: API_URL, changeOrigin: true },
      '/dashboard': { target: API_URL, changeOrigin: true },
      '/analytics': { target: API_URL, changeOrigin: true },
      '/ai': { target: API_URL, changeOrigin: true },
      '/tasks': { target: API_URL, changeOrigin: true },
      '/events': { target: API_URL, changeOrigin: true },
      '/uploads': { target: API_URL, changeOrigin: true },
      '/calendar': { target: API_URL, changeOrigin: true },
      '/messages': { target: API_URL, changeOrigin: true },
      '/settings': { target: API_URL, changeOrigin: true },
    },
  },
}})
