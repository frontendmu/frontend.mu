import { DISCORD_URL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL, TWITTER_URL, WHATSAPP_URL } from '~/constants'

export default defineNuxtPlugin(() => {
  if (!('modelContext' in navigator)) {
    return
  }

  const { registerTool } = useWebMCP()

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
