<script setup lang="ts">
import { reactive, ref } from 'vue'
import api from '@/api'

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

interface Result {
  total_revenue: number
  total_cost: number
  net_profit: number
  margin: number
  health_status: string
  labor_flag: boolean
  ai_suggestions: string
}

const form = reactive<Form>({
  line_items: [
    {
      name: '',
      cost_price: 0,
      sell_price: 0,
      quantity: 1,
      additional_info: {
        MPN: '',
        SKU: '',
      },
    },
  ],
  labor_hours: 0,
  labor_cost_per_hour: 0,
  fixed_overheads: 0,
  target_profit_margin: 30,
})

const result = ref<Result | null>(null)

function addItem() {
  form.line_items.push({
    name: '',
    cost_price: 0,
    sell_price: 0,
    quantity: 1,
    additional_info: {
      MPN: '',
      SKU: '',
    },
  })
}

function removeItem(index: number) {
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

async function submitForm() {
  const { data } = await api.post('v1/quotes/analyze', form)
  result.value = data
}
</script>

<template>
  <form @submit.prevent="submitForm" class="space-y-6 max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
    <div v-for="(item, index) in form.line_items" :key="index" class="space-y-4 border p-4 rounded-md bg-gray-50">
      <div class="grid grid-cols-5 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
          <input v-model="item.name" type="text" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
          <input v-model.number="item.cost_price" type="number" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sell Price</label>
          <input v-model.number="item.sell_price" type="number" class="input" required />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input v-model.number="item.quantity" type="number" class="input" required />
        </div>
        <div class="text-right">
          <button type="button" @click="removeItem(index)" class="text-red-500 hover:text-red-700">🗑️ Remove</button>
        </div>
      </div>

      <div v-for="(value, key) in item.additional_info" :key="key" class="grid grid-cols-3 gap-4 items-end">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ key }}</label>
          <input v-model="item.additional_info[key]" type="text" class="input" />
        </div>
        <div class="text-left">
          <button type="button" class="text-red-500 hover:text-red-700" @click="removeAdditionalField(item, String(key))">Remove</button>
        </div>
      </div>

      <div>
        <button type="button" @click="addAdditionalField(item)" class="text-blue-600 hover:text-blue-800">➕ Add Additional Info</button>
      </div>
    </div>

    <div class="text-right">
      <button type="button" @click="addItem" class="text-green-600 hover:text-green-800">➕ Add Item</button>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
        <input v-model.number="form.labor_hours" type="number" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Labor Cost per Hour</label>
        <input v-model.number="form.labor_cost_per_hour" type="number" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Fixed Overheads</label>
        <input v-model.number="form.fixed_overheads" type="number" class="input" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Target Profit Margin (%)</label>
        <input v-model.number="form.target_profit_margin" type="number" step="0.01" class="input" />
      </div>
    </div>
    <br>
    <div class="text-center">
      <button type="submit" class="btn mt-4">Check Profitability</button>
    </div>

    <div v-if="result" class="mt-6 border p-6 rounded shadow bg-gray-50">
      <h2 class="font-bold text-lg mb-2">Result</h2>
      <p><strong>Total Revenue:</strong> {{ result.total_revenue }}</p>
      <p><strong>Total Cost:</strong> {{ result.total_cost }}</p>
      <p><strong>Net Profit:</strong> {{ result.net_profit }}</p>
      <p><strong>Margin:</strong> {{ result.margin }} ({{ result.health_status }})</p>
      <p v-if="result.labor_flag" class="text-red-600 font-medium mt-2">⚠️ Labor hours exceed sustainable threshold</p>
      <p class="font-semibold mt-4">AI Suggestions:</p>
      <pre class="bg-white border rounded p-2 mt-2 text-sm">{{ result.ai_suggestions }}</pre>
    </div>
  </form>
</template>

<style scoped>
.input {
    border: 1px solid #d1d5db;
    padding: 0.5rem;
    border-radius: 0.25rem;
    width: 100%;
    outline: none;
    transition: box-shadow 0.2s, border-color 0.2s;
}
.input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px #3b82f6;
}

.btn {
    background-color: #2563eb;
    color: #fff;
    padding: 0.5rem 1.5rem;
    border-radius: 0.25rem;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05);
    transition: background 0.2s;
    border: none;
    cursor: pointer;

}
.btn:hover {
    background-color: #1d4ed8;
}
</style>
