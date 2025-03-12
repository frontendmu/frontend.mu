<script setup lang="ts">
import photosResponse from '../../../frontendmu-data/data/photos-raw.json'
import { isDateInFuture, vTransitionName } from '@/utils/helpers'
import type { DirectusEvent } from '@/utils/types'

interface Props {
  routeId: string
  getCurrentEvent: DirectusEvent
}

const props = defineProps<Props>()
const appConfig = useAppConfig()
const photoAlbumSource = appConfig.photoAlbumSource as string

// const currentAlbum = ref<string[]>([]);

function fetchAlbumDetails(albumName: string | null): string[] {
  if (!albumName)
    return []

  if (photosResponse) {
    const albumPhotosParsed = photosResponse[albumName as keyof typeof photosResponse]
    if (Array.isArray(albumPhotosParsed)) {
      const filteredPhotos = albumPhotosParsed.filter((photo) => {
        return !photo.endsWith('.mp4')
      })
      return filteredPhotos
    }
  }
  return []
}

const currentAlbum = computed(() => fetchAlbumDetails(props.getCurrentEvent?.album || ''))
</script>

<template>
  <div>
    <div :data-title="getCurrentEvent.title">
      <ContentBlock :contain="false">
        <div class="contain">
          <div class="relative">
            <!-- Content area -->
            <div>
              <template v-if="isDateInFuture(new Date(getCurrentEvent.Date || new Date))">
                <div class="flex flex-col pb-4 gap-2 md:flex-row md:justify-between md:items-center">
                  <div class="flex w-full items-center justify-start">
                    <p
                      class="p-2 rounded-full text-sm font-medium tracking-wide uppercase px-4 tagStyle bg-green-100 text-green-800"
                    >
                      happening soon
                    </p>
                  </div>
                </div>
              </template>
              <div class="text-base uppercase text-verse-900 dark:text-verse-200 font-semibold">
                Topic
              </div>
              <div>
                <BaseHeading
                  :level="1" class="font-extrabold"
                  :style="vTransitionName(getCurrentEvent?.title, 'meetup-title')"
                >
                  {{ getCurrentEvent?.title }}
                </BaseHeading>
              </div>
              <div class="grid md:grid-cols-2">
                <MeetupSessionList :sessions="getCurrentEvent.sessions!" />
              </div>
              <MeetupSponsor :sponsors="getCurrentEvent.sponsors" />
            </div>
          </div>
        </div>
        <div class="contain">
          <div class="mt-10 mb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-8">
              <template v-if="getCurrentEvent.Date">
                <div class="border-t-2 border-verse-900/20 dark:border-verse-800/50 pt-6">
                  <dt class="text-base font-medium text-verse-500 dark:text-verse-300">
                    Date
                  </dt>
                  <dd class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl">
                    {{ new Date(getCurrentEvent.Date).toDateString() }}
                  </dd>
                </div>
              </template>
              <template v-if="getCurrentEvent.Venue">
                <div class="border-t-2 border-verse-900/20 dark:border-verse-800/50 pt-4 md:pt-6">
                  <dt class="text-base font-medium text-verse-500 dark:text-verse-300">
                    Venue
                  </dt>
                  <dd class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl">
                    {{ getCurrentEvent.Venue }}
                  </dd>
                </div>
              </template>
              <template v-if="getCurrentEvent.Time">
                <div class="border-t-2 border-verse-900/20 dark:border-verse-800/50 pt-4 md:pt-6">
                  <dt class="text-base font-medium text-verse-500 dark:text-verse-300">
                    Time
                  </dt>
                  <dd class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl">
                    {{ getCurrentEvent.Time }}
                  </dd>
                </div>
              </template>
              <template v-if="getCurrentEvent.Attendees || getCurrentEvent.seats_available">
                <div class="border-t-2 border-verse-900/20 dark:border-verse-800/50 pt-6">
                  <dt class="text-base font-medium text-verse-500 dark:text-verse-300">
                    Seats Limit
                  </dt>
                  <dd class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl">
                    {{ getCurrentEvent.Attendees || getCurrentEvent.seats_available }}
                  </dd>
                </div>
              </template>
              <template v-if="getCurrentEvent.Location">
                <div class="border-t-2 grid gap-2 border-verse-900/20 dark:border-verse-800/50 pt-4 md:pt-6">
                  <dt class="text-base flex justify-between font-medium text-verse-500 dark:text-verse-300">
                    <div>
                      Meetup Location
                    </div>
                  </dt>
                  <dd class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl mb-2">
                    {{ getCurrentEvent.Location }}
                  </dd>
                  <div v-if="getCurrentEvent.map">
                    <a :href="getCurrentEvent.map" target="_blank" class="text-xs text-verse-100 font-medium bg-verse-400 hover:bg-verse-500 transition-colors duration-200 rounded-full px-3 py-2" aria-label="View event location on map">
                      View on map
                    </a>
                  </div>
                </div>
              </template>
              <div class="border-t-2 grid grid-rows-[auto_1fr] gap-2 border-verse-900/20 dark:border-verse-800/50 pt-4 md:pt-6">
                <dt class="text-base flex justify-between font-medium text-verse-500 dark:text-verse-300 mb-2">
                  <div>
                    Parking Location
                  </div>
                </dt>
                <dd v-if="getCurrentEvent.parking_location">
                  <a :href="getCurrentEvent.parking_location" target="_blank" class="text-xs text-verse-100 font-medium bg-verse-400 hover:bg-verse-500 transition-colors duration-200 rounded-full px-3 py-2" aria-label="View parking location on map">
                    View on map
                  </a>
                </dd>
                <dd v-else class="text-2xl font-extrabold tracking-tight text-verse-900 dark:text-verse-200 md:text-3xl">
                  Not available
                </dd>
              </div>
            </div>
          </div>
        </div>
        <div class="contain">
          <ClientOnly>
            <AuthRsvpAttendeeList :seat-capacity="getCurrentEvent.seats_available" :meetup-id="routeId" />
          </ClientOnly>
        </div>
        <MeetupAlbum :get-current-event="getCurrentEvent" :current-album="currentAlbum" :source="photoAlbumSource" />
        <ClientOnly>
          <AuthRsvpToMeetup :meetup-id="routeId" :meetup-details="getCurrentEvent" />
        </ClientOnly>
      </ContentBlock>
    </div>
  </div>
</template>
