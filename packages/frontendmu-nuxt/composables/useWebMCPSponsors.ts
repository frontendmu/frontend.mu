import sponsorTypes from '../../frontendmu-data/data/sponsors.js'

export function useWebMCPSponsors() {
  const { registerTool, unregisterTool } = useWebMCP()

  function register() {
    registerTool({
      name: 'getSponsors',
      description: 'Get current frontend.mu sponsors, what they provide (hosting, domain, licenses, conference tickets), and their websites.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => ({
        sponsorCategories: sponsorTypes.map((category: any) => ({
          category: category.title,
          description: category.description,
          sponsors: category.sponsors.map((s: any) => ({
            name: s.name,
            provides: s.description,
            website: s.sponsorUrl,
          })),
        })),
      }),
    })

    registerTool({
      name: 'getSponsorshipInfo',
      description: 'Get information about how to sponsor frontend.mu meetups, including sponsorship types (venue, lunch, goodies) and contact details.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
      handler: async () => ({
        sponsorshipTypes: [
          { type: 'Venue Sponsor', description: 'Provide a venue for our monthly meetups' },
          { type: 'Lunch Sponsor', description: 'Provide lunch/refreshments for attendees' },
          { type: 'Goodies Sponsor', description: 'Provide prizes, licenses, or swag for raffles' },
          { type: 'Website Sponsor', description: 'Support our domain name and hosting costs' },
          { type: 'Partner', description: 'Conference ticket discounts and cross-promotion' },
        ],
        contact: 'sandeep+frontendmu@ramgolam.com',
        moreInfo: '/sponsor-us',
      }),
    })
  }

  function cleanup() {
    unregisterTool('getSponsors')
    unregisterTool('getSponsorshipInfo')
  }

  return { register, cleanup }
}
