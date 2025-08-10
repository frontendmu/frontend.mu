<template>
  <ContentBlock>
    <BaseHeading :level="1">
      About us
    </BaseHeading>
    <div class="prose text-verse-600 dark:text-verse-300 pt-4 pb-16 text-center md:text-left">
      <p>
        {{ useAppConfig().description }}
      </p>

      <p>
        Do you want to know more? <a
          class="text-verse-600 dark:text-verse-300"
          href="/team#organizers"
        >
          Get in touch with the organisers
        </a>
      </p>
    </div>
  </ContentBlock>
</template>
