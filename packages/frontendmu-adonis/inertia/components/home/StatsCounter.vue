<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseHeading from '~/components/base/BaseHeading.vue'

interface Props {
  stats: {
    meetups: number
    speakers: number
    contributors: number
  }
}

const props = defineProps<Props>()

const numOfSpeakers = ref(props.stats.speakers || 0)
const numOfMeetups = ref(props.stats.meetups || 0)
const numOfContributors = ref(props.stats.contributors || 0)

function counterAnimation() {
  const onIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let startNum = 0
        const nullCheck = entry.target.getAttribute('data-final-num')
        if (nullCheck !== null) {
          const finalNum = +nullCheck

          if (finalNum) {
            const duration = Math.floor(700 / finalNum)

            const counter = setInterval(() => {
              startNum += 1
              entry.target.textContent = `${startNum}`

              if (startNum === finalNum) clearInterval(counter)
              observer.unobserve(entry.target)
            }, duration)
          }
        }
      }
    })
  }

  const observer = new IntersectionObserver(onIntersect, { threshold: 0.5 })
  document.querySelectorAll('.stat-num').forEach((statNum) => observer.observe(statNum))
}

onMounted(counterAnimation)
</script>

<template>
  <div class="max-w-6xl mx-auto pt-14 px-8 md:px-16 py-16">
    <BaseHeading class="text-center"> Our Numbers So Far </BaseHeading>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
      <div
        class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert"
      >
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfSpeakers">0</p>
        <p class="text-2xl mt-0 text-verse-700 dark:text-verse-300">Speakers</p>
      </div>
      <div
        class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert"
      >
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfMeetups">0</p>
        <p class="text-2xl mt-0 text-verse-700 dark:text-verse-300">Meetups</p>
      </div>
      <div
        class="h-full flex justify-between items-center flex-col gap-4 p-6 prose dark:prose-invert"
      >
        <p class="font-bold text-8xl mb-0 accent stat-num" :data-final-num="numOfContributors">0</p>
        <p class="text-2xl mt-0 text-verse-700 dark:text-verse-300">Contributors</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.accent {
  background: linear-gradient(
    135deg,
    hsl(13, 100%, 52%) 10%,
    hsl(175, 100%, 38%) 50%,
    hsl(13, 100%, 52%) 80%,
    hsl(175, 100%, 38%) 90%
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  background-size: 400% 400%;
  animation: gradient-animation 12s ease infinite;
}

@keyframes gradient-animation {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
