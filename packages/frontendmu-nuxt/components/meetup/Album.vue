<script setup lang="ts">
import { computed, ref } from 'vue'
import { getImageUrl } from '@/utils/helpers'

const props = defineProps<{
  getCurrentEvent: DirectusEvent
  currentAlbum: string[]
  source: string
}>()

const limit = ref(10) // Set your desired limit here
const maxAlbumLength = computed(() => props.currentAlbum.length)
const activeImageIndex = ref(0)

function viewMore() {
  // Implement your logic here
}

function setActiveImageIndex(index: number) {
  activeImageIndex.value = index
}
</script>

<template>
  <div class="lg:mx-auto lg:w-[80%] px-4">
    <div v-if="getCurrentEvent.album" class="flex flex-col items-center gap-8 py-20">
      <Dialog>
        <div class="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div v-for="(photo, index) in currentAlbum" :key="photo" class="aspect-video">
            <DialogTrigger as-child>
              <img
                :src="getImageUrl(source, photo)"
                loading="lazy"
                tabindex="0"
                class="object-cover w-full h-full object-center block rounded-md overflow-hidden cursor-zoom-in hover:scale-105 focus-visible:scale-105 transition-transform"
                @click="setActiveImageIndex(index)"
              >
            </DialogTrigger>
          </div>
        </div>
        <DialogContent
          class="bg-zinc-950 bg-opacity-80 border-zinc-800 max-w-7xl"
        >
          <DialogHeader>
            <DialogTitle class="sr-only">
              Photos
            </DialogTitle>
            <DialogDescription class="sr-only">
              Photos in carousel
            </DialogDescription>
          </DialogHeader>
          <Carousel
            :opts="{ startIndex: activeImageIndex }"
            class="relative max-h-[calc(100svh-160px)] rounded-md overflow-hidden"
          >
            <CarouselContent class="h-full max-h-[calc(100svh-160px)]">
              <CarouselItem v-for="photo in currentAlbum" :key="photo">
                <div class="w-full h-full flex flex-row justify-center items-center">
                  <img :src="getImageUrl(source, photo)" class="object-contain max-w-full max-h-full block rounded-md overflow-hidden">
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious class="left-1" />
            <CarouselNext class="right-1" />
          </Carousel>
        </DialogContent>
      </Dialog>
      <!-- ToDo -->
      <!--
      <div
        v-if="limit < maxAlbumLength"
        class="cursor-pointer hover:opacity-90 transition-all text-md block w-48 rounded-md bg-verse-600 px-4 py-4 text-center font-medium text-white md:w-64 md:px-8 md:text-xl"
        @click="viewMore"
      >
        View more
      </div>
      -->
    </div>
  </div>
</template>
