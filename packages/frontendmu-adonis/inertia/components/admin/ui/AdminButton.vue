<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'subtle'
type Size = 'sm' | 'md'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    href?: string
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    external?: boolean
    iconOnly?: boolean
    title?: string
  }>(),
  {
    variant: 'secondary',
    size: 'md',
    href: undefined,
    type: 'button',
    disabled: false,
    loading: false,
    external: false,
    iconOnly: false,
    title: undefined,
  }
)

const sizeClasses = computed(() => {
  if (props.iconOnly) {
    return props.size === 'sm' ? 'p-1.5' : 'p-2'
  }
  return props.size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-verse-900 dark:bg-verse-50 text-white dark:text-verse-900 hover:bg-verse-800 dark:hover:bg-white border border-verse-900 dark:border-verse-50'
    case 'secondary':
      return 'bg-white dark:bg-verse-900/40 text-verse-700 dark:text-verse-200 border border-verse-200 dark:border-verse-800 hover:border-verse-400 dark:hover:border-verse-600 hover:bg-verse-50 dark:hover:bg-verse-900'
    case 'ghost':
      return 'bg-transparent text-verse-600 dark:text-verse-400 hover:text-verse-900 dark:hover:text-verse-100 hover:bg-verse-100/60 dark:hover:bg-verse-800/60 border border-transparent'
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700'
    case 'subtle':
      return 'bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-200 border border-transparent hover:bg-verse-200 dark:hover:bg-verse-700'
  }
})

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-verse-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-verse-950',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  sizeClasses.value,
  variantClasses.value,
])
</script>

<template>
  <a
    v-if="href && external"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
    :title="title"
    :aria-label="iconOnly ? title : undefined"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </a>
  <Link
    v-else-if="href"
    :href="href"
    :class="classes"
    :title="title"
    :aria-label="iconOnly ? title : undefined"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </Link>
  <button
    v-else
    :type="type"
    :disabled="disabled || loading"
    :class="classes"
    :title="title"
    :aria-label="iconOnly ? title : undefined"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
