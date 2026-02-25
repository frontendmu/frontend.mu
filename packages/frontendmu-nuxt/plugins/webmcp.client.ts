import { DISCORD_URL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL, TWITTER_URL, WHATSAPP_URL } from '~/constants'
import type { Meetup } from '~/utils/types'

const sitePages = [
  { path: '/', name: 'Home', description: 'Homepage with latest meetup, featured speakers, and community stats' },
  { path: '/meetups', name: 'All Meetups', description: 'Browse all 67+ meetups since 2016, grouped by year' },
  { path: '/team', name: 'Team & Speakers', description: 'Organisers, community members, speakers, and contributors' },
  { path: '/sponsors', name: 'Sponsors', description: 'Current sponsors and what they provide' },
  { path: '/sponsor-us', name: 'Sponsor Us', description: 'How to sponsor frontend.mu meetups, benefits, and contact info' },
  { path: '/about', name: 'About', description: 'About the frontend.mu community' },
  { path: '/community', name: 'Community', description: 'Community resources and links' },
  { path: '/branding', name: 'Branding', description: 'Brand assets and guidelines' },
] as const

export default defineNuxtPlugin(() => {
  if (!('modelContext' in navigator)) {
    return
  }

  const router = useRouter()
  const { registerTool } = useWebMCP()

  registerTool({
    name: 'navigateTo',
    description: 'Navigate to any page on the frontend.mu website. Use this to go to the meetups page, speakers page, sponsors page, etc.',
    inputSchema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: sitePages.map(p => p.path),
          description: `Page to navigate to. Available pages: ${sitePages.map(p => `${p.path} (${p.name} — ${p.description})`).join(', ')}`,
        },
        meetupId: {
          type: 'string',
          description: 'Meetup ID to navigate to a specific meetup detail page (e.g. "67")',
        },
        speakerId: {
          type: 'string',
          description: 'Speaker ID to navigate to a specific speaker profile page',
        },
      },
    },
    handler: async (inputs: { page?: string; meetupId?: string; speakerId?: string }) => {
      let target: string

      if (inputs.meetupId) {
        target = `/meetup/${inputs.meetupId}`
      }
      else if (inputs.speakerId) {
        target = `/speaker/${inputs.speakerId}`
      }
      else if (inputs.page) {
        target = inputs.page
      }
      else {
        return {
          error: 'Please specify a page, meetupId, or speakerId',
          availablePages: sitePages,
        }
      }

      await router.push(target)
      return {
        navigatedTo: target,
        currentUrl: router.currentRoute.value.fullPath,
      }
    },
  })

  const { allMeetups } = useMeetups({ pastMeetupsLimit: 999 })
  registerTool({
    name: 'searchMeetups',
    description: 'Search all frontend.mu meetups (67+ since 2016) by topic, speaker name, or year. Returns matching meetups with their titles, dates, speakers, venues, and links.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Search topic keyword, e.g. "Vue", "CSS", "AI", "React", "testing"',
        },
        speaker: {
          type: 'string',
          description: 'Speaker name to search for',
        },
        year: {
          type: 'number',
          description: 'Filter meetups by year, e.g. 2023',
        },
      },
    },
    handler: async (inputs: { topic?: string; speaker?: string; year?: number }) => {
      return (allMeetups as Meetup[])
        .filter((m) => {
          if (inputs.topic) {
            const topic = inputs.topic.toLowerCase()
            const matchesTitle = m.title.toLowerCase().includes(topic)
            const matchesSession = m.sessions?.some(s =>
              s.Session_id?.title?.toLowerCase().includes(topic),
            )
            if (!matchesTitle && !matchesSession) return false
          }
          if (inputs.speaker) {
            const speaker = inputs.speaker.toLowerCase()
            const matchesSpeaker = m.sessions?.some(s =>
              s.Session_id?.speakers?.name?.toLowerCase().includes(speaker),
            )
            if (!matchesSpeaker) return false
          }
          if (inputs.year) {
            if (new Date(m.Date).getFullYear() !== inputs.year) return false
          }
          return true
        })
        .sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime())
        .map(m => ({
          id: m.id,
          title: m.title,
          date: m.Date,
          venue: m.Venue,
          location: m.Location,
          sessions: m.sessions?.map(s => ({
            title: s.Session_id?.title,
            speaker: s.Session_id?.speakers?.name,
          })) || [],
          url: `/meetup/${m.id}`,
        }))
    },
  })

  registerTool({
    name: 'speakCloud',
    description: 'Speak text aloud using high-quality Google Cloud neural voices. Sounds natural and human-like. Supports English and French. Prefer this over the "speak" tool for better voice quality.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to speak aloud',
        },
        language: {
          type: 'string',
          enum: ['en-US', 'en-GB', 'en-AU', 'en-IN', 'fr-FR', 'fr-CA'],
          description: 'Language and accent. Default is en-US.',
        },
        voice: {
          type: 'string',
          enum: [
            'en-US-Studio-Q', 'en-US-Studio-O',
            'en-US-Neural2-A', 'en-US-Neural2-D', 'en-US-Neural2-J',
            'en-GB-Studio-B', 'en-GB-Studio-C',
            'en-GB-Neural2-A', 'en-GB-Neural2-D',
            'en-AU-Neural2-A', 'en-AU-Neural2-B',
            'en-IN-Neural2-A', 'en-IN-Neural2-B',
            'fr-FR-Studio-A', 'fr-FR-Studio-D',
            'fr-FR-Neural2-A', 'fr-FR-Neural2-D',
            'fr-CA-Neural2-A', 'fr-CA-Neural2-B',
          ],
          description: 'Voice name. Studio voices are highest quality. Default is en-US-Studio-Q (male). en-US-Studio-O is female.',
        },
        speakingRate: {
          type: 'number',
          description: 'Speech speed from 0.25 (very slow) to 4 (very fast). Default is 1.',
        },
        pitch: {
          type: 'number',
          description: 'Voice pitch from -20 (low) to 20 (high). Default is 0.',
        },
      },
      required: ['text'],
    },
    handler: async (inputs: { text: string; language?: string; voice?: string; speakingRate?: number; pitch?: number }) => {
      const response = await $fetch<{ audioContent: string }>('/api/tts', {
        method: 'POST',
        body: {
          text: inputs.text,
          languageCode: inputs.language,
          voiceName: inputs.voice,
          speakingRate: inputs.speakingRate,
          pitch: inputs.pitch,
        },
      })

      const audio = new Audio(`data:audio/mp3;base64,${response.audioContent}`)

      return new Promise((resolve) => {
        audio.onended = () => resolve({
          spoken: true,
          text: inputs.text,
          voice: inputs.voice || 'en-US-Studio-Q',
          engine: 'google-cloud-tts',
        })
        audio.onerror = () => resolve({
          spoken: false,
          error: 'Failed to play audio',
        })
        audio.play()
      })
    },
  })

  registerTool({
    name: 'speak',
    description: 'Speak text aloud using the browser\'s built-in text-to-speech. Works offline with no API calls. Use "speakCloud" instead for higher quality voices.',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to speak aloud',
        },
        rate: {
          type: 'number',
          description: 'Speech speed from 0.5 (slow) to 2 (fast). Default is 1.',
        },
        pitch: {
          type: 'number',
          description: 'Voice pitch from 0 (low) to 2 (high). Default is 1.',
        },
        voice: {
          type: 'string',
          description: 'Voice name to use (partial match). Run with no text to get available voices.',
        },
      },
      required: ['text'],
    },
    handler: async (inputs: { text: string; rate?: number; pitch?: number; voice?: string }) => {
      const synth = window.speechSynthesis
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(inputs.text)
      utterance.rate = Math.max(0.5, Math.min(2, inputs.rate ?? 1))
      utterance.pitch = Math.max(0, Math.min(2, inputs.pitch ?? 1))

      if (inputs.voice) {
        const voices = synth.getVoices()
        const match = voices.find(v =>
          v.name.toLowerCase().includes(inputs.voice!.toLowerCase()),
        )
        if (match) utterance.voice = match
      }

      return new Promise((resolve) => {
        utterance.onend = () => resolve({
          spoken: true,
          text: inputs.text,
          voice: utterance.voice?.name ?? 'default',
        })
        utterance.onerror = event => resolve({
          spoken: false,
          error: event.error,
        })
        synth.speak(utterance)
      })
    },
  })

  registerTool({
    name: 'joinCommunity',
    description: 'Get the link to join the frontend.mu developer community on a specific platform (Discord, WhatsApp, GitHub, Twitter/X, LinkedIn, Instagram)',
    inputSchema: {
      type: 'object',
      properties: {
        platform: {
          type: 'string',
          enum: ['discord', 'whatsapp', 'github', 'twitter', 'linkedin', 'instagram'],
          description: 'The platform to get the community link for',
        },
      },
      required: ['platform'],
    },
    handler: async ({ platform }: { platform: string }) => {
      const links: Record<string, string> = {
        discord: DISCORD_URL,
        whatsapp: WHATSAPP_URL,
        github: GITHUB_URL,
        twitter: TWITTER_URL,
        linkedin: LINKEDIN_URL,
        instagram: INSTAGRAM_URL,
      }
      return {
        platform,
        url: links[platform] || null,
        availablePlatforms: Object.keys(links),
      }
    },
  })
})
