<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api'

type ProfitabilitySuggestions = {
  profit_margin: number
  total_revenue: number
  total_cost: number
  ai_suggestions: {
    profitability_health_indicator: 'green' | 'amber' | 'red' | string
  }
}

type Quote = {
  id: number
  created_at: string
  target_profit_margin: number
  ai_profitability_suggestions: ProfitabilitySuggestions
}

// State
const quotes = ref<Quote[]>([])
const loading = ref(true)
const error = ref(false)

// Pagination state
const currentPage = ref(1)
const totalPages = ref(1)
const pageSize = ref(10)

const paginatedQuotes = computed(() => quotes.value)

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchQuotes(page)
  }
}

const fetchQuotes = async (page = 1) => {
  loading.value = true
  error.value = false
  try {
    const res = await api.get('v1/quotes', { params: { page, limit: pageSize.value } })
    quotes.value = res.data.data?.data || []
    totalPages.value = res.data.data?.last_page || 1
    currentPage.value = res.data.data?.current_page || 1
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchQuotes()
})

const formatDate = (dateStr: string): string => {
  return new Date(dateStr)?.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `$${num?.toFixed(2)}`
}

const healthClass = (indicator: string) => {
  return {
    'bg-green-100 text-green-700': indicator === 'green',
    'bg-yellow-100 text-yellow-700': indicator === 'amber',
    'bg-red-100 text-red-700': indicator === 'red',
    'bg-gray-100 text-gray-700': !['green', 'amber', 'red'].includes(indicator),
  }
}
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-6">Quote History</h2>

    <div v-if="loading" class="text-gray-600">Loading quotes...</div>
    <div v-else-if="error" class="text-red-500">Failed to load quotes.</div>
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
          <tr v-for="quote in paginatedQuotes" :key="quote.id" class="hover:bg-gray-50">
            <td class="p-2 border font-semibold">#{{ quote.id }}</td>
            <td class="p-2 border">{{ formatDate(quote.created_at) }}</td>
            <td class="p-2 border text-right">{{ quote.target_profit_margin }}%</td>
            <td class="p-2 border text-right">
              {{ quote.ai_profitability_suggestions?.profit_margin ?? 'N/A' }}%
            </td>
            <td class="p-2 border text-right">
              {{ formatCurrency(quote.ai_profitability_suggestions?.total_revenue ?? 0.00) }}
            </td>
            <td class="p-2 border text-right">
              {{ formatCurrency(quote.ai_profitability_suggestions?.total_cost ?? 0.00) }}
            </td>
            <td class="p-2 border text-center">
              <span
                class="text-sm font-semibold px-3 py-1 rounded-full"
                :class="
                  healthClass(
                    quote.ai_profitability_suggestions?.ai_suggestions
                      .profitability_health_indicator,
                  )
                "
              >
                {{
                  quote.ai_profitability_suggestions?.ai_suggestions
                    .profitability_health_indicator === 'red'
                    ? 'Poor'
                    : quote.ai_profitability_suggestions?.ai_suggestions
                          .profitability_health_indicator === 'amber'
                      ? 'Needs Review'
                      : quote.ai_profitability_suggestions?.ai_suggestions
                            .profitability_health_indicator === 'green'
                        ? 'Good'
                        : quote.ai_profitability_suggestions?.ai_suggestions
                            .profitability_health_indicator ?? 'N/A'
                }}
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
        <!-- Page Size Selector -->
        <div class="flex items-center">
          <label for="page-size" class="mr-2 font-medium">Page size:</label>
          <select
            id="page-size"
            v-model="pageSize"
            @change="fetchQuotes(currentPage)"
            class="border rounded px-2 py-1"
          >
            <option v-for="size in [5, 10, 15, 20, 50]" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>
        <!-- Pagination Controls -->
        <div class="flex items-center">
          <button
            class="px-3 py-1 rounded border mr-2"
            :disabled="currentPage === 1"
            @click="goToPage(currentPage - 1)"
          >
            Prev
          </button>
          <span> Page {{ currentPage }} of {{ totalPages }} </span>
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
