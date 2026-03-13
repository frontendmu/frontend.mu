import type { DirectusEvent } from '~/utils/types'

export function useWebMCPMeetupDetail(meetup: Ref<DirectusEvent> | ComputedRef<DirectusEvent>) {
  const { registerTool, unregisterTool } = useWebMCP()

  function register() {
    const snapshot = unref(meetup)
    if (!snapshot?.title) return

    registerTool({
      name: 'getMeetupDetails',
      description: `Get full details for this meetup: "${snapshot.title}" on ${snapshot.Date}. Includes sessions, speakers, venue, time, and sponsors.`,
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const m = unref(meetup)
        return {
          title: m.title,
          date: m.Date,
          time: m.Time,
          venue: m.Venue,
          location: m.Location,
          attendeeLimit: m.Attendees || m.seats_available,
          acceptingRsvp: m.accepting_rsvp,
          sessions: m.sessions?.map(s => ({
            title: s.Session_id?.title,
            speaker: s.Session_id?.speakers?.name,
            speakerGithub: s.Session_id?.speakers?.github_account,
            deck: s.Session_id?.deck ?? null,
          })) || [],
          sponsors: m.sponsors?.map(s => ({
            name: s.Sponsor_id?.Name,
            type: s.Sponsor_id?.Sponsor_type,
            website: s.Sponsor_id?.Website,
          })) || [],
          map: m.map || null,
          url: `/meetup/${m.id}`,
        }
      },
    })
  }

  function cleanup() {
    unregisterTool('getMeetupDetails')
  }

  return { register, cleanup }
}
