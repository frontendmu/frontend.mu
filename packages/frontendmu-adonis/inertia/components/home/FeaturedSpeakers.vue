<script setup lang="ts">
import { ref, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Speaker {
  id: string
  name: string
  github_account: string | null
  featured: boolean
  bio?: string | null
}

interface Props {
  speakers: Speaker[]
}

const props = defineProps<Props>()

const initialActiveSpeakerIndex = computed(() => Math.floor(props.speakers.length / 2))

const activeSpeakerId = ref<string>(props.speakers[initialActiveSpeakerIndex.value]?.id || '')

function getGithubUrl(username: string | null): string {
  if (!username) return '/placeholder-avatar.png'
  return `https://avatars.githubusercontent.com/${username}`
}
</script>

<template>
  <div v-if="speakers.length > 0" class="latest-events-wrapper py-16">
    <div class="mx-auto px-4 pt-8 py-4 text-4xl tracking-tight sm:text-5xl md:py-8 md:text-5xl">
      <BaseHeading class="text-center"> Featured Speakers </BaseHeading>
    </div>

    <div class="flex justify-center p-4">
      <ul id="team" role="list" class="mx-auto flex flex-wrap md:flex-nowrap justify-center gap-4">
        <li
          v-for="(person, index) in speakers"
          :key="person.id"
          class="single-photo rounded-xl overflow-hidden relative group cursor-pointer"
          :class="[`index-${index}`, activeSpeakerId === person.id && 'active']"
          @click="activeSpeakerId = person.id"
        >
          <img
            class="mx-auto md:saturate-0 rounded-xl ease-in-out duration-300 md:h-[640px] h-[150px] w-[150px] md:w-[90px] object-cover object-center md:group-hover:w-[120px] group-hover:saturate-100 transition-all"
            :src="getGithubUrl(person.github_account)"
            :alt="person.name"
            :title="person.name"
            width="300"
            height="300"
          />

          <div
            class="speaker-details-background inset-0 space-y-2 absolute text-center top-0 left-0 flex flex-col justify-end"
          >
            <div
              class="p-2 md:p-10 speaker-details md:opacity-0 flex flex-col items-center md:gap-2"
            >
              <p class="text-verse-200 text-xs md:text-2xl block cursor-text">
                @{{ person.github_account }}
              </p>
              <h3 class="text-verse-100 font-extrabold text-sm md:text-4xl block cursor-text">
                {{ person.name }}
              </h3>
              <Link
                :href="`/speaker/${person.id}`"
                class="p-1 text-verse-500 md:text-white text-sm md:text-base hidden md:block bg-white/20 text-center rounded-md font-bold w-24"
              >
                List talks
              </Link>
            </div>
          </div>

          <div class="speaker-link hidden absolute bottom-0 right-0 p-2 md:p-10" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 768px) {
  .single-photo.active:hover img,
  .single-photo.active img {
    width: 545px;
    filter: saturate(1) blur(0px);
  }

  .single-photo.active .speaker-details {
    opacity: 1;
    transition: opacity 300ms;
    transition-delay: 300ms;
  }

  .single-photo.active .speaker-link {
    display: block;
    opacity: 1;
    transition: opacity 300ms;
    transition-delay: 300ms;
  }
}

.single-photo .speaker-details-background {
  background: linear-gradient(
    to bottom,
    hsla(175, 100%, 38%, 0.284) 0%,
    hsla(216, 100%, 95%, 0) 70%,
    hsla(214, 22%, 15%, 0.9) 100%
  );
}
</style>
