<template>
  <section class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-indigo-700 mb-10">Image Filters</h1>

    <!-- Drop Area -->
    <UiImageDragDrop v-if="!store.file" />

    <!-- Canvas and Buttons -->
    <UiImageEditor v-else />
  </section>
</template>
<script setup lang="ts">
import { useImageStore } from '@/stores/image'

const store = useImageStore()
</script>
