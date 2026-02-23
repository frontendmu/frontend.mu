import type { Meetup } from '~/utils/types'

export function useWebMCPMeetups(allMeetups: Meetup[]) {
  const { registerTool, unregisterTool } = useWebMCP()

  function register() {
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
        return allMeetups
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
  }

  function cleanup() {
    unregisterTool('searchMeetups')
  }

  return { register, cleanup }
}
