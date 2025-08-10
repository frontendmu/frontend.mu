<template>
  <section class="w-full flex flex-col gap-8">
    <BaseHeading id="sponsor-cta" :level="2">
      Want to sponsor a meetup?
    </BaseHeading>

    <div class="grid grid-cols-3 gap-8">
      <div class="space-y-8">
        <BaseHeading :level="3">
          Get in touch
        </BaseHeading>
        <ol class="relative border-s border-verse-400 dark:border-verse-700 ml-4 mb-8">
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">1</span>
            <span class="">Reach out to the organizers. <br> Email / LinkedIn</span>
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">2</span>
            We will be happy to answer your questions and explain how we run meetups.
          </li>
          <!-- <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">3</span>
            How can we help increase visibility of your company through meetups
          </li> -->
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">4</span>
            Finalize date and location
          </li>
        </ol>
      </div>

      <div class="space-y-8">
        <BaseHeading :level="3">
          We spread the word
        </BaseHeading>
        <ol class="relative border-s border-verse-400 dark:border-verse-700 ml-4 mb-8">
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">5</span>
            We advertise the meetup on our social platforms
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">6</span>
            We handle attendees RSVP
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">7</span>
            We contact speakers for the meetup and help them prepare
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">8</span>
            We share RSVP headcount and food preferences details with sponsor. <span class="italic">No private information of attendees is shared.</span>
          </li>
        </ol>
      </div>

      <div class="space-y-8">
        <BaseHeading :level="3">
          Event day
        </BaseHeading>
        <ol class="relative border-s border-verse-400 dark:border-verse-700 ml-4 mb-8">
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">9</span>
            We will be there to help you
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">10</span>
            Dedicated sponsored segment at the start of the meetup
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">11</span>
            2 sessions followed by lunch break
          </li>
          <li class="mb-8 ms-6">
            <span class="absolute -start-3 flex items-center justify-center w-6 h-6 bg-verse-600 dark:bg-verse-400 rounded-full ring-8 ring-white dark:ring-verse-900 text-white font-bold">12</span>
            Photoshoot, last sessions and networking
          </li>
        </ol>
      </div>
    </div>
  </section>
</template>
