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
    class="text-verse-600 dark:text-verse-100 w-6 h-6 cursor-pointer relative"
    @click="cycleMode"
    aria-label="Toggle theme"
  >
    <!-- Moon icon (light mode) -->
    <svg
      class="absolute w-6 h-6 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M2.9.5a.4.4 0 0 0-.8 0v.6h-.6a.4.4 0 1 0 0 .8h.6v.6a.4.4 0 1 0 .8 0v-.6h.6a.4.4 0 0 0 0-.8h-.6zm3 3a.4.4 0 1 0-.8 0v.6h-.6a.4.4 0 1 0 0 .8h.6v.6a.4.4 0 1 0 .8 0v-.6h.6a.4.4 0 0 0 0-.8h-.6zM1 .5a.4.4 0 0 0-.8 0v.6H0a.4.4 0 0 0 0 .8h.2v.6a.4.4 0 0 0 .8 0v-.6H1a.4.4 0 0 0 0-.8h-.2zm1 7a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M7.5 3a4.5 4.5 0 1 0 0 9a4.5 4.5 0 0 0 0-9"
        clip-rule="evenodd"
      />
    </svg>
    <!-- Sun icon (dark mode) -->
    <svg
      class="absolute w-6 h-6 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 15 15"
    >
      <path
        fill="currentColor"
        fill-rule="evenodd"
        d="M7.5 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2a.5.5 0 0 1 .5-.5M2.197 2.197a.5.5 0 0 1 .707 0L4.318 3.61a.5.5 0 0 1-.707.707L2.197 2.904a.5.5 0 0 1 0-.707M.5 7a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm1.697 5.803a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 1 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0M12.5 7a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm-1.818-2.682a.5.5 0 0 1 0-.707l1.414-1.414a.5.5 0 1 1 .707.707l-1.414 1.414a.5.5 0 0 1-.707 0M8 12.5a.5.5 0 0 0-1 0v2a.5.5 0 0 0 1 0zm2.682-1.818a.5.5 0 0 1 .707 0l1.414 1.414a.5.5 0 1 1-.707.707l-1.414-1.414a.5.5 0 0 1 0-.707M5.5 7.5a2 2 0 1 1 4 0a2 2 0 0 1-4 0m2-3a3 3 0 1 0 0 6a3 3 0 0 0 0-6"
        clip-rule="evenodd"
      />
    </svg>
    <span class="sr-only">Toggle theme</span>
  </button>
</template>
