<script setup lang="ts">
import eventsResponse from '../../../frontendmu-data/data/meetups-raw.json'
import speakersResponse from '../../../frontendmu-data/data/speakers-raw.json'
import speakersProfileResponse from '../../../frontendmu-data/data/speakers-profile.json'

import type { Speaker, SpeakerProfile, Sponsor } from '~/utils/types'

definePageMeta({
  middleware: [
    function (to, _) {
      const { id } = to.params
      const speaker = speakersResponse.find((ev: { id: string }) => String(ev.id) === String(id))

      if (!speaker) {
        return abortNavigation(
          createError({
            status: 404,
            message: `We could not find the speaker with ID: ${id}`,
          }),
        )
      }
    },
  ],
})

const route = useRoute()

function getSpeaker(id: string | string[]): { person: Speaker | undefined, sessions: Sponsor[] | undefined, profile: SpeakerProfile | undefined } {
  const speaker = speakersResponse.find((ev: { id: string }) => String(ev.id) === String(id))

  if (!speaker) {
    return {
      person: undefined,
      sessions: undefined,
      profile: undefined,
    }
  }

  // Get sessions of this speaker from the events
  const allSessions = eventsResponse.map((event: any) => event.sessions).flat()
  const speakerSession = allSessions.filter((session: any) => {
    const session_speaker_id = session.Session_id.speakers.id
    return id === session_speaker_id
  })

  const profile = speakersProfileResponse.find(profile => profile.id === speaker.id)

  return {
    person: speaker,
    sessions: speakerSession,
    profile,
  }
}

const speaker = ref(getSpeaker(route.params.id))

useHead({
  title: speaker.value.person ? speaker.value.person.name : '',
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: 'frontend.mu speaker profile',
    },
  ],
})

defineOgImageComponent('Speaker', {
  title: speaker.value.person ? speaker.value.person.name : '',
  username: speaker.value.person?.github_account,
})
</script>

<template>
  <div>
    <template v-if="speaker">
      <SpeakerSingle :speaker="speaker" />
    </template>
  </div>
</template>
