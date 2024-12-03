<script setup lang="ts">
import eventsResponse from '../../../frontendmu-data/data/meetups-raw.json'
import speakersResponse from '../../../frontendmu-data/data/speakers-raw.json'

const route = useRoute()
const { id } = route.params

function getSpeaker(id: string | string[]) {
  const speaker = speakersResponse.find((ev: { id: string }) => String(ev.id) === String(id))

  if (speaker === null) {
    console.error('cannot find speaker id: ', id)
  }

  // Get sessions of this speaker from the events
  const allSessions = eventsResponse.map((event: any) => event.sessions).flat()
  const speakerSession = allSessions.filter((session: any) => {
    const session_speaker_id = session.Session_id.speakers.id
    return id === session_speaker_id
  })

  return {
    person: speaker,
    sessions: speakerSession,
  }
}

const speaker = ref(getSpeaker(id))

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
      <SpeakerSingle :route-id="id" :speaker="speaker" />
    </template>
  </div>
</template>
