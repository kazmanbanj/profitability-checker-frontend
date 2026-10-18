import { ref, onMounted, onUnmounted } from 'vue'
import { analyzeQuote } from '@/services/quoteService'
import type { AnalyzeQuoteRequest, AnalyzeQuoteResponse } from '@/services/quoteService'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueuedSubmission {
  /** Unique local ID so we can track / remove individual items */
  localId: string
  /** ISO timestamp of when the submission was queued */
  queuedAt: string
  payload: AnalyzeQuoteRequest
}

// ---------------------------------------------------------------------------
// Storage key
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'profitopt_offline_queue'

// ---------------------------------------------------------------------------
// Module-level state — shared across all composable instances
// ---------------------------------------------------------------------------
const queue = ref<QueuedSubmission[]>(loadFromStorage())
const isSyncing = ref(false)
const lastSyncedResults = ref<AnalyzeQuoteResponse[]>([])

// Callbacks registered by consumers (e.g. useQuoteStore) to receive synced results
type SyncCallback = (results: AnalyzeQuoteResponse[]) => void
const syncCallbacks: SyncCallback[] = []

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function loadFromStorage(): QueuedSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as QueuedSubmission[]) : []
  } catch {
    return []
  }
}

function persistToStorage(items: QueuedSubmission[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

// ---------------------------------------------------------------------------
// Queue operations
// ---------------------------------------------------------------------------

function enqueue(payload: AnalyzeQuoteRequest): QueuedSubmission {
  const item: QueuedSubmission = {
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    queuedAt: new Date().toISOString(),
    payload,
  }
  queue.value.push(item)
  persistToStorage(queue.value)
  return item
}

function dequeue(localId: string) {
  queue.value = queue.value.filter((i) => i.localId !== localId)
  persistToStorage(queue.value)
}

/**
 * Attempt to flush the queue. Called automatically when the browser comes
 * back online, but can also be triggered manually (e.g. a "Retry" button).
 */
async function drainQueue(): Promise<void> {
  if (isSyncing.value || queue.value.length === 0) return
  if (!navigator.onLine) return

  isSyncing.value = true
  const synced: AnalyzeQuoteResponse[] = []
  // Snapshot so additions during drain don't cause infinite loops
  const batch = [...queue.value]

  for (const item of batch) {
    try {
      const result = await analyzeQuote(item.payload)
      synced.push(result)
      dequeue(item.localId)
    } catch {
      // If the server is still unreachable, stop and leave the rest in queue
      break
    }
  }

  if (synced.length > 0) {
    lastSyncedResults.value = synced
    syncCallbacks.forEach((cb) => cb(synced))
  }

  isSyncing.value = false
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useOfflineQueue() {
  function onOnline() {
    drainQueue()
  }

  onMounted(() => {
    window.addEventListener('online', onOnline)
    // Attempt a drain immediately in case we're already back online
    drainQueue()
  })

  onUnmounted(() => {
    window.removeEventListener('online', onOnline)
  })

  /**
   * Register a callback invoked after a successful sync drain.
   * Returns an unsubscribe function.
   */
  function onSynced(cb: SyncCallback): () => void {
    syncCallbacks.push(cb)
    return () => {
      const idx = syncCallbacks.indexOf(cb)
      if (idx !== -1) syncCallbacks.splice(idx, 1)
    }
  }

  return {
    queue,
    isSyncing,
    lastSyncedResults,
    enqueue,
    dequeue,
    drainQueue,
    onSynced,
  }
}
