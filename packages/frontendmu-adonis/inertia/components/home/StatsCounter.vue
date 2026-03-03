<script setup lang="ts">
import { ref, onMounted } from 'vue'

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
        const finalNumStr = entry.target.getAttribute('data-final-num')
        if (finalNumStr !== null) {
          const finalNum = parseInt(finalNumStr, 10)

          if (finalNum > 0) {
            const duration = 2000 // 2 seconds total duration
            const frameDuration = 1000 / 60 // 60fps
            const totalFrames = Math.round(duration / frameDuration)
            let frame = 0

            const counter = setInterval(() => {
              frame++
              const progress = frame / totalFrames
              // Ease out expo
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
          observer.unobserve(entry.target)
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
  <section class="relative py-32 bg-verse-50 dark:bg-verse-900/10 overflow-hidden">
    <div class="contain relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 text-center">
        <!-- Speakers -->
        <div class="space-y-4">
          <div class="relative inline-block">
            <span class="stat-num text-7xl md:text-9xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfSpeakers">0</span>
            <span class="absolute -top-4 -right-8 text-4xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold uppercase tracking-widest text-verse-600 dark:text-verse-400">Speakers</h3>
          <p class="text-gray-500 dark:text-gray-400 font-medium max-w-[200px] mx-auto">Diverse voices sharing expert insights.</p>
        </div>

        <!-- Meetups -->
        <div class="space-y-4">
          <div class="relative inline-block">
            <span class="stat-num text-7xl md:text-9xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfMeetups">0</span>
            <span class="absolute -top-4 -right-8 text-4xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold uppercase tracking-widest text-verse-600 dark:text-verse-400">Events</h3>
          <p class="text-gray-500 dark:text-gray-400 font-medium max-w-[200px] mx-auto">Memorable sessions since 2016.</p>
        </div>

        <!-- Contributors -->
        <div class="space-y-4">
          <div class="relative inline-block">
            <span class="stat-num text-7xl md:text-9xl font-black tracking-tighter text-gray-900 dark:text-white leading-none" :data-final-num="numOfContributors">0</span>
            <span class="absolute -top-4 -right-8 text-4xl font-black text-verse-500">+</span>
          </div>
          <h3 class="text-xl md:text-2xl font-bold uppercase tracking-widest text-verse-600 dark:text-verse-400">Contributors</h3>
          <p class="text-gray-500 dark:text-gray-400 font-medium max-w-[200px] mx-auto">Passionate builders behind the scenes.</p>
        </div>
      </div>
    </div>
  </section>
</template>
