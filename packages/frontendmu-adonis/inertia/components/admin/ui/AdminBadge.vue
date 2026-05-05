<script setup lang="ts">
import { computed } from 'vue'

type Tone =
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'accent'
  | 'muted'

const props = withDefaults(
  defineProps<{
    tone?: Tone
    dot?: boolean
  }>(),
  {
    tone: 'neutral',
    dot: false,
  }
)

const toneClasses = computed(() => {
  switch (props.tone) {
    case 'success':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
    case 'warning':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
    case 'danger':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    case 'info':
      return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
    case 'accent':
      return 'bg-coral-soft text-coral-deep dark:bg-coral-strong/15 dark:text-coral-strong'
    case 'muted':
      return 'bg-verse-100 text-verse-600 dark:bg-verse-800 dark:text-verse-400'
    default:
      return 'bg-verse-100 text-verse-700 dark:bg-verse-800 dark:text-verse-200'
  }
})

const dotClasses = computed(() => {
  switch (props.tone) {
    case 'success':
      return 'bg-emerald-500'
    case 'warning':
      return 'bg-amber-500'
    case 'danger':
      return 'bg-red-500'
    case 'info':
      return 'bg-sky-500'
    case 'accent':
      return 'bg-coral-strong'
    case 'muted':
      return 'bg-verse-400'
    default:
      return 'bg-verse-500'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium capitalize',
      toneClasses,
    ]"
  >
    <span v-if="dot" :class="['w-1.5 h-1.5 rounded-full', dotClasses]" aria-hidden="true" />
    <slot />
  </span>
</template>
