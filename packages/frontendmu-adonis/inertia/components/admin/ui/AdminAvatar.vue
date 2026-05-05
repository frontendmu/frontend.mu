<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    src?: string | null
    name?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    rounded?: 'full' | 'lg' | 'xl' | '2xl'
  }>(),
  {
    src: null,
    name: '',
    size: 'md',
    rounded: 'full',
  }
)

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-7 h-7 text-[10px]'
    case 'sm':
      return 'w-9 h-9 text-xs'
    case 'md':
      return 'w-10 h-10 text-sm'
    case 'lg':
      return 'w-14 h-14 text-base'
    case 'xl':
      return 'w-20 h-20 text-lg'
  }
})

const roundedClasses = computed(() => {
  switch (props.rounded) {
    case 'full':
      return 'rounded-full'
    case 'lg':
      return 'rounded-lg'
    case 'xl':
      return 'rounded-xl'
    case '2xl':
      return 'rounded-2xl'
  }
})

const initial = computed(() => (props.name?.trim()?.charAt(0).toUpperCase() ?? '?'))
</script>

<template>
  <img
    v-if="src"
    :src="src"
    :alt="name ?? ''"
    loading="lazy"
    :class="[sizeClasses, roundedClasses, 'object-cover bg-verse-100 dark:bg-verse-800 shrink-0']"
  />
  <div
    v-else
    :class="[
      sizeClasses,
      roundedClasses,
      'bg-verse-100 dark:bg-verse-800 text-verse-700 dark:text-verse-200 flex items-center justify-center font-semibold shrink-0',
    ]"
    :aria-label="name ?? 'avatar'"
  >
    {{ initial }}
  </div>
</template>
