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
  <section class="w-full space-y-8">
    <div class="text-center md:text-left">
      <h3 class="text-2xl font-bold text-verse-700 dark:text-verse-200 mb-4">
        Why should your company sponsor a Meetup?
      </h3>
      <p class="text-lg text-verse-600 dark:text-verse-300 max-w-2xl">
        Join us in fostering the growth of frontend development in Mauritius while gaining valuable benefits for your organization.
      </p>
    </div>

    <div class="grid gap-6 md:gap-8">
      <div
        v-for="benefit in benefits"
        :key="benefit.title"
        class="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-verse-800/50 shadow-sm hover:shadow-md transition-all duration-200 group"
      >
        <div class="p-2 flex items-center rounded-lg bg-verse-100 dark:bg-verse-700/50 text-verse-600 dark:text-verse-300 group-hover:scale-110 transition-transform duration-200">
          <Icon :name="benefit.icon" class="w-6 h-6" />
        </div>
        <div class="flex-grow">
          <h4 class="font-bold text-verse-700 dark:text-verse-200 mb-1 group-hover:text-verse-500 dark:group-hover:text-verse-300 transition-colors duration-200">
            {{ benefit.title }}
          </h4>
          <p class="text-verse-600 dark:text-verse-300 text-sm md:text-base">
            {{ benefit.description }}
          </p>
        </div>
      </div>
    </div>

    <p class="text-verse-600 dark:text-verse-300 text-lg max-w-2xl mx-auto md:mx-0 text-center md:text-left">
      Sponsoring a meetup is more than just marketing—it's about building relationships and contributing to the growth of Mauritius' vibrant tech scene. Whether you want to support knowledge sharing or simply give back, sponsoring a meetup is a great way to make an impact.
    </p>
  </section>
</template>
