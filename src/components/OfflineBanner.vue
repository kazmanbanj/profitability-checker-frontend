<script setup lang="ts">
import { watch } from 'vue'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { useOfflineQueue } from '@/composables/useOfflineQueue'
import { useToast } from '@/composables/useToast'

const { isOnline } = useOnlineStatus()
const { queue, isSyncing } = useOfflineQueue()
const { info, success } = useToast()

// Show a toast whenever connectivity changes
watch(isOnline, (online) => {
  if (!online) {
    info('You are offline. Submissions will be queued and sent when you reconnect.', 8000)
  } else {
    if (queue.value.length > 0) {
      info(`Back online. Syncing ${queue.value.length} queued submission(s)…`, 5000)
    } else {
      success('Back online.', 3000)
    }
  }
})
</script>

<template>
  <!-- Offline ribbon shown below the header -->
  <Transition name="banner">
    <div
      v-if="!isOnline || isSyncing"
      role="status"
      aria-live="polite"
      class="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium"
      :class="
        isSyncing
          ? 'bg-indigo-600 text-white'
          : 'bg-amber-400 text-amber-900'
      "
    >
      <template v-if="isSyncing">
        <!-- Spinner -->
        <svg
          class="h-4 w-4 animate-spin shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        Syncing {{ queue.length }} queued submission{{ queue.length !== 1 ? 's' : '' }}…
      </template>
      <template v-else>
        <!-- Offline icon -->
        <svg
          class="h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M3 3l18 18
               M9.17 9.17A5 5 0 006.343 12M6.343 12a5 5 0 007.314 0"
          />
        </svg>
        You're offline
        <span v-if="queue.length > 0" class="ml-1 font-semibold">
          — {{ queue.length }} submission{{ queue.length !== 1 ? 's' : '' }} queued
        </span>
      </template>
    </div>
  </Transition>
</template>

<style scoped>
.banner-enter-active,
.banner-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
  max-height: 3rem;
}
.banner-enter-from,
.banner-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
