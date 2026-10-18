<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useFormatters } from '@/composables/useFormatters'
import { useApiError } from '@/composables/useApiError'
import {
  getQuote,
  reAnalyzeQuote,
  exportQuoteAnalysis,
} from '@/services/quoteService'
import type { QuoteResult } from '@/services/quoteService'

const route = useRoute()
const quoteId = route.params.id as string

const quote = ref<QuoteResult | null>(null)
const loading = ref(true)
const actionLoading = ref(false)
const fetchFailed = ref(false)

const { success: toastSuccess, error: toastError } = useToast()
const { formatCurrency, formatDateTime, resolveHealth } = useFormatters()
const { extractErrorMessage } = useApiError()

// Convenience accessor — same shape ProfitForm uses
const analysis = computed(() => quote.value?.ai_profitability_suggestions ?? {})

const healthStatus = computed(() =>
  resolveHealth(analysis.value?.ai_suggestions?.profitability_health_indicator),
)

async function loadQuote() {
  loading.value = true
  fetchFailed.value = false
  try {
    quote.value = await getQuote(quoteId)
  } catch {
    fetchFailed.value = true
    toastError('Failed to load quote details.')
  } finally {
    loading.value = false
  }
}

onMounted(loadQuote)

async function reAnalyze() {
  if (!quote.value) return
  actionLoading.value = true
  try {
    const aiSuggestions = analysis.value
    const response = await reAnalyzeQuote(quoteId, {
      quote_id: quoteId,
      line_items: aiSuggestions?.line_items?.map((li) => ({
        id: li.id,
        suggestion: li.suggestion,
      })),
      labor_suggestions: aiSuggestions?.labor_suggestions
        ? { comment: aiSuggestions.labor_suggestions.comment }
        : undefined,
      ai_suggestions: aiSuggestions?.ai_suggestions
        ? {
            target_margin_adjustments: aiSuggestions.ai_suggestions.target_margin_adjustments,
            labor_allocation_improvements:
              aiSuggestions.ai_suggestions.labor_allocation_improvements,
            product_swaps: aiSuggestions.ai_suggestions.product_swaps,
            profitability_summary: aiSuggestions.ai_suggestions.profitability_summary,
          }
        : undefined,
    })
    quote.value = response.data
    toastSuccess('Re-analysis complete.')
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}

async function exportPdf() {
  actionLoading.value = true
  try {
    const blob = await exportQuoteAnalysis(quoteId)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `profitability_result_${quoteId}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toastSuccess('PDF exported successfully.')
  } catch (err) {
    toastError(extractErrorMessage(err))
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Quote Details — #{{ quoteId }}</h2>

    <div v-if="loading" class="text-gray-500">Loading...</div>

    <div
      v-else-if="fetchFailed"
      class="flex flex-col items-center gap-3 py-10 text-gray-600"
    >
      <p class="text-sm">Could not load quote details. Check your connection and try again.</p>
      <button
        class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
        @click="loadQuote"
      >
        Retry
      </button>
    </div>

    <div v-else class="bg-white shadow rounded p-6 space-y-8">

      <!-- Summary -->
      <div class="space-y-1">
        <p><strong>Created At:</strong> {{ formatDateTime(quote.created_at) }}</p>
        <p><strong>Target Profit Margin:</strong> {{ quote.target_profit_margin }}%</p>
        <p><strong>Profit Margin:</strong> {{ analysis?.profit_margin ?? 'N/A' }}%</p>
        <p>
          <strong>Profitability Health:</strong>
          <span :class="healthStatus.colorClass" class="font-semibold ml-1">
            {{ healthStatus.label }}
          </span>
        </p>
      </div>

      <!-- Line Items -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Line Items</h3>
        <table class="w-full text-sm border">
          <thead class="bg-gray-100">
            <tr>
              <th class="border p-2">Name</th>
              <th class="border p-2">Qty</th>
              <th class="border p-2">Cost</th>
              <th class="border p-2">Sell</th>
              <th class="border p-2">Margin %</th>
              <th class="border p-2">Status</th>
              <th class="border p-2">Suggestion</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in analysis?.line_items"
              :key="item.id"
              class="hover:bg-gray-50"
            >
              <td class="border p-2">{{ item.name }}</td>
              <td class="border p-2 text-center">{{ item.quantity }}</td>
              <td class="border p-2 text-right">{{ formatCurrency(item.cost_price) }}</td>
              <td class="border p-2 text-right">{{ formatCurrency(item.sell_price) }}</td>
              <td class="border p-2 text-right">{{ item.margin_percent }}%</td>
              <td class="border p-2">
                <span
                  :class="
                    item.status === 'Low Margin'
                      ? 'text-red-600 font-semibold'
                      : 'text-green-600 font-semibold'
                  "
                >
                  {{ item.status }}
                </span>
              </td>
              <td class="border p-2">
                <textarea
                  v-model="item.suggestion"
                  rows="3"
                  class="w-full border border-gray-300 rounded p-1 text-xs"
                  placeholder="Enter suggestion..."
                ></textarea>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Labor Summary -->
      <div>
        <h3 class="text-lg font-semibold mb-2">Labor Summary</h3>
        <p><strong>Estimated Hours:</strong> {{ quote.labor_hours }}</p>
        <p><strong>Hourly Rate:</strong> {{ formatCurrency(quote.labor_cost_per_hour) }}</p>
        <p>
          <strong>Labor Cost:</strong>
          {{ formatCurrency(analysis?.labor_cost ?? 0) }}
        </p>
        <p>
          <strong>Estimated Sustainable Hours:</strong>
          {{ analysis?.labor_suggestions?.estimated_sustainable_hours ?? 'N/A' }}
        </p>
        <div v-if="analysis?.labor_suggestions" class="mt-2">
          <label class="block text-sm font-medium text-gray-700 mb-1">Labor Comment</label>
          <textarea
            v-model="analysis.labor_suggestions.comment"
            rows="3"
            class="w-full border border-gray-300 rounded p-2 text-sm"
            placeholder="Enter comment..."
          ></textarea>
        </div>
      </div>

      <!-- AI Suggestions -->
      <div v-if="analysis?.ai_suggestions">
        <h3 class="text-lg font-semibold mb-2">AI Suggestions</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Target Margin Adjustments</label>
            <textarea
              v-model="analysis.ai_suggestions.target_margin_adjustments"
              rows="3"
              class="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter adjustments..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Labor Allocation Improvements</label>
            <textarea
              v-model="analysis.ai_suggestions.labor_allocation_improvements"
              rows="3"
              class="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter improvements..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Product Swaps</label>
            <textarea
              v-model="analysis.ai_suggestions.product_swaps"
              rows="3"
              class="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter product swaps..."
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Profitability Summary</label>
            <textarea
              v-model="analysis.ai_suggestions.profitability_summary"
              rows="3"
              class="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Enter profitability summary..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          :disabled="actionLoading"
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': actionLoading }"
          @click="reAnalyze"
        >
          <span v-if="actionLoading" class="loader"></span>
          Reassess
        </button>
        <button
          type="button"
          :disabled="actionLoading"
          class="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center gap-2"
          :class="{ 'opacity-50 cursor-not-allowed': actionLoading }"
          @click="exportPdf"
        >
          <span v-if="actionLoading" class="loader"></span>
          Export PDF
        </button>
      </div>

    </div>
  </section>
</template>

<style scoped>
@keyframes spin {
  to { transform: rotate(360deg); }
}
.loader {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
</style>
