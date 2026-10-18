<script setup lang="ts">
import { reactive, ref, computed, nextTick } from 'vue'
import { useToast } from '@/composables/useToast'
import { useFormatters } from '@/composables/useFormatters'
import { useApiError } from '@/composables/useApiError'
import { useQuoteStore } from '@/stores/useQuoteStore'
import { useQuoteHistoryStore } from '@/stores/useQuoteHistoryStore'

interface AdditionalInfo {
  [key: string]: string
}

interface Item {
  name: string
  cost_price: number
  sell_price: number
  quantity: number
  additional_info: AdditionalInfo
}

interface Form {
  line_items: Item[]
  labor_hours: number
  labor_cost_per_hour: number
  fixed_overheads: number
  target_profit_margin: number
}

const form = reactive<Form>({
  line_items: [
    {
      name: '',
      cost_price: 0,
      sell_price: 0,
      quantity: 1,
      additional_info: { MPN: '', SKU: '' },
    },
  ],
  labor_hours: 0,
  labor_cost_per_hour: 0,
  fixed_overheads: 0,
  target_profit_margin: 30,
})

const error = ref<string | null>(null)
const quoteSummary = ref<HTMLElement | null>(null)

const quoteStore = useQuoteStore()
const historyStore = useQuoteHistoryStore()
const { success: toastSuccess, error: toastError } = useToast()
const { formatNumber, resolveHealth } = useFormatters()
const { extractErrorMessage } = useApiError()

// Delegate result/loading/analysis/currency to the store
const result   = computed(() => quoteStore.result)
const loading  = computed(() => quoteStore.loading)
const analysis = computed(() => quoteStore.analysis)
const currency = computed(() => quoteStore.currency)
const healthStatus = computed(() =>
  resolveHealth(analysis.value?.ai_suggestions?.profitability_health_indicator),
)

function addItem() {
  form.line_items.push({
    name: '',
    cost_price: 0,
    sell_price: 0,
    quantity: 1,
    additional_info: { MPN: '', SKU: '' },
  })
}

function removeItem(index: number) {
  if (form.line_items.length === 1) {
    error.value = 'At least one line item is required.'
    return
  }
  const item = form.line_items[index]
  const label = item.name.trim() ? `"${item.name}"` : `item ${index + 1}`
  if (!confirm(`Remove ${label}?`)) return
  form.line_items.splice(index, 1)
}

function addAdditionalField(item: Item) {
  const newKey = prompt('Enter additional info label:')
  if (newKey && !(newKey in item.additional_info)) {
    item.additional_info[newKey] = ''
  }
}

function removeAdditionalField(item: Item, key: string) {
  delete item.additional_info[key]
}

function resetForm() {
  if (result.value && !confirm('Start a new quote? Your current results will be cleared.')) return
  Object.assign(form, {
    line_items: [{ name: '', cost_price: 0, sell_price: 0, quantity: 1, additional_info: { MPN: '', SKU: '' } }],
    labor_hours: 0,
    labor_cost_per_hour: 0,
    fixed_overheads: 0,
    target_profit_margin: 30,
  })
  quoteStore.clear()
  error.value = null
}

async function submitForm() {
  error.value = null

  if (form.line_items.length === 0) {
    error.value = 'Add at least one line item before checking profitability.'
    return
  }

  const invalidItem = form.line_items.find(
    (item) => item.cost_price <= 0 || item.sell_price <= 0 || item.quantity < 1,
  )
  if (invalidItem) {
    const label = invalidItem.name.trim() ? `"${invalidItem.name}"` : 'one of your items'
    error.value = `Cost price, sell price, and quantity must all be greater than zero (check ${label}).`
    return
  }

  try {
    await quoteStore.analyze(form)
    // Invalidate history cache so the list re-fetches on next visit
    historyStore.invalidateList()
    toastSuccess('Profitability analysis complete.')
    await nextTick()
    quoteSummary.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    toastError(extractErrorMessage(err))
  }
}

async function resubmitForm() {
  error.value = null
  if (!quoteStore.quoteId) {
    toastError('Quote ID not found in result.')
    return
  }
  try {
    const aiSuggestions = analysis.value
    await quoteStore.reAnalyze({
      quote_id: quoteStore.quoteId,
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
            labor_allocation_improvements: aiSuggestions.ai_suggestions.labor_allocation_improvements,
            product_swaps: aiSuggestions.ai_suggestions.product_swaps,
            profitability_summary: aiSuggestions.ai_suggestions.profitability_summary,
          }
        : undefined,
    })
    toastSuccess('Re-analysis complete.')
    await nextTick()
    quoteSummary.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (err) {
    toastError(extractErrorMessage(err))
  }
}

async function exportResult() {
  if (!result.value) return
  try {
    await quoteStore.exportPdf()
    toastSuccess('PDF exported successfully.')
  } catch (err) {
    toastError(extractErrorMessage(err))
  }
}
</script>

<template>
  <form
    @submit.prevent="submitForm"
    class="space-y-6 max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg"
  >
    <div
      v-for="(item, index) in form.line_items"
      :key="index"
      class="space-y-4 border p-4 rounded-md bg-gray-50"
    >
      <div class="grid grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input
            v-model="item.name"
            type="text"
            class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
          <input
            v-model.number="item.cost_price"
            type="number"
            min="0.01"
            step="0.01"
            class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sell Price</label>
          <input
            v-model.number="item.sell_price"
            type="number"
            min="0.01"
            step="0.01"
            class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            step="1"
            class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            required
          />
        </div>
        <div class="text-right">
          <button type="button" @click="removeItem(index)" class="text-red-500 hover:text-red-700">
            🗑️ Remove Item
          </button>
        </div>
      </div>

      <div
        v-for="(value, key) in item.additional_info"
        :key="key"
        class="grid grid-cols-3 gap-4 items-end"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ key }}</label>
          <input
            v-model="item.additional_info[key]"
            type="text"
            class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
          />
        </div>
        <div class="text-left">
          <button
            type="button"
            class="text-red-500 hover:text-red-700"
            @click="removeAdditionalField(item, String(key))"
          >
            Remove
          </button>
        </div>
      </div>

      <div>
        <button
          type="button"
          @click="addAdditionalField(item)"
          class="text-blue-600 hover:text-blue-800"
        >
          ➕ Add Additional Info
        </button>
      </div>
    </div>

    <div class="text-right">
      <button type="button" @click="addItem" class="text-green-600 hover:text-green-800">
        ➕ Add Item
      </button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
        <input
          v-model.number="form.labor_hours"
          type="number"
          class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Labor Cost per Hour</label>
        <input
          v-model.number="form.labor_cost_per_hour"
          type="number"
          class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fixed Overheads</label>
        <input
          v-model.number="form.fixed_overheads"
          type="number"
          class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Target Profit Margin (%)</label>
        <input
          v-model.number="form.target_profit_margin"
          type="number"
          step="0.01"
          class="border border-gray-300 p-2 rounded w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </div>
    </div>
    <br />
    <div
      v-if="error"
      role="alert"
      class="flex items-start gap-3 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      <span class="mt-0.5 shrink-0" aria-hidden="true">⚠️</span>
      <span>{{ error }}</span>
      <button
        type="button"
        class="ml-auto shrink-0 text-red-400 hover:text-red-600"
        aria-label="Dismiss error"
        @click="error = null"
      >
        ✕
      </button>
    </div>

    <div class="flex justify-center gap-3">
      <button
        type="submit"
        :disabled="loading"
        class="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 mt-4 flex items-center justify-center"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
      >
        <span v-if="loading" class="loader mr-2"></span>
        {{ loading ? 'Checking...' : 'Check Profitability' }}
      </button>
      <button
        type="button"
        :disabled="loading"
        class="bg-gray-100 text-gray-700 border border-gray-300 px-6 py-2 rounded shadow hover:bg-gray-200 mt-4"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
        @click="resetForm"
      >
        Clear Form
      </button>
    </div>

    <div
      v-if="result && analysis"
      class="container mx-auto my-10 p-8 bg-white rounded-lg shadow"
      style="max-width: 900px"
    >
      <form @submit.prevent="resubmitForm">
        <div class="mb-4" ref="quoteSummary">
          <h2 class="text-2xl font-bold text-gray-800 inline-block relative">
            Quote Summary
            <span class="block h-0.5 bg-gray-300 mt-1 w-full"></span>
          </h2>
        </div>

        <h4 class="text-lg font-semibold mt-8 mb-2 text-gray-900">Quote Items Overview</h4>
        <table class="w-full border-collapse border border-gray-400 mb-6 text-sm bordered-table">
          <thead>
            <tr class="bg-gray-100">
              <th>Item</th>
              <th>Cost</th>
              <th>Sell</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Total Revenue</th>
              <th>Margin %</th>
              <th>Status</th>
              <th>Recommendation</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(li, idx) in result.data?.ai_profitability_suggestions?.line_items"
              :key="idx"
            >
              <td>{{ li.name }}</td>
              <td>{{ currency }}{{ formatNumber(li.cost_price) }}</td>
              <td>{{ currency }}{{ formatNumber(li.sell_price) }}</td>
              <td>{{ li.quantity }}</td>
              <td>{{ currency }}{{ formatNumber(li.cost_price * li.quantity) }}</td>
              <td>{{ currency }}{{ formatNumber(li.sell_price * li.quantity) }}</td>
              <td
                :class="
                  li.margin_percent < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                "
              >
                {{ li.margin_percent }}%
              </td>
              <td
                :class="
                  String(li.status ?? '').toLowerCase() === 'low margin'
                    ? 'text-red-600 font-bold'
                    : 'text-green-600 font-bold'
                "
              >
                {{ li.status ?? 'N/A' }}
              </td>
              <td>
                <textarea
                  v-model="li.suggestion"
                  class="border border-gray-300 p-1 rounded w-full"
                  :placeholder="'Enter suggestion...'"
                  rows="5"
                ></textarea>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4"></td>
              <td>
                <strong> {{ currency }}{{ formatNumber(analysis.total_cost) }} </strong>
              </td>
              <td>
                <strong> {{ currency }}{{ formatNumber(analysis.total_revenue) }} </strong>
              </td>
              <td colspan="3"></td>
            </tr>
          </tfoot>
        </table>

        <h4 class="text-lg font-semibold mt-8 mb-2 text-gray-900">Financial Summary</h4>
        <table class="w-full border-collapse mb-6 bordered-table">
          <thead>
            <tr class="bg-gray-100">
              <th>Metric</th>
              <th>Value</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Total Revenue</th>
              <td></td>
              <td>
                <strong>{{ currency }}{{ formatNumber(analysis.total_revenue) }}</strong>
              </td>
            </tr>
            <tr>
              <th>Labor Hours</th>
              <td>{{ analysis.labor_hours }} hrs</td>
              <td></td>
            </tr>
            <tr>
              <th>Labor Cost Per Hour</th>
              <td>{{ currency }}{{ formatNumber(analysis.labor_cost_per_hour) }}</td>
              <td></td>
            </tr>
            <tr>
              <th>Total Labor Cost</th>
              <td>
                <strong>{{ currency }}{{ formatNumber(analysis.labor_cost) }}</strong>
              </td>
              <td></td>
            </tr>
            <tr>
              <th>Total Items Cost</th>
              <td>
                <strong>{{ currency }}{{ formatNumber(analysis.total_cost) }}</strong>
              </td>
              <td></td>
            </tr>
            <tr>
              <th>Fixed Overheads</th>
              <td>
                <strong>{{ currency }}{{ formatNumber(analysis.fixed_overheads) }}</strong>
              </td>
              <td></td>
            </tr>
            <tr>
              <th>Cost of Goods Sold (COGS)</th>
              <td></td>
              <td>
                <strong>{{ currency }}{{ formatNumber(analysis.cost_of_goods_sold) }}</strong>
              </td>
            </tr>
            <tr>
              <th>Gross Profit</th>
              <td></td>
              <td
                :class="
                  analysis.gross_profit < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                "
              >
                <strong>{{ currency }}{{ formatNumber(analysis.gross_profit) }}</strong>
              </td>
            </tr>
            <tr>
              <th>Profit Margin</th>
              <td></td>
              <td
                :class="
                  analysis.profit_margin < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'
                "
              >
                <strong>{{ formatNumber(analysis.profit_margin) }}%</strong>
              </td>
            </tr>
            <tr>
              <th>Target Margin</th>
              <td></td>
              <td>{{ formatNumber(analysis.target_profit_margin) }}%</td>
            </tr>
            <tr>
              <th>Target Met</th>
              <td></td>
              <td>
                <span v-if="analysis.meets_target">Yes</span>
                <span v-else>No</span>
              </td>
            </tr>
            <tr>
              <th>Profitability Health Status</th>
              <td></td>
              <td>
                <span v-if="healthStatus" :class="healthStatus.colorClass" class="font-bold">{{
                  healthStatus.label
                }}</span>
                <span v-else>N/A</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="analysis.labor_suggestions">
          <h4 class="text-lg font-semibold mt-8 mb-2 text-gray-900">Labor Efficiency Analysis</h4>
          <table class="w-full border-collapse mb-6 bordered-table">
            <thead>
              <tr class="bg-gray-100">
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Estimated Sustainable Hours</th>
                <td>{{ analysis.labor_suggestions.estimated_sustainable_hours }}</td>
              </tr>
              <tr>
                <th>Labour Hours Exceeded</th>
                <td>
                  <span v-if="analysis.labor_suggestions.labor_hours_exceeded">Yes</span>
                  <span v-else>No</span>
                </td>
              </tr>
              <tr>
                <th>Comment</th>
                <td>
                  <textarea
                    v-model="analysis.labor_suggestions.comment"
                    class="border border-gray-300 p-1 rounded w-full"
                    rows="5"
                    placeholder="Enter comment..."
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="analysis.ai_suggestions">
          <h4 class="text-lg font-semibold mt-8 mb-2 text-gray-900">Suggested Improvements</h4>
          <table class="w-full border-collapse mb-6 bordered-table">
            <thead>
              <tr class="bg-gray-100">
                <th>Metric</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Target Margin Adjustments</th>
                <td>
                  <textarea
                    v-model="analysis.ai_suggestions.target_margin_adjustments"
                    class="border border-gray-300 p-1 rounded w-full"
                    rows="5"
                    placeholder="Enter adjustments..."
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>Labor Allocation Improvements</th>
                <td>
                  <textarea
                    v-model="analysis.ai_suggestions.labor_allocation_improvements"
                    class="border border-gray-300 p-1 rounded w-full"
                    rows="5"
                    placeholder="Enter improvements..."
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>Product Swaps</th>
                <td>
                  <textarea
                    v-model="analysis.ai_suggestions.product_swaps"
                    class="border border-gray-300 p-1 rounded w-full"
                    rows="5"
                    placeholder="Enter product swaps..."
                  ></textarea>
                </td>
              </tr>
              <tr>
                <th>Profitability Summary</th>
                <td>
                  <textarea
                    v-model="analysis.ai_suggestions.profitability_summary"
                    class="border border-gray-300 p-1 rounded w-full"
                    rows="5"
                    placeholder="Enter profitability summary..."
                  ></textarea>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex justify-end mt-4">
          <button
            type="submit"
            :disabled="loading"
            class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <span v-if="loading" class="loader mr-2"></span>
            Reassess
          </button>
          <button
            type="button"
            :disabled="loading"
            class="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 flex items-center ml-2"
            @click="exportResult"
            :class="{ 'opacity-50 cursor-not-allowed': loading }"
          >
            <span v-if="loading" class="loader mr-2"></span>
            Export Result
          </button>
        </div>
      </form>
    </div>
  </form>
</template>

<style scoped>
.bordered-table,
.bordered-table th,
.bordered-table td {
  border: 1px solid #d1d5db;
}
.bordered-table th,
.bordered-table td {
  padding: 0.5rem;
}
.bordered-table {
  background: #fff;
  border-radius: 0.375rem;
}
</style>
