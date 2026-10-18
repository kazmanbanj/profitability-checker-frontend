<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from '@/composables/useToast'
import { useFormatters } from '@/composables/useFormatters'
import { useQuoteHistoryStore } from '@/stores/useQuoteHistoryStore'

const historyStore = useQuoteHistoryStore()
const { error: toastError } = useToast()
const { formatDate, formatCurrency, resolveHealth } = useFormatters()

const {
  quotes,
  currentPage,
  totalPages,
  pageSize,
  listLoading,
  listFailed,
} = storeToRefs(historyStore)

async function fetchQuotes(page = 1) {
  try {
    await historyStore.fetchQuotes(page)
  } catch {
    toastError('Failed to load quotes. You can retry below.')
  }
}

function goToPage(page: number) {
  historyStore.goToPage(page)
}

function onPageSizeChange() {
  historyStore.setPageSize(pageSize.value)
}

onMounted(() => fetchQuotes())
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Quote History</h2>

    <div v-if="listLoading" class="text-gray-600">Loading quotes...</div>
    <div
      v-else-if="listFailed"
      class="flex flex-col items-center gap-3 py-10 text-gray-600"
    >
      <p class="text-sm">Could not load quotes. Check your connection and try again.</p>
      <button
        class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
        @click="fetchQuotes(currentPage)"
      >
        Retry
      </button>
    </div>
    <div v-else-if="quotes.length === 0" class="text-gray-500 text-center py-8">
      No quote history found.
    </div>
    <div v-else>
      <table class="w-full border text-sm bg-white shadow rounded">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 border">Quote #</th>
            <th class="p-2 border">Created</th>
            <th class="p-2 border">Target Margin</th>
            <th class="p-2 border">Profit Margin</th>
            <th class="p-2 border">Total Revenue</th>
            <th class="p-2 border">Total Cost</th>
            <th class="p-2 border">Health</th>
            <th class="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="quote in quotes" :key="quote.id" class="hover:bg-gray-50">
            <td class="p-2 border font-semibold">#{{ quote.id }}</td>
            <td class="p-2 border">{{ formatDate(quote.created_at) }}</td>
            <td class="p-2 border text-right">{{ quote.target_profit_margin }}%</td>
            <td class="p-2 border text-right">
              {{ quote.ai_profitability_suggestions?.profit_margin ?? 'N/A' }}%
            </td>
            <td class="p-2 border text-right">
              {{ formatCurrency(quote.ai_profitability_suggestions?.total_revenue ?? 0) }}
            </td>
            <td class="p-2 border text-right">
              {{ formatCurrency(quote.ai_profitability_suggestions?.total_cost ?? 0) }}
            </td>
            <td class="p-2 border text-center">
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                :class="resolveHealth(quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator).badgeClass"
              >
                {{ resolveHealth(quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator).label }}
              </span>
            </td>
            <td class="p-2 border text-center">
              <RouterLink
                class="inline-block px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                :to="{ name: 'history-details', params: { id: quote.id } }"
              >
                View More
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
        <div class="flex items-center">
          <label for="page-size" class="mr-2 font-medium">Page size:</label>
          <select
            id="page-size"
            v-model="pageSize"
            @change="onPageSizeChange"
            class="border rounded px-2 py-1"
          >
            <option v-for="size in [5, 10, 15, 20, 50]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <div class="flex items-center">
          <button
            class="px-3 py-1 rounded border mr-2"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            Prev
          </button>
          <span>Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="px-3 py-1 rounded border ml-2"
            :disabled="currentPage === totalPages || totalPages === 0"
            @click="goToPage(currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
