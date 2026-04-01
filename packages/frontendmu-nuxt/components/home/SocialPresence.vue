<script setup lang="ts">

</script>

<template>
  <div class="bg-verse-950 dark:bg-verse-800/80">
    <div
      class="max-w-6xl mx-auto py-24 grid gap-8 grid-rows-4 grid-cols-0 md:grid-cols-2 md:grid-rows-none px-8 md:px-16"
    >
      <HomeSocialCard href="https://discord.gg/WxXW9Jvv6k" class="bg-[#5865f2] text-sm md:text-normal">
        <template #tagline>
          <p>Discord</p>
        </template>
        <template #description>
          <p>
            Join the community, ask questions, livestream, chill!
          </p>
        </template>

        <template #icon>
          <IconDiscord class=" w-14 md:w-16" />
        </template>
      </HomeSocialCard>

      <HomeSocialCard href="https://github.com/frontendmu" class="bg-[#333] text-sm md:text-normal">
        <template #tagline>
          <p>GitHub</p>
        </template>
        <template #description>
          <p>The home of FEC projects</p>
        </template>

        <template #icon>
          <IconGithub class="w-12 md:w-16" />
        </template>
      </HomeSocialCard>

      <HomeSocialCard
        href="https://chat.whatsapp.com/CqXAj6m8NtQB6NN8B9aoEJ"
        class="bg-[#167335] text-sm md:text-normal"
      >
        <template #tagline>
          <p>Whatsapp Community</p>
        </template>
        <template #description>
          <p>
            Join this community to stay informed about our events
          </p>
        </template>

        <template #icon>
          <IconWhatsappCommunity class="w-14 md:w-16 p-2" />
        </template>
      </HomeSocialCard>

      <HomeSocialCard href="https://twitter.com/frontendmu" class="bg-[#0e6db5] text-sm md:text-normal">
        <template #tagline>
          <p>Twitter</p>
        </template>
        <template #description>
          <p>Short-form updates from us.</p>
        </template>

        <template #icon>
          <IconTwitter class="w-14 md:w-16 p-2" />
        </template>
      </HomeSocialCard>

      <HomeSocialCard href="https://instagram.com/frontend.mu" class="bg-[#d6249f] text-sm md:text-normal">
        <template #tagline>
          <p>Instagram</p>
        </template>
        <template #description>
          <p>Pictures of frontend coders.</p>
        </template>

        <template #icon>
          <IconInstagram class="w-14 md:w-16 p-2" />
        </template>
      </HomeSocialCard>

      <HomeSocialCard
        href="https://www.linkedin.com/company/81846464/admin/"
        class="bg-[#007db1] text-sm md:text-normal"
      >
        <template #tagline>
          <p>LinkedIn Page</p>
        </template>
        <template #description>
          <p>For those who don't use facebook and discord</p>
        </template>

        <template #icon>
          <IconLinkedin class="w-14 md:w-16" />
        </template>
      </HomeSocialCard>
    </div>
  </div>
</template>
