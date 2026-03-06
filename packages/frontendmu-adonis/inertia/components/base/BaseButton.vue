<script setup lang="ts">
import { computed } from 'vue'
import { Link } from '@inertiajs/vue3'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'cta' | 'danger' | 'success' | 'warning' | 'neutral'
  loading?: boolean
  href?: string
  external?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: undefined,
  loading: false,
  href: undefined,
  external: false,
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2 py-1 text-xs md:text-sm'
    case 'md':
      return 'px-4 py-2 text-sm md:text-base'
    case 'lg':
      return 'px-6 py-3 text-md md:text-lg'
    default:
      return 'px-4 py-2 text-sm md:text-base'
  }
})

const colorClasses = computed(() => {
  switch (props.color) {
    case 'primary':
      return 'bg-verse-500 text-white hover:bg-verse-600'
    case 'cta':
      return 'bg-verse-500 text-white hover:bg-verse-600'
    case 'danger':
      return 'bg-red-500 text-white hover:bg-red-600'
    case 'success':
      return 'bg-green-500 text-white hover:bg-green-600'
    case 'warning':
      return 'bg-yellow-600 text-white hover:bg-yellow-600'
    case 'neutral':
      return 'bg-transparent dark:ring-gray-200/10 ring-gray-300/30 ring-2 dark:text-white hover:bg-verse-300/20'
    default:
      return 'hover:bg-white/80 text-verse-700 dark:text-verse-100 hover:dark:text-verse-100/80 bg-white dark:bg-verse-700/50'
  }
})

const baseClasses =
  'shadow-xl hover:shadow-lg active:shadow cursor-pointer transition-all inline-flex gap-4 items-center justify-center rounded-full disabled:opacity-20 disabled:cursor-not-allowed'
</script>

<template>
  <!-- External link -->
  <a
    v-if="href && external"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    :class="[sizeClasses, colorClasses, baseClasses]"
    :disabled="loading"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </a>

  <!-- Internal link -->
  <Link
    v-else-if="href"
    :href="href"
    :class="[sizeClasses, colorClasses, baseClasses]"
    :disabled="loading"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </Link>

  <!-- Button -->
  <button
    v-else
    :class="[sizeClasses, colorClasses, baseClasses]"
    :disabled="loading"
  >
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
