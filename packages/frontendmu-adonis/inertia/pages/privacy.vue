<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Privacy">
    <meta
      head-key="description"
      name="description"
      content="How coders.mu handles your personal data — what we collect, why, and how to ask us to remove it."
    >
  </Head>
  <main class="relative min-h-screen pt-40 pb-24">
    <div class="contain relative z-10">
      <!-- Page Header -->
      <div class="max-w-3xl mb-20 space-y-4">
        <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Policy</p>
        <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-[0.9]">
          Privacy
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          We run coders.mu as a community project. We collect as little personal data as possible
          and never sell it. This page explains exactly what we keep and why.
        </p>
      </div>

      <!-- Content -->
      <div class="max-w-3xl space-y-16 prose prose-lg prose-gray dark:prose-invert">
        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">What we collect</h2>
          <p>
            When you sign in with Google we receive your name, email address, profile picture, and a
            stable Google account identifier. When you RSVP to a meetup, we record that RSVP against
            your account so we can manage attendance.
          </p>
          <p>
            We don't run third-party advertising or behavioural tracking on the site. We use
            standard server logs (IP, user agent, request path) for short-term debugging and abuse
            mitigation.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">How we use it</h2>
          <p>
            Your name and photo appear on attendee lists and (if you spoke at a meetup) on the
            relevant session page. Your email is only used to contact you about the meetup you
            RSVP'd to or, occasionally, about community announcements.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Who we share with</h2>
          <p>
            We don't share your data with third parties. The site is hosted on infrastructure we
            operate, with Cloudflare in front for DNS and CDN. Photos and assets live on Cloudflare
            R2. Sign-in is provided by Google OAuth.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Your data, your choice</h2>
          <p>
            You can ask us to delete your account, your RSVP history, or your speaker profile at any
            time by emailing
            <a href="mailto:hello@frontend.mu" class="text-verse-500 font-semibold no-underline hover:underline">hello@frontend.mu</a>.
            We'll remove your data within 30 days unless we're legally required to keep it.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Changes to this page</h2>
          <p>
            We'll update this page if our data practices change in any meaningful way. The current
            version is maintained at
            <a href="https://github.com/coders-mu/frontend.mu" class="text-verse-500 font-semibold no-underline hover:underline">github.com/coders-mu/frontend.mu</a>
            in the open.
          </p>
        </section>
      </div>
    </div>
  </main>
</template>
