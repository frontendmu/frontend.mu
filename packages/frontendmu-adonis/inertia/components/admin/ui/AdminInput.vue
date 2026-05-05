<script setup lang="ts">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    type?: string
    error?: string
    hint?: string
    label?: string
    required?: boolean
    leadingText?: string
    id?: string
  }>(),
  {
    modelValue: '',
    type: 'text',
    error: undefined,
    hint: undefined,
    label: undefined,
    required: false,
    leadingText: undefined,
    id: undefined,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const attrs = useAttrs()

const fieldId = computed(() => props.id || `field-${Math.random().toString(36).slice(2, 9)}`)

function onInput(event: Event) {
  const target = event.target as HTMLInputElement
  if (props.type === 'number') {
    const num = target.value === '' ? null : Number(target.value)
    emit('update:modelValue', Number.isNaN(num as number) ? null : num)
  } else {
    emit('update:modelValue', target.value)
  }
}
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
      <span
        v-if="leadingText"
        class="absolute inset-y-0 left-0 inline-flex items-center px-3 text-sm text-verse-500 dark:text-verse-300 border-r border-verse-200 dark:border-verse-700 bg-verse-50/60 dark:bg-verse-900/40 rounded-l-lg pointer-events-none"
      >
        {{ leadingText }}
      </span>
      <input
        :id="fieldId"
        :type="type"
        :value="modelValue ?? ''"
        v-bind="attrs"
        :class="[
          'w-full rounded-lg border bg-white dark:bg-verse-900/40 text-verse-900 dark:text-verse-100 placeholder-verse-400 dark:placeholder-verse-500',
          'focus:outline-none focus:ring-2 focus:ring-verse-500/40 focus:border-verse-500 transition-colors',
          'px-3.5 py-2 text-sm',
          leadingText ? 'pl-[3.5rem]' : '',
          error
            ? 'border-red-300 dark:border-red-800 focus:border-red-500 focus:ring-red-500/40'
            : 'border-verse-200 dark:border-verse-800',
        ]"
        @input="onInput"
      />
    </div>
    <p v-if="error" class="mt-1.5 text-xs text-red-600 dark:text-red-400">{{ error }}</p>
    <p
      v-else-if="hint"
      class="mt-1.5 text-xs text-verse-500 dark:text-verse-300"
    >
      {{ hint }}
    </p>
  </div>
</template>
