import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Reactive wrapper around navigator.onLine.
 * Updates automatically when the browser fires 'online' / 'offline' events.
 */
export function useOnlineStatus() {
  const isOnline = ref(typeof navigator !== 'undefined' ? navigator.onLine : true)

  function update() {
    isOnline.value = navigator.onLine
  }

  onMounted(() => {
    window.addEventListener('online', update)
    window.addEventListener('offline', update)
  })

  onUnmounted(() => {
    window.removeEventListener('online', update)
    window.removeEventListener('offline', update)
  })

  return { isOnline }
}
