<script setup lang="ts">
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
        <SocialCard href="https://discord.gg/WxXW9Jvv6k" class="bg-[#5865f2] h-[240px]">
          <template #tagline>Discord</template>
          <template #description>Join the community, ask questions, livestream, chill!</template>
          <template #icon><IconDiscord class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard href="https://github.com/frontendmu" class="bg-[#181717] h-[240px] border border-white/5">
          <template #tagline>GitHub</template>
          <template #description>The home of FEC projects. Build, contribute, and explore.</template>
          <template #icon><IconGithub class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard href="https://chat.whatsapp.com/CqXAj6m8NtQB6NN8B9aoEJ" class="bg-[#25D366] h-[240px]">
          <template #tagline>Whatsapp</template>
          <template #description>Join our community to stay informed about our latest meetups.</template>
          <template #icon><IconWhatsapp class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard href="https://twitter.com/frontendmu" class="bg-[#1DA1F2] h-[240px]">
          <template #tagline>Twitter</template>
          <template #description>Short-form updates from us. Follow for announcements!</template>
          <template #icon><IconTwitter class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard href="https://instagram.com/frontend.mu" class="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] h-[240px]">
          <template #tagline>Instagram</template>
          <template #description>Visual highlights of our events and the people who make them special.</template>
          <template #icon><IconInstagram class="w-8 h-8" /></template>
        </SocialCard>

        <SocialCard href="https://www.linkedin.com/company/81846464/admin/" class="bg-[#0077b5] h-[240px]">
          <template #tagline>LinkedIn</template>
          <template #description>Professional networking for those who prefer formal updates.</template>
          <template #icon><IconLinkedin class="w-8 h-8" /></template>
        </SocialCard>
      </div>
    </div>
  </section>
</template>
