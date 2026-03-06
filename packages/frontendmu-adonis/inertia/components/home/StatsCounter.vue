<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

let observer: IntersectionObserver | null = null

function counterAnimation() {
  const onIntersect = (entries: IntersectionObserverEntry[], obs: IntersectionObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const finalNumStr = entry.target.getAttribute('data-final-num')
        if (finalNumStr !== null) {
          const finalNum = parseInt(finalNumStr, 10)

          if (finalNum > 0) {
            const duration = 2000
            const frameDuration = 1000 / 60
            const totalFrames = Math.round(duration / frameDuration)
            let frame = 0

            const counter = setInterval(() => {
              frame++
              const progress = frame / totalFrames
              const currentNum = Math.round(finalNum * (progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)))

              entry.target.textContent = `${currentNum}`

              if (frame === totalFrames) {
                entry.target.textContent = `${finalNum}`
                clearInterval(counter)
              }
            }, frameDuration)
          } else {
            entry.target.textContent = '0'
          }
          obs.unobserve(entry.target)
        }
      }
    })
  }

  observer = new IntersectionObserver(onIntersect, { threshold: 0.5 })
  document.querySelectorAll('.stat-num').forEach((statNum) => observer!.observe(statNum))
}

onMounted(counterAnimation)
onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="relative py-24 bg-verse-50 dark:bg-verse-900/10 overflow-hidden">
    <div class="contain relative z-10 max-w-5xl">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
        <!-- Speakers -->
        <div class="space-y-2">
          <div class="relative inline-block">
            <span class="stat-num text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfSpeakers">0</span>
            <span class="absolute -top-2 -right-6 text-2xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-verse-600 dark:text-verse-400">Speakers</h3>
        </div>

        <!-- Meetups -->
        <div class="space-y-2">
          <div class="relative inline-block">
            <span class="stat-num text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfMeetups">0</span>
            <span class="absolute -top-2 -right-6 text-2xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-verse-600 dark:text-verse-400">Events</h3>
        </div>

        <!-- Contributors -->
        <div class="space-y-2">
          <div class="relative inline-block">
            <span class="stat-num text-6xl md:text-8xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfContributors">0</span>
            <span class="absolute -top-2 -right-6 text-2xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-verse-600 dark:text-verse-400">Contributors</h3>
        </div>
      </div>
    </div>
  </section>
</template>
