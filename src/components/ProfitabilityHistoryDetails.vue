<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/api'

const route = useRoute()
const quoteId = route.params.id as string

const quote = ref<any>(null)
const loading = ref(true)
const error = ref(false)

const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return `$${num.toFixed(2)}`
}

const formatDate = (val: string): string => new Date(val).toLocaleString()

onMounted(async () => {
  try {
    const res = await api.get(`v1/quotes/${quoteId}`)
    quote.value = res.data.data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="max-w-6xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Quote Details - #{{ quoteId }}</h2>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else-if="error" class="text-red-600">Failed to load quote details.</div>

    <div v-else class="bg-white shadow rounded p-6">
      <div class="mb-4">
        <p><strong>Created At:</strong> {{ formatDate(quote.created_at) }}</p>
        <p><strong>Target Profit Margin:</strong> {{ quote.target_profit_margin }}%</p>
        <p>
          <strong>Profit Margin:</strong> {{ quote.ai_profitability_suggestions?.profit_margin ?? 'N/A' }}%
        </p>
        <p>
          <strong>Profitability Health: </strong>
          <span
            :class="{
              'text-green-600':
                quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator ===
                'green',
              'text-yellow-600':
                quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator ===
                'amber',
              'text-red-600':
                quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator ===
                'red',
            }"
          >
            {{
              quote.ai_profitability_suggestions?.ai_suggestions.profitability_health_indicator ===
              'red'
                ? 'Poor'
                : quote.ai_profitability_suggestions?.ai_suggestions
                      .profitability_health_indicator === 'amber'
                  ? 'Needs Review'
                  : quote.ai_profitability_suggestions?.ai_suggestions
                        .profitability_health_indicator === 'green'
                    ? 'Good'
                    : quote.ai_profitability_suggestions?.ai_suggestions
                        .profitability_health_indicator
            }}
          </span>
        </p>
      </div>

      <div class="mt-6">
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
              v-for="item in quote.ai_profitability_suggestions?.line_items"
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
              <td class="border p-2 text-xs">{{ item.suggestion ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">Labor Summary</h3>
        <p><strong>Estimated Hours:</strong> {{ quote.labor_hours }}</p>
        <p><strong>Hourly Rate:</strong> {{ formatCurrency(quote.labor_cost_per_hour) }}</p>
        <p>
          <strong>Labor Cost:</strong>
          {{ formatCurrency(quote.ai_profitability_suggestions?.labor_cost ?? 0.00) }}
        </p>
        <p>
          <strong>Estimated Sustainable Hours:</strong>
          {{ quote.ai_profitability_suggestions?.labor_suggestions.estimated_sustainable_hours }}
        </p>
        <p class="text-sm text-gray-700 mt-1 italic">
          {{ quote.ai_profitability_suggestions?.labor_suggestions.comment }}
        </p>
      </div>

      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">AI Suggestions</h3>
        <div class="space-y-2 text-sm text-gray-800">
          <p>
            <strong>Target Margin Adjustments:</strong>
            {{ quote.ai_profitability_suggestions?.ai_suggestions.target_margin_adjustments ?? 'N/A' }}
          </p>
          <p>
            <strong>Labor Allocation Improvements:</strong>
            {{ quote.ai_profitability_suggestions?.ai_suggestions.labor_allocation_improvements ?? 'N/A' }}
          </p>
          <p>
            <strong>Product Swaps:</strong>
            {{ quote.ai_profitability_suggestions?.ai_suggestions.product_swaps ?? 'N/A' }}
          </p>
          <p>
            <strong>Profitability Summary:</strong>
            {{ quote.ai_profitability_suggestions?.ai_suggestions.profitability_summary ?? 'N/A' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
