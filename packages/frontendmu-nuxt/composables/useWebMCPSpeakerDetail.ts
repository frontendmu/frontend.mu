import type { SpeakerProfileWithSessions } from '~/utils/types'

export function useWebMCPSpeakerDetail(speaker: Ref<SpeakerProfileWithSessions>) {
  const { registerTool, unregisterTool } = useWebMCP()

  function register() {
    const snapshot = unref(speaker)
    if (!snapshot?.person) return

    registerTool({
      name: 'getSpeakerDetails',
      description: `Get full profile and talk history for speaker: ${snapshot.person.name}`,
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => {
        const s = unref(speaker)
        return {
          name: s.person.name,
          github: s.person.github_account,
          featured: s.person.featured,
          bio: s.profile?.bio || null,
          jobTitle: s.profile?.job_title || null,
          location: s.profile?.location || null,
          website: s.profile?.website || null,
          twitter: s.profile?.twitter || null,
          talks: s.sessions?.map((session: any) => ({
            title: session.Session_id?.title,
          })) || [],
        }
      },
    })
  }

  function cleanup() {
    unregisterTool('getSpeakerDetails')
  }

  return { register, cleanup }
}
