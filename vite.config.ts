import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inject the service worker registration script automatically into index.html
      injectRegister: 'auto',
      // Dev mode: enable SW in development so offline behaviour can be tested locally
      devOptions: { enabled: true },
      workbox: {
        // Precache the built app shell (JS chunks, CSS, HTML)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Runtime caching: serve the API GET responses from a network-first cache
        // so history / detail pages show cached data when offline.
        runtimeCaching: [
          {
            // Match all GET requests to the backend API
            urlPattern: ({ url }) => url.pathname.startsWith('/api/v1/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              // Keep cached API responses for up to 7 days
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Profit Optimiser',
        short_name: 'ProfitOpt',
        description: 'AI-powered profitability checker for AV dealers',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/profitability.ico',
            sizes: '64x64',
            type: 'image/x-icon',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: Number(process.env.VITE_SERVER_PORT) || 5173
  },
})