<script setup lang="ts">
import eventsResponse from '../../../frontendmu-data/data/meetups-raw.json'
import speakers from '../../../frontendmu-data/data/speakers-raw.json'
import contributors from '../../../frontendmu-data/data/contributors.json'

const numOfSpeakers = ref(speakers.length || 0)
const numOfMeetups = ref(eventsResponse.length || 0)
const numOfContributors = ref(contributors.length || 0)

function counterAnimation() {
  const onIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let startNum = 0
        const nullCheck = entry.target.getAttribute('data-final-num')
        if (nullCheck !== null) {
          const finalNum = +nullCheck
          // Rest of the code

          if (finalNum) {
            const duration = Math.floor(700 / finalNum)

            const counter = setInterval(() => {
              startNum += 1
              entry.target.textContent = `${startNum}`

              if (startNum === finalNum)
                clearInterval(counter)
              observer.unobserve(entry.target)
            }, duration)
          }
        }
      }
    })
  }

  const observor = new IntersectionObserver(onIntersect, { threshold: 0.5 })
  document
    .querySelectorAll('.stat-num')
    .forEach(statNum => observor.observe(statNum))
}

onMounted(counterAnimation)
</script>

<template>
  <div class="max-w-6xl mx-auto pt-14 px-8 md:px-16">
    <BaseHeading class="text-center">
      Our Numbers So Far
    </BaseHeading>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert">
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfSpeakers">
          0
        </p>
        <p class="text-2xl mt-0">
          Speakers
        </p>
      </div>
      <div class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert">
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfMeetups">
          0
        </p>
        <p class="text-2xl mt-0">
          Meetups
        </p>
      </div>
      <div class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert">
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfContributors">
          0
        </p>
        <p class="text-2xl mt-0">
          Contributors
        </p>
      </div>
    </div>
  </div>
</template>

<style>
.accent {
  background: linear-gradient(135deg,
      hsl(13, 100%, 45%) 10%,
      hsl(var(--brand-hue), 100%, 55%) 50%,
      hsl(13, 100%, 45%) 80%,
      hsl(var(--brand-hue), 100%, 55%) 90%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 400% 400%;
  animation: gradient-animation 12s ease infinite;
}
</style>
