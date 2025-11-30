<script setup lang="ts">
import { getImageUrl } from '@/utils/helpers'

const props = defineProps<{
  currentAlbum: string[] | undefined
  source: string
  columns?: number
}>()

const columns = computed(() => {
  // default to 3
  if (!props.columns) {
    return 3
  }
  return props.columns
})
</script>

<template>
  <div v-if="currentAlbum" class="grid items-center h-full" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
    <NuxtImg
      v-for="photo in currentAlbum"
      :key="photo"
      :src="getImageUrl(source, photo)"
      alt="Album Photo"
      width="242"
      height="408"
      class="object-cover w-full h-full block"
      loading="lazy"
    />
  </div>
</template>
