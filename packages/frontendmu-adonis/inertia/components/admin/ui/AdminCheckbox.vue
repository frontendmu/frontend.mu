<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    label?: string
    description?: string
    disabled?: boolean
    id?: string
  }>(),
  {
    modelValue: false,
    label: undefined,
    description: undefined,
    disabled: false,
    id: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const fieldId = computed(() => props.id || `cb-${Math.random().toString(36).slice(2, 9)}`)
</script>

<template>
  <label
    :for="fieldId"
    :class="[
      'flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors',
      modelValue
        ? 'border-verse-400 dark:border-verse-600 bg-verse-50/50 dark:bg-verse-900/40'
        : 'border-verse-200 dark:border-verse-800 hover:border-verse-300 dark:hover:border-verse-700',
      disabled && 'opacity-50 cursor-not-allowed',
    ]"
  >
    <input
      :id="fieldId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="mt-0.5 h-4 w-4 text-verse-600 border-verse-300 dark:border-verse-700 rounded focus:ring-verse-500 cursor-pointer"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
    <span class="min-w-0">
      <span v-if="label" class="block text-sm font-medium text-verse-900 dark:text-verse-100">
        {{ label }}
      </span>
      <span v-if="description" class="block text-xs text-verse-500 dark:text-verse-300 mt-0.5">
        {{ description }}
      </span>
      <slot />
    </span>
  </label>
</template>
