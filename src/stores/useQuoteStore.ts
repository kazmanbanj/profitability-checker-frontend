import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  analyzeQuote,
  reAnalyzeQuote,
  exportQuoteAnalysis,
} from '@/services/quoteService'
import type {
  AnalyzeQuoteRequest,
  AnalyzeQuoteResponse,
  AiProfitabilitySuggestions,
  ReAnalyzeQuoteRequest,
} from '@/services/quoteService'

/**
 * Stores the result of the most recent profitability analysis.
 * Shared between ProfitForm (writes) and any component that wants to
 * display or act on the latest result without a redundant API call.
 */
export const useQuoteStore = defineStore('quote', () => {
  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------
  const result = ref<AnalyzeQuoteResponse | null>(null)
  const loading = ref(false)

  // -------------------------------------------------------------------------
  // Derived
  // -------------------------------------------------------------------------
  const analysis = computed<AiProfitabilitySuggestions | null>(
    () => result.value?.data?.ai_profitability_suggestions ?? null,
  )

  const quoteId = computed(() => result.value?.data?.id ?? null)

  const currency = computed(() => analysis.value?.currency_symbol ?? '')

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------
  async function analyze(payload: AnalyzeQuoteRequest): Promise<void> {
    loading.value = true
    try {
      result.value = await analyzeQuote(payload)
    } finally {
      loading.value = false
    }
  }

  async function reAnalyze(payload: ReAnalyzeQuoteRequest): Promise<void> {
    const id = quoteId.value
    if (!id) throw new Error('No quote loaded to re-analyze.')
    loading.value = true
    try {
      result.value = await reAnalyzeQuote(id, payload)
    } finally {
      loading.value = false
    }
  }

  async function exportPdf(): Promise<void> {
    const id = quoteId.value
    if (!id) throw new Error('No quote loaded to export.')
    loading.value = true
    try {
      const blob = await exportQuoteAnalysis(id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `profitability_result_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } finally {
      loading.value = false
    }
  }

  function clear(): void {
    result.value = null
  }

  return { result, loading, analysis, quoteId, currency, analyze, reAnalyze, exportPdf, clear }
})
