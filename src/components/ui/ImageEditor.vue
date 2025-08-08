<template>
  <div class="mt-12 flex flex-col items-center">
    <canvas width="448" height="448" class="rounded shadow-md" ref="canvasEl"></canvas>

    <!-- Filter Buttons -->
    <div class="mt-6 w-full max-w-md">
      <select
        v-model="selectedFilter"
        class="w-full bg-white border border-gray-300 rounded py-3 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-600"
      >
        <option disabled value="">Select a filter</option>
        <option value="filter1" v-for="(filter, index) in filters" :key="index">
          {{ filter }}
        </option>
      </select>
    </div>

    <!-- Download Link -->
    <a
      href="#"
      class="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-center py-3 rounded mt-4 w-full max-w-md block"
    >
      Download
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import useReader from '@/composables/use-reader'
import { useImageStore } from '@/stores/image'
import useCanvas from '@/composables/use-canvas'

const store = useImageStore();
const { canvasEl, loadImage } = useCanvas();
const selectedFilter = ref('')
const filters = [
  'Oceanic',
  'Islands',
  'Marine',
  'Seagreen',
  'Flagblue',
  'Liquid',
  'Diamante',
  'Vintage',
  'Perfume',
  'Serenity',
  'Lofi',
  'Cali',
  'Obsidian',
  'Firenze',
  'Dramatic',
  'Golden',
  'Pastel Pink',
]
const { reader } = useReader(store.file, () => {
  if (!reader.result) return

  const dataUrl = reader.result.toString()
  loadImage(dataUrl);
})
</script>
