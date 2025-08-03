import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import { VitePluginFonts } from 'vite-plugin-fonts'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
    VitePluginFonts({
      google: {
        families: [{
          name: "Quicksand",
          styles: 'wght@300;400;500;600;700', // Font weights
          defer: true, // Optional: Load fonts using <link rel="preload">
          // display: 'swap', // Controls font-display
          // text: 'HelloWorld', // Subset to only specific characters
        }]
      }
    }),
    Components({
      dirs: ['src/components'],
      directoryAsNamespace: true,
      deep: true,
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: Number(process.env.VITE_SERVER_PORT) || 5173
  }
})