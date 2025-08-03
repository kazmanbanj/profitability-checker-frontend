<template>
  <div
    class="text-center text-slate-600 italic py-24 px-6 rounded-lg border-4 border-double border-slate-300"
    @drag.prevent.stop=""
    @dragstart.prevent.stop=""
    @dragend.prevent.stop=""
    @dragover.prevent.stop=""
    @dragenter.prevent.stop=""
    @dragleave.prevent.stop=""
    @drop.prevent.stop="store.upload"
  >
    Drag and drop image.
  </div>
</template>

<script setup lang="ts">
import { useImageStore } from '@/stores/image'

const store = useImageStore()
</script>
