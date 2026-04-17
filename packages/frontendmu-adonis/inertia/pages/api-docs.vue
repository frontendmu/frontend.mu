<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { ref } from 'vue'

const copied = ref<string | null>(null)

async function copy(key: string, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = key
    setTimeout(() => {
      if (copied.value === key) copied.value = null
    }, 1500)
  } catch {
    // clipboard unavailable — no-op
  }
}

const baseUrl = 'https://coders.mu/api/public/v1'

const endpoints = [
  {
    method: 'GET',
    path: '/meetups',
    summary: 'List all published meetups, newest first.',
  },
  {
    method: 'GET',
    path: '/meetups/next',
    summary: 'The next upcoming meetup. Returns 404 if none scheduled.',
  },
  {
    method: 'GET',
    path: '/meetups/{idOrSlug}',
    summary: 'A single meetup, fetched by UUID or by slug (e.g. 2025-march).',
  },
]

const fieldGroups = [
  {
    title: 'Always present',
    fields: [
      ['id', 'string (UUID)', 'Stable identifier.'],
      ['slug', 'string', 'Human-readable URL segment, e.g. "2025-march".'],
      ['title', 'string', 'Meetup title.'],
      ['description', 'string | null', 'Free-form description.'],
      ['date', 'string | null', 'ISO date (YYYY-MM-DD).'],
      ['startTime', 'string | null', 'Local start time (HH:MM:SS).'],
      ['venue', 'string | null', 'Venue name.'],
      ['location', 'string | null', 'Address or location text.'],
      ['attendeeCount', 'number', 'Reported attendee count.'],
      ['acceptingRsvp', 'boolean', 'Whether RSVPs are currently open.'],
      ['status', 'string', '"published", "draft", or "cancelled". The API only returns "published".'],
      ['album', 'string | null', 'Photo album name, if any.'],
      ['updatedAt', 'string | null', 'ISO-8601 timestamp of last change. Use this to detect updates.'],
      ['sessions', 'Session[]', 'Talks/sessions at this meetup, each with speakers.'],
      ['sponsors', 'Sponsor[]', 'Sponsors for this meetup.'],
    ],
  },
  {
    title: 'Only on show / next (detail)',
    fields: [
      ['endTime', 'string | null', 'Local end time.'],
      ['seatsAvailable', 'number | null', 'Remaining seats, if tracked.'],
      ['rsvpClosingDate', 'string | null', 'ISO date RSVPs close.'],
      ['rsvpLink', 'string | null', 'External RSVP URL (Luma, Meetup.com, etc).'],
      ['coverImageUrl', 'string | null', 'Cover image.'],
      ['parkingLocation', 'string | null', 'Parking info.'],
      ['mapUrl', 'string | null', 'External map link.'],
      ['photos', 'Photo[]', 'Event photos.'],
    ],
  },
]

const sampleList = `[
  {
    "id": "8846d85b-363a-41a1-8249-6034e34efacb",
    "slug": "2026-may",
    "title": "The May Meetup",
    "date": "2026-05-23",
    "startTime": "10:00:00",
    "venue": "Astek Mauritius",
    "location": "Ebene",
    "attendeeCount": 0,
    "acceptingRsvp": true,
    "status": "published",
    "updatedAt": "2026-04-13T04:45:41.000+00:00",
    "sessions": [],
    "sponsors": []
  }
]`

const sampleDetail = `{
  "id": "5c0abb19-d707-41c3-bcc4-c8dc369bfe41",
  "slug": "2025-march",
  "title": "Developer Toolings Meetup",
  "date": "2025-03-01",
  "startTime": "10:00:00",
  "endTime": "13:00:00",
  "venue": "Spoon Consulting",
  "status": "published",
  "updatedAt": "2025-03-02T18:03:12.000+00:00",
  "rsvpLink": null,
  "coverImageUrl": "/uploads/events/....jpg",
  "sessions": [
    {
      "id": "c38acef1-f105-4538-b760-85c69e94c706",
      "title": "Making the most of your toolbelt",
      "description": "...",
      "order": 1,
      "speakers": [
        {
          "id": "549be7b0-1e7d-4deb-9fb3-273cfe0da5b0",
          "name": "Cedric Poilly",
          "githubUsername": "cedpoilly",
          "avatarUrl": "https://github.com/cedpoilly.png",
          "featured": true
        }
      ]
    }
  ],
  "sponsors": [],
  "photos": []
}`

const curlNext = 'curl https://coders.mu/api/public/v1/meetups/next'

const fetchExample = `const res = await fetch('https://coders.mu/api/public/v1/meetups')
const meetups = await res.json()

console.log(meetups.length, 'meetups')
console.log(meetups[0].slug, '—', meetups[0].title)`

const pollingExample = `// Highest updatedAt observed across previous polls.
let lastSeen = localStorage.getItem('lastSeen') ?? '1970-01-01T00:00:00Z'

async function checkForUpdates() {
  const res = await fetch('https://coders.mu/api/public/v1/meetups')
  const meetups = await res.json()

  const updated = meetups.filter(m => m.updatedAt > lastSeen)
  if (updated.length > 0) {
    notifyUser(updated)
    lastSeen = meetups
      .map(m => m.updatedAt)
      .filter(Boolean)
      .sort()
      .at(-1)
    localStorage.setItem('lastSeen', lastSeen)
  }
}

// Responses are cached for 60 seconds; polling faster provides no benefit.
setInterval(checkForUpdates, 10 * 60 * 1000)`

const pythonExample = `import requests

r = requests.get('https://coders.mu/api/public/v1/meetups/next')
r.raise_for_status()
meetup = r.json()

print(f"{meetup['slug']}: {meetup['title']} on {meetup['date']}")`
</script>

<template>
  <Head title="API — frontend.mu" />

  <main class="relative min-h-screen pt-40 pb-24">
    <div class="contain relative z-10">
      <!-- Header -->
      <header class="max-w-3xl mb-20 space-y-4">
        <p class="text-sm font-medium text-gray-400 dark:text-gray-500">For developers</p>
        <h1 class="text-5xl md:text-7xl font-display tracking-tight dark:text-white leading-[0.9]">
          Public <span class="font-display-italic text-verse-600 dark:text-verse-400">API</span>
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
          A read-only JSON API exposing published meetup data. Intended for CLIs,
          Raycast extensions, browser extensions, and agent integrations.
        </p>
        <div class="flex flex-wrap gap-2 pt-2">
          <span
            class="inline-flex items-center px-2.5 py-1 text-xs font-mono border border-gray-200 dark:border-verse-800 rounded text-gray-600 dark:text-gray-400"
          >v1</span>
          <span
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium border border-gray-200 dark:border-verse-800 rounded text-gray-600 dark:text-gray-400"
          >Read-only</span>
          <span
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium border border-gray-200 dark:border-verse-800 rounded text-gray-600 dark:text-gray-400"
          >No authentication</span>
          <span
            class="inline-flex items-center px-2.5 py-1 text-xs font-medium border border-gray-200 dark:border-verse-800 rounded text-gray-600 dark:text-gray-400"
          >CORS-open</span>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <!-- Main content -->
        <div class="lg:col-span-9 space-y-20">
          <!-- Quick start -->
          <section id="quick-start" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Quick start
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Fetch the next upcoming meetup:
            </p>
            <div class="relative">
              <pre
                class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-sm font-mono text-gray-100 leading-relaxed"
              ><code>{{ curlNext }}</code></pre>
              <button
                type="button"
                class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                @click="copy('quickstart', curlNext)"
              >
                {{ copied === 'quickstart' ? 'Copied' : 'Copy' }}
              </button>
            </div>
          </section>

          <!-- Base URL -->
          <section id="base-url" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Base URL
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              All endpoints sit under a versioned prefix. Breaking changes will be
              released under a new version prefix (e.g.
              <code class="font-mono text-sm text-verse-600 dark:text-verse-400">/v2</code>).
            </p>
            <div
              class="p-4 bg-gray-50 dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100"
            >
              {{ baseUrl }}
            </div>
          </section>

          <!-- Authentication -->
          <section id="authentication" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Authentication
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              None. The API is public and read-only. No headers, tokens, or cookies
              are required or read.
            </p>
          </section>

          <!-- Endpoints -->
          <section id="endpoints" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Endpoints
            </h2>
            <div
              class="border border-gray-100 dark:border-verse-800 rounded-lg divide-y divide-gray-100 dark:divide-verse-800 overflow-hidden"
            >
              <div
                v-for="endpoint in endpoints"
                :key="endpoint.path"
                class="p-5 space-y-2"
              >
                <div class="flex items-center gap-3 font-mono text-sm">
                  <span
                    class="px-2 py-0.5 text-xs font-semibold bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 rounded"
                  >{{ endpoint.method }}</span>
                  <span class="text-gray-900 dark:text-gray-100">/api/public/v1{{ endpoint.path }}</span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">{{ endpoint.summary }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
              <code class="font-mono text-verse-600 dark:text-verse-400">{idOrSlug}</code>
              accepts either the UUID <code class="font-mono">id</code> or the
              human-readable <code class="font-mono">slug</code>. Both resolve to the
              same meetup. Unknown values return a JSON
              <code class="font-mono">404</code>.
            </p>
          </section>

          <!-- Response shape -->
          <section id="response-shape" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Response shape
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Every meetup carries the same base fields. <code class="font-mono text-sm text-verse-600 dark:text-verse-400">show</code>
              and <code class="font-mono text-sm text-verse-600 dark:text-verse-400">next</code>
              return a richer detail object.
            </p>
            <div v-for="group in fieldGroups" :key="group.title" class="space-y-3">
              <h3 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {{ group.title }}
              </h3>
              <div
                class="border border-gray-100 dark:border-verse-800 rounded-lg overflow-hidden"
              >
                <table class="w-full text-sm">
                  <tbody class="divide-y divide-gray-100 dark:divide-verse-800">
                    <tr v-for="[name, type, desc] in group.fields" :key="name">
                      <td class="px-4 py-3 font-mono text-gray-900 dark:text-gray-100 align-top whitespace-nowrap">
                        {{ name }}
                      </td>
                      <td class="px-4 py-3 font-mono text-xs text-verse-600 dark:text-verse-400 align-top whitespace-nowrap">
                        {{ type }}
                      </td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {{ desc }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <!-- Examples -->
          <section id="examples" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Examples
            </h2>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">List payload</h3>
              <div class="relative">
                <pre
                  class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-xs font-mono text-gray-100 leading-relaxed"
                ><code>{{ sampleList }}</code></pre>
                <button
                  type="button"
                  class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  @click="copy('list', sampleList)"
                >
                  {{ copied === 'list' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Detail payload</h3>
              <div class="relative">
                <pre
                  class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-xs font-mono text-gray-100 leading-relaxed"
                ><code>{{ sampleDetail }}</code></pre>
                <button
                  type="button"
                  class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  @click="copy('detail', sampleDetail)"
                >
                  {{ copied === 'detail' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">JavaScript (fetch)</h3>
              <div class="relative">
                <pre
                  class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-xs font-mono text-gray-100 leading-relaxed"
                ><code>{{ fetchExample }}</code></pre>
                <button
                  type="button"
                  class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  @click="copy('js', fetchExample)"
                >
                  {{ copied === 'js' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>

            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">Python (requests)</h3>
              <div class="relative">
                <pre
                  class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-xs font-mono text-gray-100 leading-relaxed"
                ><code>{{ pythonExample }}</code></pre>
                <button
                  type="button"
                  class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                  @click="copy('py', pythonExample)"
                >
                  {{ copied === 'py' ? 'Copied' : 'Copy' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Caching -->
          <section id="caching" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Caching
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Every successful response carries:
            </p>
            <div
              class="p-4 bg-gray-50 dark:bg-verse-950/40 border border-gray-100 dark:border-verse-800 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100"
            >
              Cache-Control: public, max-age=60, stale-while-revalidate=300
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Responses are fresh for 60 seconds and servable stale for another
              5 minutes while the cache revalidates. Clients should not poll more
              than once per minute.
            </p>
          </section>

          <!-- Change detection -->
          <section id="detecting-changes" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Detecting changes
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Every meetup includes an <code class="font-mono text-sm text-verse-600 dark:text-verse-400">updatedAt</code>
              ISO-8601 timestamp. Clients can track the highest value observed and
              treat any newer value on subsequent polls as a change.
            </p>
            <div class="relative">
              <pre
                class="overflow-x-auto p-4 pr-14 bg-gray-900 dark:bg-verse-950 border border-gray-900 dark:border-verse-800 rounded-lg text-xs font-mono text-gray-100 leading-relaxed"
              ><code>{{ pollingExample }}</code></pre>
              <button
                type="button"
                class="absolute top-2 right-2 px-2.5 py-1 text-xs font-medium text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors"
                @click="copy('poll', pollingExample)"
              >
                {{ copied === 'poll' ? 'Copied' : 'Copy' }}
              </button>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
              A meetup that has never been edited after creation returns
              <code class="font-mono">updatedAt: null</code>. Clients should handle
              this case explicitly.
            </p>
          </section>

          <!-- CORS -->
          <section id="cors" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">CORS</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              All origins are accepted. The API can be called directly from browser
              extensions, static sites, or serverless functions without a proxy.
              Credentials are not required and are not sent.
            </p>
          </section>

          <!-- Stability & feedback -->
          <section id="stability" class="space-y-5 scroll-mt-32">
            <h2 class="text-sm font-semibold uppercase tracking-wider text-verse-600 dark:text-verse-300">
              Stability
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Fields may be added to <code class="font-mono text-sm text-verse-600 dark:text-verse-400">v1</code>
              responses. Existing fields will not be renamed or removed without a new
              version prefix. Requests for additional fields can be filed as issues on
              <a
                href="https://github.com/frontendmu/frontend.mu/issues"
                target="_blank"
                rel="noopener noreferrer"
                class="text-verse-600 dark:text-verse-400 underline underline-offset-2 hover:no-underline"
              >GitHub</a>.
            </p>
          </section>
        </div>

        <!-- Right sidebar: on this page -->
        <aside class="hidden lg:block lg:col-span-3">
          <div class="sticky top-32 space-y-4">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              On this page
            </h4>
            <nav class="space-y-2 text-sm">
              <a href="#quick-start" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Quick start</a>
              <a href="#base-url" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Base URL</a>
              <a href="#authentication" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Authentication</a>
              <a href="#endpoints" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Endpoints</a>
              <a href="#response-shape" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Response shape</a>
              <a href="#examples" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Examples</a>
              <a href="#caching" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Caching</a>
              <a href="#detecting-changes" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Detecting changes</a>
              <a href="#cors" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">CORS</a>
              <a href="#stability" class="block text-gray-600 dark:text-gray-400 hover:text-verse-600 dark:hover:text-verse-400 transition-colors">Stability</a>
            </nav>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>
