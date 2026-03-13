import speakersResponse from '../../frontendmu-data/data/speakers-raw.json'
import speakersProfileResponse from '../../frontendmu-data/data/speakers-profile.json'
import eventsResponse from '../../frontendmu-data/data/meetups-raw.json'

export function useWebMCPSpeakers() {
  const { registerTool, unregisterTool } = useWebMCP()

  function register() {
    registerTool({
      name: 'findSpeaker',
      description: 'Search frontend.mu community speakers by name. Returns their profile, GitHub, and full talk history across all meetups.',
      inputSchema: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            description: 'Speaker name to search for (partial match supported)',
          },
        },
        required: ['name'],
      },
      handler: async ({ name }: { name: string }) => {
        const query = name.toLowerCase()
        const matches = speakersResponse.filter(s =>
          s.name.toLowerCase().includes(query),
        )

        return matches.map((speaker) => {
          const talks = eventsResponse.flatMap((event: any) =>
            (event.sessions || [])
              .filter((s: any) => s.Session_id?.speakers?.id === speaker.id)
              .map((s: any) => ({
                talk: s.Session_id?.title,
                meetup: event.title,
                date: event.Date,
                meetupUrl: `/meetup/${event.id}`,
              })),
          )

          const profile = speakersProfileResponse.find(
            (p: any) => p.github === speaker.github_account,
          )

          return {
            name: speaker.name,
            github: speaker.github_account,
            featured: speaker.featured,
            profileUrl: `/speaker/${speaker.id}`,
            bio: profile?.bio || null,
            jobTitle: profile?.job_title || null,
            twitter: profile?.twitter || null,
            website: profile?.website || null,
            talks,
            totalTalks: talks.length,
          }
        })
      },
    })
  }

  function cleanup() {
    unregisterTool('findSpeaker')
  }

  return { register, cleanup }
}
