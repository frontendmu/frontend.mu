<script setup lang="ts">
import EventsList from './EventsList.vue'
import LogoSpiral from '@/components/misc/LogoSpiral.vue'
import { getGithubUrl } from '@/utils/helpers'
import ContentBlock from '@/components/misc/ContentBlock.vue'

import type { SpeakerProfileWithSessions } from '~/utils/types'

interface SpeakerSingleProps {
  speaker: SpeakerProfileWithSessions
}

const props = defineProps<SpeakerSingleProps>()

const person = computed(() => props.speaker.person)
const sessions = computed(() => props.speaker.sessions)

const profile = computed(() => props.speaker.profile)
const hasProfileBio = computed(() => profile.value.bio !== '')
const hasProfileLocation = computed(() => profile.value.location !== '')
const hasProfileWebsite = computed(() => profile.value.website !== '')
const hasProfileGithub = computed(() => profile.value.github !== '')
const hasProfileTwitter = computed(() => profile.value.twitter !== '')

const speaker_photo = getGithubUrl(person.value.github_account)
</script>

<template>
  <div>
    <div :data-title="person.name">
      <ContentBlock>
        <div class="flex flex-col-reverse md:flex-row justify-start gap-6">
          <div class="flex-grow">
            <!-- Content area -->
            <div>
              <div class="hidden md:block">
                <BaseHeading :level="1" weight="bold">
                  {{ person.name }}
                </BaseHeading>
              </div>

              <EventsList :sessions="sessions" />
            </div>

            <!-- Stats section -->
            <div class="mt-10">
              <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 md:gap-y-8">
                <template v-if="props.speaker.Date">
                  <div class="border-t-2 border-gray-100 pt-6">
                    <dt class="text-base font-medium text-verse-500">
                      Date
                    </dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ new Date(props.speaker.Date).toDateString() }}
                    </dd>
                  </div>
                </template>
                <template v-if="props.speaker.Venue">
                  <div class="border-t-2 border-gray-100 pt-4 md:pt-6">
                    <dt class="text-base font-medium text-verse-500">
                      Venue
                    </dt>
                    <dd class="text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">
                      {{ props.speaker.Venue }}
                    </dd>
                  </div>
                </template>
              </dl>
            </div>
          </div>

          <div class="flex-grow relative w-full lg:max-w-[32.375rem]">
            <div class="flex flex-col justify-start items-end w-full ">
              <img
                class="h-auto w-[80%] mx-auto md:mx-0 my-10 object-cover rounded-full lg:h-96 lg:w-96"
                :src="speaker_photo" :style="vTransitionName(person.name, 'photo')"
                :alt="person.name" :title="person.name" width="300" height="300"
              >

              <div
                v-if="profile"
                class="grid gap-4 w-full p-4 border-2 border-verse-400 rounded-xl z-20 text-verse-600 dark:text-verse-300"
              >
                <BaseHeading
                  class="md:hidden"
                  :level="1"
                  weight="bold"
                >
                  {{ person.name }}
                </BaseHeading>

                <p v-if="hasProfileBio">
                  {{ profile.bio }}
                </p>

                <nav class="grid gap-2 *:flex *:justify-start *:items-center *:gap-2">
                  <span v-if="hasProfileLocation">
                    <Icon name="lucide:map-pin" mode="svg" class="size-6" />{{ profile.location }}
                  </span>

                  <NuxtLink
                    v-if="hasProfileWebsite"
                    :to="profile.website"
                    target="_blank"
                  >
                    <Icon name="lucide:link" mode="svg" class="size-6" />{{ profile.website }}
                  </NuxtLink>

                  <NuxtLink
                    v-if="hasProfileGithub"
                    :to="`https://github.com/${profile.github}`"
                    target="_blank"
                  >
                    <Icon name="lucide:github" mode="svg" class="size-6" />{{ profile.github }}
                  </NuxtLink>

                  <NuxtLink
                    v-if="hasProfileTwitter"
                    :to="`https://twitter.com/${profile.twitter}`"
                    target="_blank"
                  >
                    <Icon name="ri:twitter-x-fill" mode="svg" class="size-6" />{{ profile.twitter }}
                  </NuxtLink>
                </nav>
              </div>

              <div class="w-full h-full absolute top-0 z-10">
                <LogoSpiral class="w-full opacity-5 saturate-0" />
              </div>
            </div>
          </div>
        </div>
      </ContentBlock>
    </div>
  </div>
</template>
