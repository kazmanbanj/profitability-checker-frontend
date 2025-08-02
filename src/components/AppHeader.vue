<template>
  <header class="bg-blue-600 text-white px-6 py-4 shadow-md flex justify-between items-center">
    <h1 class="text-xl font-semibold">Specifi Profit Optimiser</h1>
    <nav class="space-x-4">
      <router-link
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="hover:underline"
        :class="{ 'font-bold underline': route.path === link.to }"
      >
        {{ link.label }}
      </router-link>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const links = [
  { to: '/', label: 'Profit Form' },
  { to: '/history', label: 'History' },
  { to: '/image-filter', label: 'Image Filter' },
  { to: '/about', label: 'About' },
]
</script>
