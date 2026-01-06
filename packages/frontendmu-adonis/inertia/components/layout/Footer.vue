<script setup lang="ts">
const today = new Date()
</script>

<template>
  <section>
    <div
      class="absolute bottom-0 w-full bg-verse-950 dark:bg-black dark:text-white border-gray-100 p-4 text-center text-gray-500 font-light text-xs md:text-normal"
    >
      2016 - {{ today.getFullYear() }} ~ Front-End Coders Mauritius
    </div>
  </section>
</template>
