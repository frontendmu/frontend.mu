<script setup lang="ts">
defineProps({
  email: {
    type: String,
    default: 'sandeep@ramgolam.com',
  },
  title: {
    type: String,
    default: 'Ready to make an impact?',
  },
  subtitle: {
    type: String,
    default: 'Join us in fostering the growth of frontend development in Mauritius',
  },
  buttonText: {
    type: String,
    default: 'Get in touch to sponsor a meetup',
  },
  helpText: {
    type: String,
    default: 'Want more details about sponsorship packages, requirements, or past events? Contact us and we\'ll be happy to help!',
  },
})
</script>

<template>
  <div class="text-center py-12 md:py-16 px-4 md:px-8 bg-verse-50 dark:bg-verse-900/50 rounded-2xl max-w-4xl mx-auto w-full">
    <h3 class="text-2xl font-bold text-verse-700 dark:text-verse-200 mb-4">
      {{ title }}
    </h3>
    <p class="text-lg text-verse-600 dark:text-verse-300 mb-8 max-w-xl mx-auto">
      {{ subtitle }}
    </p>
    <a
      :href="`mailto:${email}`"
      class="inline-block bg-verse-600 dark:bg-verse-400 text-white px-8 py-4 rounded-full hover:bg-verse-700 dark:hover:bg-verse-500 hover:scale-[105%] transition-all duration-200 text-lg font-semibold w-full md:w-auto shadow-lg hover:shadow-xl"
    >
      {{ buttonText }}
    </a>
    <p class="text-sm text-verse-500 dark:text-verse-400 mt-6">
      {{ helpText }}
    </p>
  </div>
</template>
