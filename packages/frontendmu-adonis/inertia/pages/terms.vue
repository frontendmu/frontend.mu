<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
</script>

<template>
  <Head title="Terms">
    <meta
      head-key="description"
      name="description"
      content="The rules of the road for using coders.mu — what we expect of you, what you can expect of us."
    >
  </Head>
  <main class="relative min-h-screen pt-40 pb-24">
    <div class="contain relative z-10">
      <!-- Page Header -->
      <div class="max-w-3xl mb-20 space-y-4">
        <p class="text-sm font-medium text-gray-400 dark:text-gray-500">Policy</p>
        <h1 class="text-5xl md:text-6xl font-display tracking-tight dark:text-white leading-[0.9]">
          Terms of use
        </h1>
        <p class="text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
          coders.mu is a community-run site. By using it you agree to a few simple rules.
        </p>
      </div>

      <!-- Content -->
      <div class="max-w-3xl space-y-16 prose prose-lg prose-gray dark:prose-invert">
        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Be civil</h2>
          <p>
            Everything you do on the site — RSVPing, speaking at meetups, contributing to the open
            source repo — falls under our
            <a href="/code-of-conduct" class="text-verse-500 font-semibold no-underline hover:underline">Code of Conduct</a>.
            Harassment, hate speech, or repeated bad-faith behaviour gets your account removed.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Your account</h2>
          <p>
            You're responsible for the actions taken under your account. Sign in only with your own
            Google account, and let us know if you suspect your account has been compromised.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Content</h2>
          <p>
            Talks, slides, and session notes contributed by speakers remain the property of their
            authors. By submitting content (a talk proposal, a meetup write-up, a profile photo) you
            grant us a non-exclusive, royalty-free licence to display it on the site and in
            community communications.
          </p>
          <p>
            The site code itself is open source — see the
            <a href="https://github.com/coders-mu/frontend.mu" class="text-verse-500 font-semibold no-underline hover:underline">repository</a>
            for the licence.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">No commercial spam</h2>
          <p>
            Don't use the site, RSVP system, or speaker channel to push unsolicited commercial
            offers. Sponsorship is welcome — get in touch via
            <a href="/sponsor-us" class="text-verse-500 font-semibold no-underline hover:underline">sponsor us</a>.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">No warranties</h2>
          <p>
            The site is provided as-is. We do our best to keep it running and your data safe (see
            our <a href="/privacy" class="text-verse-500 font-semibold no-underline hover:underline">privacy</a> page),
            but we make no formal warranties about availability or fitness for any particular
            purpose.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-500">Contact</h2>
          <p>
            Questions about these terms? Email
            <a href="mailto:hello@frontend.mu" class="text-verse-500 font-semibold no-underline hover:underline">hello@frontend.mu</a>.
          </p>
        </section>
      </div>
    </div>
  </main>
</template>
