<script setup lang="ts">
import { computed } from 'vue'

type TLevels = 1 | 2 | 3 | 4 | 5 | 6
type TWeights =
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
  | 'extrabold'
  | 'black'

interface Props {
  level?: TLevels
  class?: string
  weight?: TWeights
}

const props = withDefaults(defineProps<Props>(), {
  level: 2,
  weight: 'bold',
})

const Element = computed(() => `h${props.level}` as keyof HTMLElementTagNameMap)

const fontSizeClasses = computed(() => {
  switch (props.level) {
    case 1:
      return 'text-4xl sm:text-5xl md:text-6xl'
    case 2:
      return 'text-3xl sm:text-4xl md:text-5xl'
    case 3:
      return 'text-2xl sm:text-3xl md:text-4xl'
    case 4:
      return 'text-xl sm:text-2xl md:text-3xl'
    case 5:
      return 'text-lg sm:text-xl md:text-2xl'
    case 6:
      return 'text-base sm:text-lg md:text-xl'
    default:
      return 'text-3xl sm:text-4xl md:text-5xl'
  }
})

const fontWeightClasses = computed(() => `font-${props.weight}`)
</script>

<template>
  <component
    :is="Element"
    class="font-heading tracking-tight text-verse-900 dark:text-verse-200"
    :class="[props.class, fontWeightClasses, fontSizeClasses]"
  >
    <slot />
  </component>
</template>
