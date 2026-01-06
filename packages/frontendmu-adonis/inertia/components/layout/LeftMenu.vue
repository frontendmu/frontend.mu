<script setup lang="ts">
import {
  DISCORD_URL,
  GITHUB_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TWITTER_URL,
  WHATSAPP_URL,
} from '~/constants'
import IconDiscord from '~/components/icons/IconDiscord.vue'
import IconGithub from '~/components/icons/IconGithub.vue'
import IconWhatsapp from '~/components/icons/IconWhatsapp.vue'
import IconTwitter from '~/components/icons/IconTwitter.vue'
import IconInstagram from '~/components/icons/IconInstagram.vue'
import IconLinkedin from '~/components/icons/IconLinkedin.vue'

const socialLinks = {
  discord: DISCORD_URL,
  github: GITHUB_URL,
  whatsapp: WHATSAPP_URL,
  twitter: TWITTER_URL,
  instagram: INSTAGRAM_URL,
  linkedin: LINKEDIN_URL,
}
</script>

<template>
  <div class="hidden md:block fixed left-5 top-1/2 -translate-y-1/2 z-20">
    <ul class="flex flex-col gap-4">
      <li>
        <a
          :href="socialLinks.discord"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="Discord"
        >
          <IconDiscord class="w-5 h-5" />
        </a>
      </li>
      <li>
        <a
          :href="socialLinks.github"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="GitHub"
        >
          <IconGithub class="w-5 h-5" />
        </a>
      </li>
      <li>
        <a
          :href="socialLinks.whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="WhatsApp"
        >
          <IconWhatsapp class="w-5 h-5" />
        </a>
      </li>
      <li>
        <a
          :href="socialLinks.twitter"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="Twitter"
        >
          <IconTwitter class="w-5 h-5" />
        </a>
      </li>
      <li>
        <a
          :href="socialLinks.instagram"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="Instagram"
        >
          <IconInstagram class="w-5 h-5" />
        </a>
      </li>
      <li>
        <a
          :href="socialLinks.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="text-verse-500 hover:text-verse-700 dark:text-verse-300 dark:hover:text-verse-100 transition-colors"
          title="LinkedIn"
        >
          <IconLinkedin class="w-5 h-5" />
        </a>
      </li>
    </ul>
  </div>
</template>
