<script setup lang="ts">
import { onMounted, ref } from 'vue'
import photosResponse from '../../../frontendmu-data/data/photos-raw.json'
import useMeetups from '@/composables/useMeetups'

const scrollContainer = ref<HTMLDivElement | null>(null)
const ITEM_HEIGHT = 190

const canScrollUp = ref(false)
const canScrollDown = ref(true)

const { pastMeetups } = useMeetups({
  pastMeetupsLimit: 20,
})

const meetupsWithAlbums = pastMeetups.value.filter(meetup => meetup.album)

const appConfig = useAppConfig()
const photoAlbumSource = appConfig.photoAlbumSource as string

let maxAlbumLength = 0

function fetchAlbumDetails(album: string) {
  const albumName = album
  if (!albumName)
    return []

  if (photosResponse) {
    const albumPhotosParsed = photosResponse[albumName as keyof typeof photosResponse]
    // check if array
    if (Array.isArray(albumPhotosParsed)) {
      maxAlbumLength = albumPhotosParsed.length
      // filter all strings that end with .mp4
      const filteredPhotos = albumPhotosParsed.filter((photo) => {
        return !photo.endsWith('.mp4')
      })
      return filteredPhotos.slice(0, 3)
    }
  }
}

function updateScrollButtons() {
  const el = scrollContainer.value
  if (!el)
    return
  canScrollUp.value = el.scrollTop > 0
  canScrollDown.value = el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

function scrollUp() {
  const el = scrollContainer.value
  if (!el)
    return
  el.scrollBy({ top: -ITEM_HEIGHT, behavior: 'smooth' })
}
function scrollDown() {
  const el = scrollContainer.value
  if (!el)
    return
  el.scrollBy({ top: ITEM_HEIGHT, behavior: 'smooth' })
}

onMounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.addEventListener('scroll', updateScrollButtons)
    updateScrollButtons()
  }
})
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <!-- Up Arrow -->
    <button
      class="mb-2 p-1 rounded-full bg-verse-800/80 hover:bg-verse-700 text-white shadow transition disabled:opacity-40"
      :disabled="!canScrollUp"
      aria-label="Scroll up"
      type="button"
      @click="scrollUp"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
      </svg>
    </button>
    <!-- Scroll Area -->
    <div ref="scrollContainer" class="w-full h-[570px] overflow-y-auto rounded-lg border border-verse-700 bg-white/5 dark:bg-verse-900/10 snap-y snap-mandatory">
      <div v-for="(meetup, index) in meetupsWithAlbums" :key="index" class="relative h-[190px] mb-2 last:mb-0 group snap-start">
        <NuxtLink :to="`/meetup/${meetup.id}`" class="absolute inset-0 z-10">
          <span class="sr-only">{{ meetup.title }}</span>
        </NuxtLink>
        <CardsCardAlbum
          class="w-full h-full object-cover rounded-lg"
          :current-album="fetchAlbumDetails(meetup.album || '')"
          :source="photoAlbumSource"
          :columns="2"
        />
        <span
          class="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-verse-900/90 shadow-md shadow-verse-200/20 rounded-full text-white px-4 py-1 text-sm font-semibold truncate max-w-[90%] text-center"
        >
          {{ meetup.title }}
        </span>
      </div>
    </div>
    <!-- Down Arrow -->
    <button
      class="mt-2 p-1 rounded-full bg-verse-800/80 hover:bg-verse-700 text-white shadow transition disabled:opacity-40"
      :disabled="!canScrollDown"
      aria-label="Scroll down"
      type="button"
      @click="scrollDown"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
</template>
