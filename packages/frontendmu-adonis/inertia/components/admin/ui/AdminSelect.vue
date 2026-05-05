<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    error?: string
    hint?: string
    label?: string
    required?: boolean
    id?: string
  }>(),
  {
    modelValue: '',
    error: undefined,
    hint: undefined,
    label: undefined,
    required: false,
    id: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const attrs = useAttrs()
const fieldId = computed(() => props.id || `field-${Math.random().toString(36).slice(2, 9)}`)
</script>

<template>
  <div>
    <label
      v-if="label"
      :for="fieldId"
      class="block text-sm font-medium text-verse-700 dark:text-verse-300 mb-1.5"
    >
      {{ label }}
      <span v-if="required" class="text-red-500" aria-hidden="true">*</span>
    </label>
    <div class="relative">
      <select
        :id="fieldId"
        :value="modelValue ?? ''"
        v-bind="attrs"
        :class="[
          'w-full appearance-none rounded-lg border bg-white dark:bg-verse-900/40 text-verse-900 dark:text-verse-100',
          'focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors',
          'px-3.5 py-2 pr-10 text-sm',
          error
            ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/40'
            : 'border-verse-200 dark:border-verse-800',
        ]"
        @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      >
        <slot />
      </select>
      <svg
        class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-verse-400 pointer-events-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p
      v-else-if="hint"
      class="mt-1.5 text-xs text-verse-500 dark:text-verse-400"
    >
      {{ hint }}
    </p>
  </div>
</template>
