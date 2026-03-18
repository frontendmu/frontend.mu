<script setup lang="ts">
import { ref } from 'vue'
import speakersResponse from '../../../frontendmu-data/data/speakers-raw.json'
import { getGithubUrl, toSpeakerSlug } from '@/utils/helpers'

const featuredSpeakers = ref(
  speakersResponse.filter((speaker: { featured: boolean }) => speaker.featured),
)

const initialActiveSpeakerIndex = Math.floor(featuredSpeakers.value.length / 2)

const activeSpeakerId = ref<string>(
  featuredSpeakers.value[initialActiveSpeakerIndex].id,
)
</script>

<template>
  <div class="latest-events-wrapper">
    <div class="mx-auto px-4 pt-8 py-4 text-4xl tracking-tight sm:text-5xl md:py-8 md:text-5xl">
      <BaseHeading class="text-center">
        Featured Speakers
      </BaseHeading>
    </div>

    <div class="flex justify-center p-4">
      <ul id="team" role="list" class="mx-auto flex flex-wrap md:flex-nowrap justify-center gap-4">
        <li
          v-for="(person, index) in featuredSpeakers" :key="person.id" class="single-photo rounded-xl overflow-hidden relative group cursor-pointer" :class="[
            `index-${index}`,
            activeSpeakerId === person.id && 'active',
          ]"
          @click="activeSpeakerId = person.id"
        >
          <img
            class="mx-auto md:saturate-0 rounded-xl ease-in-out duration-300 md:h-[640px] h-[150px] w-[150px] md:w-[90px] object-cover object-center md:group-hover:w-[120px] group-hover:saturate-100 transition-all"
            :src="getGithubUrl(person.github_account || '')" :alt="person.name" :title="person.name" width="300"
            height="300"
          >

          <div
            class="speaker-details-background inset-0 space-y-2 absolute text-center top-0 left-0 flex flex-col justify-end"
          >
            <div class="p-2 md:p-10 speaker-details md:opacity-0 flex flex-col items-center md:gap-2">
              <p class="text-verse-200 text-xs md:text-2xl block cursor-text">
                @{{ person.github_account }}
              </p>
              <h3 class="text-verse-100 font-extrabold text-sm md:text-4xl block cursor-text">
                {{ person.name }}
              </h3>
              <NuxtLink
                :href="`/speaker/${toSpeakerSlug(person.name)}`"
                class="p-1 text-verse-500 md:text-white text-sm md:text-base hidden md:block bg-white/20 text-center rounded-md font-bold w-24"
              >
                List talks
              </NuxtLink>
            </div>
          </div>

          <div class="speaker-link hidden absolute bottom-0 right-0 p-2 md:p-10" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="postcss" scoped>
@media (min-width: 768px) {

  .single-photo.active:hover img,
  .single-photo.active img {
    @apply w-[545px] saturate-100 blur-0;
  }

  .single-photo.active .speaker-details {
    @apply delay-300 opacity-100 transition-opacity duration-300;
  }

  .single-photo.active .speaker-link {
    @apply block delay-300 opacity-100 transition-opacity duration-300;
  }
}

.single-photo .speaker-details-background {
  background: linear-gradient(to bottom,
      hsla(175, 100%, 38%, 0.284) 0%,
      hsla(216, 100%, 95%, 0) 70%,
      hsla(214, 22%, 15%, 0.9) 100%);
}

/* @media (max-width: 768px) {
    #team li:nth-child(1),
    li:nth-child(2),
    #team li:last-child {
        display: none;
    }
} */
</style>
