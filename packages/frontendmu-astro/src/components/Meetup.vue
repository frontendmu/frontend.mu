<script setup lang="ts">
import type { ComputedRef, PropType, Ref } from "vue";
import { ref, computed } from "vue";
export interface IEvent {
  id: string;
  title?: string;
  description?: string;
  Venue?: string;
  Location?: string;
  Date?: string;
  Time?: string;
  Attendees?: string;
  gallery?: string[];
  images?: string[];
  album: string;
  rsvplink?: string;
}

export interface IEvents {
  data: IEvent[];
}

const props = defineProps({
  routeId: {
    type: String,
    required: true,
  },
  getCurrentEvent: {} as PropType<IEvent>,
});
const open: Ref<Boolean> = ref(false);

const absoluteUrl = computed(() => window.location.href);

// to get past or upcoming value base in Date
const dateInPast = function (firstDate: Date, secondDate: Date) {
  if (firstDate.setHours(0, 0, 0, 0) <= secondDate.setHours(0, 0, 0, 0))
    return true;

  return false;
};

const eventImages: ComputedRef<String[]> = computed(() => {
  return props.getCurrentEvent.images;
});
const eventGallery: ComputedRef<String[]> = computed(() => {
  return props.getCurrentEvent.gallery;
});

const isUpcoming: ComputedRef<Boolean> = computed(() => {
  const past = new Date(props.getCurrentEvent.Date);
  const today = new Date();
  const verifyValue = dateInPast(past, today);
  return verifyValue;
});

function copy() {
  const copyText = document.getElementById("myInput");
  copyText.select();
  copyText.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(copyText.value);
}

function shareOnFacebook() {
  const navUrl =
    "https://www.facebook.com/sharer/sharer.php?u=" + `${absoluteUrl.value}`;
  window.open(navUrl, "_blank");
}

function shareOnTwitter() {
  const str = encodeURIComponent(" #mauritius #frontendcoders ");
  const navUrl =
    `https://twitter.com/intent/tweet?text=${props.getCurrentEvent.title}${str}` +
    `${absoluteUrl.value}`;
  window.open(navUrl, "_blank");
}

function shareOnLinkedIn() {
  const navUrl =
    "http://www.linkedin.com/shareArticle?mini=true&url=" +
    `${absoluteUrl.value}`;
  window.open(navUrl, "_blank");
}

// Google Photos Album Section
const source =
  "https://raw.githubusercontent.com/frontendmu/google-photos-sync/main/";
// let currentAlbum = ref([])
// const { data: albumsPhotos, pending, error, refresh } = await useFetch(`${source}index.json`)
const albumsPhotos = ref("");
const limit = ref(12);

const maxAlbumLength = ref(0);

const currentAlbum = computed(() => {
  const albumName = props.getCurrentEvent.album;
  if (!albumName) return [];

  if (albumsPhotos.value) {
    const albumPhotosParsed = JSON.parse(albumsPhotos.value as string)[
      albumName
    ];
    // check if array
    if (Array.isArray(albumPhotosParsed)) {
      maxAlbumLength.value = albumPhotosParsed.length;
      // filter all strings that end with .mp4
      const filteredPhotos = albumPhotosParsed.filter((photo) => {
        return !photo.endsWith(".mp4");
      });
      return filteredPhotos.slice(0, limit.value);
    }
  }
});

const viewMore = () => {
  if (limit.value < maxAlbumLength.value) limit.value += 8;
};

// Helper function to construct proper image URLs
// Handles double slashes and URL encoding for paths with spaces
function getImageUrl(photoPath: string): string {
  // Remove trailing slash from source if present
  const baseUrl = source.replace(/\/$/, '')
  // Remove leading slash from photo path if present
  const cleanPath = photoPath.replace(/^\//, '')
  // URL encode each segment of the path to handle spaces
  const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/')
  return `${baseUrl}/${encodedPath}`
}
</script>

<template>
  <div>
    <div>
      <div class="relative">
        <div class="pt-8 pb-10 md:pt-16 md:pb-24">
          <div class="lg:mx-auto overflow-hidden lg:max-w-[1400px] lg:px-4">
            <div class="relative">
              <div aria-hidden="true" class="hidden sm:block lg:inset-y-0 lg:right-0 lg:w-screen">
                <div class="inset-y-0 right-1/2 w-full rounded-r-3xl bg-gray-50 lg:right-72" />
                <IconDots class="w-[600px] opacity-5 saturate-0" />
              </div>
            </div>

            <div class="relative mx-auto px-8 py-3 sm:max-w-4xl sm:px-6 md:px-0 md:mx-0 md:py-0">
              <!-- Content area -->
              <div>
                <div class="flex w-full items-center justify-end">
                  <p :class="[
                    isUpcoming
                      ? 'tagStyle bg-yellow-100 text-yellow-800'
                      : 'tagStyle bg-green-100 text-green-800',
                  ]">
                    {{ isUpcoming ? "past" : "upcoming" }}
                  </p>
                </div>
                <h1 class="text-3xl font-extrabold font-mono tracking-tight text-gray-900 md:text-4xl lg:text-5xl">
                  {{ props.getCurrentEvent?.title }}
                </h1>
                <div v-if="props.getCurrentEvent.description" class="mt-6 space-y-6 text-gray-500">
                  <div class="text-md prose md:text-lg" v-html="props.getCurrentEvent.description" />
                </div>
                <div v-else class="text-md prose md:text-lg">
                  Please add a description.
                </div>
              </div>
              <!-- Stats section -->
              <div class="mt-10">
                <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-8">
                  <div v-if="props.getCurrentEvent.Date" class="border-t-2 border-gray-100 pt-6">
                    <dt class="text-base font-medium text-gray-500">Date</dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ new Date(props.getCurrentEvent.Date).toDateString() }}
                    </dd>
                  </div>
                  <div v-if="props.getCurrentEvent.Venue" class="border-t-2 border-gray-100 pt-4 md:pt-6">
                    <dt class="text-base font-medium text-gray-500">Venue</dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ props.getCurrentEvent.Venue }}
                    </dd>
                  </div>
                  <div v-if="props.getCurrentEvent.Time" class="border-t-2 border-gray-100 pt-4 md:pt-6">
                    <dt class="text-base font-medium text-gray-500">Time</dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ props.getCurrentEvent.Time }}
                    </dd>
                  </div>
                  <div v-if="props.getCurrentEvent.Location" class="border-t-2 border-gray-100 pt-4 md:pt-6">
                    <dt class="text-base font-medium text-gray-500">
                      Location
                    </dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ props.getCurrentEvent.Location }}
                    </dd>
                  </div>
                  <div v-if="props.getCurrentEvent.Attendees" class="border-t-2 border-gray-100 pt-6">
                    <dt class="text-base font-medium text-gray-500">
                      Seats Limit
                    </dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ props.getCurrentEvent.Attendees }}
                    </dd>
                  </div>

                  <div class="border-y-2 border-gray-100 pt-4 md:pt-6">
                    <dt class="text-base font-medium text-gray-500">Share</dt>
                    <div class="flex gap-8 py-4">
                      <button class="hover:text-[#4267B2]" @click="shareOnFacebook">
                        <icon-facebook class="w-10 md:w-12" />
                      </button>
                      <button class="hover:text-[#00acee]" @click="shareOnTwitter">
                        <icon-twitter class="w-10 md:w-12" />
                      </button>
                      <button class="hover:text-[#007db1]" @click="shareOnLinkedIn">
                        <icon-linkedin class="w-10 md:w-12" />
                      </button>
                    </div>
                    <dd class="flex justify-between rounded-md bg-gray-100 mt-2 px-2 py-1 lg:w-[450px]">
                      <input id="myInput"
                        class="text-md break-words bg-gray-100pr-2 tracking-tight bg-gray-100 text-gray-600 line-clamp-3 w-[500px]"
                        type="text" :value="`https://coders.mu/meetup/${props.routeId}/`" />
                      <div class="cursor-pointer" @click="copy">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                          <path
                            d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                      </div>
                    </dd>
                  </div>

                  <div v-if="!isUpcoming"
                    class="md:border-t-2 border-gray-100 pt-4 md:pt-8 flex flex-col justify-center items-center md:items-start gap-4">
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      <!-- <a

                        class="flex gap-4 w-96 md:w-48 lg:w-56 items-center justify-center md:justify-left rounded-md border border-transparent bg-yellow-500 px-8 py-3 text-base tracking-wide font-extrabold text-white drop-shadow-2xl hover:bg-yellow-600 md:py-2 md:px-4 md:text-lg italic"
                      >
                        <span>Book my seat</span>

                        <icon-arrow-right class="md:animate-bounce" />
                      </a> -->
                      <fec-anchor v-if="props.getCurrentEvent.rsvplink" :href="props.getCurrentEvent.rsvplink"
                        target="_blank">Book my seat</fec-anchor>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div class="lg:mx-auto lg:max-w-[1400px] px-4">
            <div v-if="props.getCurrentEvent.album" class="flex flex-col items-center gap-8 py-20">
              <!-- <pre>
                {{ currentAlbum }}
              </pre> -->

              <div class="w-full grid grid-cols-4 gap-4">
                <div v-for="photo in currentAlbum" :key="photo" class="rounded-md overflow-hidden aspect-video">
                  <img :src="getImageUrl(photo)" class="object-cover w-full h-full object-center block" />
                </div>
              </div>
              <div v-if="limit < maxAlbumLength"
                class="cursor-pointer hover:opacity-90 transition-all text-md block w-48 rounded-md bg-verse-600 px-4 py-4 text-center font-medium text-white md:w-64 md:px-8 md:text-xl"
                @click="viewMore()">
                View more
              </div>
            </div>
          </div>

          <!-- view-dashboard button -->
          <!-- <div
          class="dashboard-button text-md absolute top-48 right-[-4.5rem] rotate-90 rounded-b-lg bg-yellow-500 py-2 px-8 font-medium text-white hover:bg-yellow-400 md:py-4 md:text-lg"
          @click="open = true"
        >
          View meetups list
        </div> -->
          <!-- slide-over -->
          <!-- <SldeBarEvent :data="data" :open="open" /> -->
        </div>
        <!-- ends -->
      </div>
    </div>
  </div>
</template>
