<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const iconFor = (type: string) => {
  if (type === 'success') return '✓'
  if (type === 'error') return '✕'
  return 'ℹ'
}
</script>

<template>
  <Teleport to="body">
    <div
      aria-live="polite"
      aria-atomic="false"
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none"
    >
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          role="alert"
          class="pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium"
          :class="{
            'bg-green-600 text-white': toast.type === 'success',
            'bg-red-600 text-white': toast.type === 'error',
            'bg-gray-800 text-white': toast.type === 'info',
          }"
        >
          <span class="shrink-0 mt-0.5 font-bold" aria-hidden="true">{{ iconFor(toast.type) }}</span>
          <span class="flex-1">{{ toast.message }}</span>
          <button
            type="button"
            class="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            :aria-label="`Dismiss: ${toast.message}`"
            @click="dismiss(toast.id)"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-enter-active {
  transition: all 0.25s ease-out;
}
.toast-leave-active {
  transition: all 0.2s ease-in;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(0.5rem);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
