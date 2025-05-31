<script setup lang="ts">
const benefits = [
  {
    title: 'Access to the Community',
    description: 'Reach a passionate, engaged audience of developers, designers, and tech professionals in Mauritius.',
    icon: 'carbon:group',
  },
  {
    title: 'Build up Goodwill',
    description: 'Show your commitment to the local tech ecosystem and foster positive brand association.',
    icon: 'carbon:growth',
  },
  {
    title: 'Recruitment Opportunities',
    description: 'Connect directly with potential hires who are active and motivated in the field.',
    icon: 'carbon:user-profile',
  },
  {
    title: 'Brand Visibility',
    description: 'Get your company\'s logo and message in front of dozens of attendees and hundreds online.',
    icon: 'carbon:star',
  },
  {
    title: 'Direct Feedback',
    description: 'Learn about the needs, interests, and challenges of the local tech community.',
    icon: 'carbon:chat',
  },
]
</script>

<template>
  <section class="w-full">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      <div
        v-for="benefit in benefits"
        :key="benefit.title"
        class="group relative overflow-hidden rounded-2xl bg-gradient-to-b from-white to-verse-50 dark:from-verse-800/90 dark:to-verse-800/50 p-6 backdrop-blur-sm border border-verse-100/10 dark:border-verse-700/10"
      >
        <div class="absolute inset-0 bg-gradient-to-b from-verse-500/5 to-transparent dark:from-verse-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
        
        <div class="relative space-y-4">
          <div class="inline-flex p-3 rounded-2xl bg-verse-100 dark:bg-verse-700/50 text-verse-500 dark:text-verse-300 group-hover:scale-110 group-hover:bg-verse-500 dark:group-hover:bg-verse-600 group-hover:text-white transition-all duration-500 ease-out">
            <Icon :name="benefit.icon" class="w-8 h-8" />
          </div>
          
          <div class="space-y-2">
            <h4 class="text-xl font-semibold text-verse-700 dark:text-verse-200 group-hover:text-verse-500 dark:group-hover:text-verse-300 transition-colors duration-300">
              {{ benefit.title }}
            </h4>
            <p class="text-verse-600 dark:text-verse-300 leading-relaxed">
              {{ benefit.description }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="relative rounded-3xl bg-gradient-to-br from-verse-500/10 to-verse-600/5 dark:from-verse-500/20 dark:to-verse-600/10 p-8 md:p-12 backdrop-blur-sm border border-verse-100/10 dark:border-verse-700/10 overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent)] pointer-events-none" />
      <p class="relative text-xl text-verse-700 dark:text-verse-200 max-w-3xl mx-auto text-center leading-relaxed">
        Sponsoring a meetup is more than marketing—it's about fostering innovation, building meaningful connections, and contributing to Mauritius' thriving tech ecosystem. Make a lasting impact on our community's future.
      </p>
    </div>
  </section>
</template>
