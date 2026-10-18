import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { registerSW } from 'virtual:pwa-register'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// Register the service worker. autoUpdate is configured in vite.config.ts.
// The onOfflineReady callback fires once the app shell is fully cached and
// the app can be used without a network connection.
registerSW({
  onOfflineReady() {
    console.info('[PWA] App is ready to work offline.')
  },
  onNeedRefresh() {
    // A new service worker is waiting — autoUpdate will activate it on next load.
    console.info('[PWA] New content available, will update on next page load.')
  },
})

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App).use(pinia).use(router).mount('#app')
