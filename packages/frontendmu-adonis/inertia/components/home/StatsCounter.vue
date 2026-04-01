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
            // Pre-size element to its final width so layout doesn't shift as digit count grows
            const el = entry.target as HTMLElement
            el.textContent = `${finalNum}`
            el.style.width = `${el.offsetWidth}px`
            el.textContent = '0'

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
  <section class="relative py-16 overflow-hidden">
    <div class="contain relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-24">
        <div class="flex items-center gap-4">
          <span class="stat-num font-display text-7xl md:text-8xl lg:text-9xl tracking-tight text-gray-900 dark:text-white leading-none" :data-final-num="numOfSpeakers">0</span>
          <span class="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 leading-tight">speakers<br/>and counting</span>
        </div>

        <div class="hidden md:block w-px h-16 bg-gray-200 dark:bg-verse-800"></div>

        <div class="flex items-center gap-4">
          <span class="stat-num font-display text-7xl md:text-8xl lg:text-9xl tracking-tight text-gray-900 dark:text-white leading-none" :data-final-num="numOfMeetups">0</span>
          <span class="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 leading-tight">events<br/>since 2016</span>
        </div>

        <div class="hidden md:block w-px h-16 bg-gray-200 dark:bg-verse-800"></div>

        <div class="flex items-center gap-4">
          <span class="stat-num font-display text-7xl md:text-8xl lg:text-9xl tracking-tight text-gray-900 dark:text-white leading-none" :data-final-num="numOfContributors">0</span>
          <span class="text-sm md:text-base font-medium text-gray-600 dark:text-gray-300 leading-tight">open source<br/>contributors</span>
        </div>
      </div>
    </div>
  </section>
</template>
