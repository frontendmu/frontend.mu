<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'cta' | 'danger' | 'success' | 'warning' | 'neutral'
  loading?: boolean
}>()

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

// const loadingClass = computed(() => {
//     switch (props.loading) {
//         case true:
//             return 'animate-spin'
//         default:
//             return ''
//     }
// })
</script>

<template>
  <NuxtLink
    v-bind="$attrs" :class="[sizeClasses, colorClasses]" :disabled="loading"
    class="shadow-xl hover:shadow-lg active:shadow cursor-pointer transition-all inline-flex gap-4 items-center justify-center rounded-full disabled:opacity-20 disabled:cursor-not-allowed"
  >
    <Transition mode="out-in" name="fade">
      <Icon v-if="loading" name="svg-spinners:pulse-2" class="w-4 h-4 text-5xl text-white" />
    </Transition>

    <slot />
  </NuxtLink>
</template>
