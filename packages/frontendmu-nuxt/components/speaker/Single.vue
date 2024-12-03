<script setup lang="ts">
import EventsList from './EventsList.vue'
import LogoSpiral from '@/components/misc/LogoSpiral.vue'
import { getGithubUrl } from '@/utils/helpers'
import ContentBlock from '@/components/misc/ContentBlock.vue'

const props = defineProps({
  speaker: {
    type: Object,
    required: true,
  },
})

const speaker_photo = getGithubUrl(props.speaker.person?.github_account)
</script>

<template>
  <div>
    <!-- <pre>
        <code>{{ JSON.stringify(props.speaker, null, 2) }}</code>
    </pre> -->

    <div :data-title="props.speaker.person?.name">
      <ContentBlock>
        <div class="flex md:flex-row justify-between flex-col-reverse">
          <div>
            <div>
              <div>
                <BaseHeading :level="1" weight="bold">
                  {{ props.speaker.person?.name }}
                </BaseHeading>
              </div>

              <EventsList :sessions="props.speaker.sessions" />
            </div>

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

          <div class="flex-grow relative">
            <div class="w-full flex justify-end">
              <img
                class="h-auto w-[80%] mx-auto md:mx-0 my-10 object-cover rounded-full lg:h-96 lg:w-96"
                :src="speaker_photo" :style="vTransitionName(props.speaker.person?.name, 'photo')"
                :alt="props.speaker.person?.name" :title="props.speaker.person?.name" width="300" height="300"
              >
              <div class="w-full h-full absolute top-0">
                <LogoSpiral class="w-full opacity-5 saturate-0" />
              </div>
            </div>
          </div>
        </div>
      </ContentBlock>
    </div>
  </div>
</template>
