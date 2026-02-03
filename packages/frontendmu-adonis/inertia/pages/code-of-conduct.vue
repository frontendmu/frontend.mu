<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import DefaultLayout from '~/layouts/DefaultLayout.vue'
import ContentBlock from '~/components/shared/ContentBlock.vue'
import BaseHeading from '~/components/base/BaseHeading.vue'
</script>

<template>
  <Head title="Code of Conduct" />
  <DefaultLayout>
    <ContentBlock>
      <div class="py-8 pb-20 prose dark:prose-invert max-w-none">
        <BaseHeading :level="1" class="mb-6">Code of Conduct</BaseHeading>

        <BaseHeading :level="2" class="mb-4 mt-8">Our Pledge</BaseHeading>
        <p class="mb-6">
          We as members, contributors, and leaders pledge to make participation in the Frontend.mu community a harassment-free experience for everyone.
        </p>

        <BaseHeading :level="2" class="mb-4 mt-8">Our Standards</BaseHeading>
        <p class="mb-4">
          Examples of behavior that contributes to a positive environment for our community include:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li>Demonstrating empathy and kindness toward other people</li>
          <li>Being respectful of differing opinions, viewpoints, and experiences</li>
          <li>Giving and gracefully accepting constructive feedback</li>
          <li>Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience</li>
          <li>Focusing on what is best not just for us as individuals, but for the overall community</li>
        </ul>
        <p class="mb-4">
          Examples of unacceptable behavior include:
        </p>
        <ul class="list-disc pl-6 mb-6">
          <li>The use of sexualized language or imagery, and sexual attention or advances of any kind</li>
          <li>Trolling, insulting or derogatory comments, and personal or political attacks</li>
          <li>Public or private harassment</li>
          <li>Publishing others' private information, such as a physical or email address, without their explicit permission</li>
          <li>Other conduct which could reasonably be considered inappropriate in a professional setting</li>
        </ul>

        <BaseHeading :level="2" class="mb-4 mt-8">Enforcement Responsibilities</BaseHeading>
        <p class="mb-6">
          Community leaders are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.
        </p>
        <p class="mb-6">
          Community leaders have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned with this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.
        </p>

        <BaseHeading :level="2" class="mb-4 mt-8">Scope</BaseHeading>
        <p class="mb-6">
          This Code of Conduct applies within all community spaces, and it also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.
        </p>

        <BaseHeading :level="2" class="mb-4 mt-8">Enforcement</BaseHeading>
        <p class="mb-6">
          Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the community leaders responsible for enforcement at <a href="mailto:info@frontend.mu" class="text-primary-500 hover:underline">info@frontend.mu</a>. All complaints will be reviewed and investigated promptly and fairly.
        </p>
        <p class="mb-6">
          All community leaders are obligated to respect the privacy and security of the reporter of any incident.
        </p>

        <BaseHeading :level="2" class="mb-4 mt-8">Enforcement Guidelines</BaseHeading>
        <p class="mb-6">
          Community leaders will follow these Community Impact Guidelines in determining the consequences for any action they deem in violation of this Code of Conduct:
        </p>

        <BaseHeading :level="3" class="mb-4 mt-6">1. Correction</BaseHeading>
        <p class="mb-2"><strong>Community Impact</strong>: Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.</p>
        <p class="mb-6"><strong>Consequence</strong>: A private, written warning from community leaders, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate. A public apology may be requested.</p>

        <BaseHeading :level="3" class="mb-4 mt-6">2. Warning</BaseHeading>
        <p class="mb-2"><strong>Community Impact</strong>: A violation through a single incident or series of actions.</p>
        <p class="mb-6"><strong>Consequence</strong>: A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time. This includes avoiding interactions in community spaces as well as external channels like social media. Violating these terms may lead to a temporary or permanent ban.</p>

        <BaseHeading :level="3" class="mb-4 mt-6">3. Temporary Ban</BaseHeading>
        <p class="mb-2"><strong>Community Impact</strong>: A serious violation of community standards, including sustained inappropriate behavior.</p>
        <p class="mb-6"><strong>Consequence</strong>: A temporary ban from any sort of interaction or public communication with the community for a specified period of time. No public or private interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, is allowed during this period. Violating these terms may lead to a permanent ban.</p>

        <BaseHeading :level="3" class="mb-4 mt-6">4. Permanent Ban</BaseHeading>
        <p class="mb-2"><strong>Community Impact</strong>: Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.</p>
        <p class="mb-6"><strong>Consequence</strong>: A permanent ban from any sort of public interaction within the community.</p>

        <BaseHeading :level="2" class="mb-4 mt-8">Attribution</BaseHeading>
        <p class="mb-4">
          This Code of Conduct is adapted from the <a href="https://www.contributor-covenant.org" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">Contributor Covenant</a>, version 2.1, available at <a href="https://www.contributor-covenant.org/version/2/1/code_of_conduct.html" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">https://www.contributor-covenant.org/version/2/1/code_of_conduct.html</a>.
        </p>
        <p class="mb-4">
          Community Impact Guidelines were inspired by <a href="https://github.com/mozilla/diversity" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">Mozilla's code of conduct enforcement ladder</a>.
        </p>
        <p class="mb-6">
          For answers to common questions about this code of conduct, see the FAQ at <a href="https://www.contributor-covenant.org/faq" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">https://www.contributor-covenant.org/faq</a>. Translations are available at <a href="https://www.contributor-covenant.org/translations" target="_blank" rel="noopener noreferrer" class="text-primary-500 hover:underline">https://www.contributor-covenant.org/translations</a>.
        </p>
      </div>
    </ContentBlock>
  </DefaultLayout>
</template>
