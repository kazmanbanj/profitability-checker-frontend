<template>
  <section class="max-w-6xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-indigo-700 mb-10">Image Filters</h1>

    <!-- Drop Area -->
    <div class="text-center text-slate-600 italic py-24 px-6 rounded-lg border-4 border-double border-slate-300">
      Drag and drop image.
    </div>

    <!-- Canvas and Buttons -->
    <div class="mt-12 flex flex-col items-center">
      <canvas width="448" height="448" class="rounded shadow-md"></canvas>

      <!-- Filter Buttons -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 w-full max-w-md">
        <button
          type="button"
          class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded"
        >
          Filter 1
        </button>
        <button
          type="button"
          class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded"
        >
          Filter 2
        </button>
        <button
          type="button"
          class="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 rounded"
        >
          Filter 3
        </button>
      </div>

      <!-- Download Link -->
      <a
        href="#"
        class="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold text-center py-3 rounded mt-4 w-full max-w-md block"
      >
        Download
      </a>
    </div>
  </section>
</template>
