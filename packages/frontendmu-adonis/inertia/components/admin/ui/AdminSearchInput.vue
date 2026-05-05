<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    label?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'Search...',
    label: 'Search',
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: []
}>()
</script>

<template>
  <label class="relative block w-full">
    <span class="sr-only">{{ label }}</span>
    <svg
      class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verse-400 pointer-events-none"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder"
      class="w-full pl-10 pr-3.5 py-2 text-sm bg-white dark:bg-verse-900/40 border border-verse-200 dark:border-verse-800 rounded-lg text-verse-900 dark:text-verse-100 placeholder-verse-400 focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown.enter.prevent="emit('submit')"
    />
  </label>
</template>
