<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

function cycleMode() {
  isDark.value = !isDark.value

  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('color-mode', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('color-mode', 'light')
  }
}

onMounted(() => {
  // Check for saved preference or system preference
  const savedMode = localStorage.getItem('color-mode')
  if (savedMode === 'dark') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  } else if (savedMode === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})
</script>

<template>
  <button
    type="button"
    class="group relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-600 shadow-sm transition-all hover:border-verse-500/30 hover:bg-white hover:text-verse-500 active:scale-95 dark:border-verse-800 dark:bg-verse-950/70 dark:text-gray-300 dark:hover:border-verse-600 dark:hover:bg-verse-950/70 dark:hover:text-verse-300"
    @click="cycleMode"
    aria-label="Toggle color mode"
  >
    <!-- Sun (Light Mode Icon) -->
    <svg 
      class="w-5 h-5 text-verse-600 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 absolute" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 9h-1m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>

    <!-- Moon (Dark Mode Icon) -->
    <svg 
      class="w-5 h-5 text-verse-400 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 absolute" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
