<script setup lang="ts">
import eventsResponse from '../../../frontendmu-data/data/meetups-raw.json'
import type { DirectusEvent } from '@/utils/types'

const route = useRoute()
const routeId = computed(() => route.params.id as string)

function getEvent(id: string | number) {
  const event = eventsResponse.find(ev => ev.id === Number(id))

  if (event === null) {
    console.error('cannot find event id: ', id)
  }

  return event as DirectusEvent
};

const meetup = computed(() => {
  return getEvent(routeId.value) ?? {
    title: 'Event not found',
    description: 'Event not found',
  }
})

useHead({
  title: meetup.value.title,
  meta: [
    {
      hid: 'description',
      name: 'description',
      content: meetup.value.description,
    },
  ],
})

defineOgImageComponent('Event', {
  title: meetup.value.title,
  description: meetup.value.description,
})

const { register, cleanup } = useWebMCPMeetupDetail(meetup)
onMounted(() => register())
onUnmounted(() => cleanup())
</script>

<template>
  <MeetupSingle :key="routeId" :route-id="routeId" :get-current-event="meetup" />
</template>
