import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  listQuotes,
  getQuote,
  reAnalyzeQuote,
  exportQuoteAnalysis,
} from '@/services/quoteService'
import type {
  QuoteListItem,
  QuoteResult,
  ReAnalyzeQuoteRequest,
} from '@/services/quoteService'

/**
 * Manages quote history list state and a per-id detail cache.
 *
 * Caching strategy:
 *   - List: cached per (page, pageSize) key. Re-fetches when page/size change
 *     or when invalidated (e.g. after a new analysis is submitted).
 *   - Detail: cached by quote id (plain Record so it serializes to JSON for
 *     pinia-plugin-persistedstate). A re-analyze action updates the entry in
 *     place so returning to the detail view reflects the latest data.
 *
 * Offline behaviour:
 *   When a fetch fails (network error), listFailed / detailFailed are set.
 *   The UI falls back to whatever is already in quotes / detailCache, which
 *   pinia-plugin-persistedstate has rehydrated from localStorage on startup.
 */
export const useQuoteHistoryStore = defineStore(
  'quoteHistory',
  () => {
    // -------------------------------------------------------------------------
    // List state
    // -------------------------------------------------------------------------
    const quotes = ref<QuoteListItem[]>([])
    const currentPage = ref(1)
    const totalPages = ref(1)
    const pageSize = ref(10)
    const listLoading = ref(false)
    const listFailed = ref(false)

    /** Key representing the currently loaded slice — used for cache invalidation. */
    const listCacheKey = computed(() => `${currentPage.value}-${pageSize.value}`)
    const loadedCacheKey = ref<string | null>(null)

    // -------------------------------------------------------------------------
    // Detail cache: id → QuoteResult  (plain Record, not Map, so it serialises)
    // -------------------------------------------------------------------------
    const detailCache = ref<Record<string, QuoteResult>>({})
    const detailLoading = ref(false)
    const detailFailed = ref(false)

    // -------------------------------------------------------------------------
    // List actions
    // -------------------------------------------------------------------------

    /** Fetch a page. Pass force=true to bypass the cache and always re-fetch. */
    async function fetchQuotes(page = 1, force = false): Promise<void> {
      currentPage.value = page
      const key = `${page}-${pageSize.value}`

      if (!force && loadedCacheKey.value === key) return

      listLoading.value = true
      listFailed.value = false
      try {
        const res = await listQuotes(page, pageSize.value)
        quotes.value = res.data?.data ?? []
        totalPages.value = res.data?.last_page ?? 1
        currentPage.value = res.data?.current_page ?? 1
        loadedCacheKey.value = key
      } catch {
        listFailed.value = true
        // Keep whatever quotes are already in state (persisted from last session)
      } finally {
        listLoading.value = false
      }
    }

    function goToPage(page: number): void {
      if (page >= 1 && page <= totalPages.value) {
        fetchQuotes(page)
      }
    }

    function setPageSize(size: number): void {
      pageSize.value = size
      fetchQuotes(1, true)
    }

    /** Call after a new analysis is submitted so the list re-fetches on next visit. */
    function invalidateList(): void {
      loadedCacheKey.value = null
    }

    // -------------------------------------------------------------------------
    // Detail actions
    // -------------------------------------------------------------------------

    function getCachedDetail(id: string): QuoteResult | undefined {
      return detailCache.value[id]
    }

    async function fetchDetail(id: string, force = false): Promise<QuoteResult> {
      const cached = detailCache.value[id]
      if (!force && cached) return cached

      detailLoading.value = true
      detailFailed.value = false
      try {
        const quote = await getQuote(id)
        detailCache.value[id] = quote
        return quote
      } catch {
        detailFailed.value = true
        throw new Error(`Failed to load quote ${id}.`)
      } finally {
        detailLoading.value = false
      }
    }

    async function reAnalyzeDetail(id: string, payload: ReAnalyzeQuoteRequest): Promise<QuoteResult> {
      const res = await reAnalyzeQuote(id, payload)
      detailCache.value[id] = res.data
      return res.data
    }

    async function exportDetailPdf(id: string): Promise<void> {
      const blob = await exportQuoteAnalysis(id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profitability_result_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }

    return {
      // list
      quotes,
      currentPage,
      totalPages,
      pageSize,
      listLoading,
      listFailed,
      fetchQuotes,
      goToPage,
      setPageSize,
      invalidateList,
      // detail
      detailLoading,
      detailFailed,
      getCachedDetail,
      fetchDetail,
      reAnalyzeDetail,
      exportDetailPdf,
    }
  },
  {
    // Persist quotes list and detail cache to localStorage so they survive
    // page refreshes and are readable when the device is offline.
    persist: {
      key: 'profitopt_history',
      // Only persist the data that's useful offline; skip loading/error flags.
      paths: ['quotes', 'detailCache', 'currentPage', 'totalPages', 'pageSize'],
    },
  },
)
