<script setup lang="ts">
import { computed } from 'vue'
import Logo from '~/components/layout/Logo.vue'

interface Props {
  name: string
  githubUsername?: string | null
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
})

const finalAvatarUrl = computed(() => {
  if (props.avatarUrl) return props.avatarUrl
  if (props.githubUsername) return `https://avatars.githubusercontent.com/${props.githubUsername}?size=400`
  return null
})

const sizeClasses = {
  sm: 'w-8 h-8 rounded-full',
  md: 'w-12 h-12 rounded-2xl',
  lg: 'w-20 h-20 rounded-[2.5rem]',
  xl: 'w-32 h-32 md:w-40 md:h-40 rounded-[3.5rem]',
  full: 'w-full h-full rounded-[3rem]',
}

const logoSizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-10 h-10',
  xl: 'w-16 h-16',
  full: 'w-1/4 h-1/4',
}
</script>

<template>
  <div 
    :class="[
      'relative flex items-center justify-center shrink-0 overflow-hidden bg-gray-50 dark:bg-verse-900 transition-all',
      sizeClasses[size]
    ]"
  >
    <img
      v-if="finalAvatarUrl"
      :src="finalAvatarUrl"
      :alt="name"
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
    />
    
    <!-- Community Logo Fallback -->
    <div v-else class="flex flex-col items-center justify-center text-verse-500 dark:text-verse-400 opacity-20">
      <Logo :class="logoSizeClasses[size]" />
    </div>
  </div>
</template>
