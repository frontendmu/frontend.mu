<script setup lang="ts">
import {
  DISCORD_URL,
  GITHUB_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TWITTER_URL,
  WHATSAPP_URL,
} from '~/constants'
import SocialCard from '~/components/home/SocialCard.vue'
import IconDiscord from '~/components/icons/IconDiscord.vue'
import IconGithub from '~/components/icons/IconGithub.vue'
import IconWhatsapp from '~/components/icons/IconWhatsapp.vue'
import IconTwitter from '~/components/icons/IconTwitter.vue'
import IconInstagram from '~/components/icons/IconInstagram.vue'
import IconLinkedin from '~/components/icons/IconLinkedin.vue'
</script>

<template>
  <section class="relative py-20 overflow-hidden bg-white dark:bg-verse-950">
    <div class="contain relative z-10">
      <div class="mb-12">
        <h2 class="text-3xl md:text-4xl font-display tracking-tight text-gray-900 dark:text-white">
          Stay connected
        </h2>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <SocialCard :href="DISCORD_URL" class="bg-[#5865f2] h-[240px]">
          <template #tagline>Discord</template>
          <template #description>Join the community, ask questions, livestream, chill!</template>
          <template #icon><IconDiscord class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard :href="GITHUB_URL" class="bg-[#181717] h-[240px] border border-white/5">
          <template #tagline>GitHub</template>
          <template #description>The home of FEC projects. Build, contribute, and explore.</template>
          <template #icon><IconGithub class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard :href="WHATSAPP_URL" class="bg-[#167335] h-[240px]">
          <template #tagline>Whatsapp</template>
          <template #description>Join our community to stay informed about our latest meetups.</template>
          <template #icon><IconWhatsapp class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard :href="TWITTER_URL" class="bg-[#0e6db5] h-[240px]">
          <template #tagline>Twitter</template>
          <template #description>Short-form updates from us. Follow for announcements!</template>
          <template #icon><IconTwitter class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard :href="INSTAGRAM_URL" class="bg-gradient-to-br from-[#833ab4] via-[#c13584] to-[#e1306c] h-[240px]">
          <template #tagline>Instagram</template>
          <template #description>Visual highlights of our events and the people who make them special.</template>
          <template #icon><IconInstagram class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard :href="LINKEDIN_URL" class="bg-[#0077b5] h-[240px]">
          <template #tagline>LinkedIn</template>
          <template #description>Professional networking for those who prefer formal updates.</template>
          <template #icon><IconLinkedin class="w-8 h-8" /></template>
        </SocialCard>
      </div>
    </div>
  </section>
</template>
