<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import SocialCard from '~/components/home/SocialCard.vue'
import IconDiscord from '~/components/icons/IconDiscord.vue'
import IconGithub from '~/components/icons/IconGithub.vue'
import IconWhatsapp from '~/components/icons/IconWhatsapp.vue'
import IconTwitter from '~/components/icons/IconTwitter.vue'
import IconInstagram from '~/components/icons/IconInstagram.vue'
import IconLinkedin from '~/components/icons/IconLinkedin.vue'
import {
  DISCORD_URL,
  GITHUB_URL,
  WHATSAPP_URL,
  TWITTER_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
} from '~/constants'
</script>

<template>
  <Head title="Community" />
  <main class="relative min-h-screen pt-40 pb-32">
      <div class="contain relative z-10 max-w-5xl">
        <!-- Page Header -->
        <div class="mb-20 space-y-4">
          <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Join us</p>

          <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-none">
            Get <span class="font-display-italic text-verse-600 dark:text-verse-400">Connected</span>
          </h1>
          
          <p class="text-base text-gray-500 dark:text-gray-400 font-medium max-w-xl leading-relaxed">
            Join our discussion channels, follow our projects, and stay updated.
          </p>
        </div>

        <!-- Social Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SocialCard :href="DISCORD_URL" class="bg-[#5865f2] h-[220px] shadow-lg shadow-[#5865f2]/10">
            <template #tagline>Discord</template>
            <template #description>Real-time talk, technical support, and community hangouts.</template>
            <template #icon><IconDiscord class="w-10 h-10" /></template>
          </SocialCard>

          <SocialCard :href="GITHUB_URL" class="bg-[#181717] h-[220px] shadow-lg shadow-black/10 border border-white/5">
            <template #tagline>GitHub</template>
            <template #description>Open source core. Contribute to the site, tools, and experiments.</template>
            <template #icon><IconGithub class="w-10 h-10" /></template>
          </SocialCard>

          <SocialCard :href="WHATSAPP_URL" class="bg-[#25D366] h-[220px] shadow-lg shadow-[#25D366]/10">
            <template #tagline>Whatsapp</template>
            <template #description>Instant updates and casual networking on the go.</template>
            <template #icon><IconWhatsapp class="w-10 h-10" /></template>
          </SocialCard>

          <SocialCard :href="TWITTER_URL" class="bg-[#1DA1F2] h-[220px] shadow-lg shadow-[#1DA1F2]/10">
            <template #tagline>Twitter</template>
            <template #description>Quick announcements, tech news, and community highlights.</template>
            <template #icon><IconTwitter class="w-10 h-10" /></template>
          </SocialCard>

          <SocialCard :href="INSTAGRAM_URL" class="bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] h-[220px] shadow-lg shadow-[#fd1d1d]/10">
            <template #tagline>Instagram</template>
            <template #description>Visual highlights of meetups and the people behind the code.</template>
            <template #icon><IconInstagram class="w-10 h-10" /></template>
          </SocialCard>

          <SocialCard :href="LINKEDIN_URL" class="bg-[#0077b5] h-[220px] shadow-lg shadow-[#0077b5]/10">
            <template #tagline>LinkedIn</template>
            <template #description>Professional networking and official industry-facing updates.</template>
            <template #icon><IconLinkedin class="w-10 h-10" /></template>
          </SocialCard>
        </div>
      </div>
    </main>
</template>
