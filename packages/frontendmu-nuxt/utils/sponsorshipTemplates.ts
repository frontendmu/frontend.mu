interface SponsorshipTemplate {
  title: string
  text: string
}

export const sponsorshipTemplates: Record<string, SponsorshipTemplate> = {
  ceo: {
    title: 'For CEOs and Decision Makers',
    text: `Dear {{companyName}} leadership team,

As the CEO of {{companyName}}, you understand the importance of building a strong tech community and attracting top talent. Coders.mu is a community of passionate developers based in Mauritius. We host meetups regularly around tech topics and have been doing so since 2016! Our motivation is simply the passion for tech itself and our goal is to help developers in Mauritius level up. 

However, passion only is not enough to make monthly meetups a reality. As such we rely on sponsors to secure a venue and lunch during the event, and we would love to talk if you're interested in supporting the community. We already collaborated with 30+ companies in Mauritius in the past: https://coders.mu/sponsors.

By sponsoring our meetups, you'll:
• Help us build a strong tech community
• Enhance employer branding in the tech community
• Showcase {{companyName}}'s tech innovation
• Connect with talented developers
• Advertise your job offers during the event

Learn more about our impact at https://coders.mu/meetups and view our sponsorship opportunities at https://coders.mu/sponsor-us#sponsor-cta.`,
  },
  hr: {
    title: 'For HR and Talent Acquisition',
    text: `Hello {{companyName}} HR team,

Attracting proven frontend talent in Mauritius works best through authentic, low-pressure interactions. Frontend Coders Mauritius is an active community that meets regularly to learn, share, and connect.

As a sponsor, you can:
• Meet motivated practitioners during our meetups and networking breaks
• Use light-touch employer branding (logo on site and slides, verbal thanks, social mention)
• Briefly share open roles or internship opportunities
• Start conversations that help you qualify interest before a formal process
• Choose simple, transparent pricing; in-kind support (venue/food) is also welcome

We don’t promise direct hires. What we offer is consistent visibility with engaged developers and a credible place to begin meaningful hiring conversations.

See what our meetups look like at https://coders.mu/meetups and explore sponsorship options at https://coders.mu/sponsor-us#sponsor-cta.`,
  },
  tech: {
    title: 'For Tech Leaders and Engineering Managers',
    text: `Hey {{companyName}} tech team,

Your engineers thrive on real-world exchange. Our meetups are hands-on and vendor-neutral, focused on code, architecture, and lessons learned from production.

With a sponsorship, your team can:
• Propose a talk or show-and-tell that teaches something practical
• Share trade-offs and pitfalls, and get feedback from practitioners
• Meet engineers who work with similar stacks and constraints
• Learn what tools and practices are resonating locally
• Build your team’s public-speaking confidence and community presence

We keep talks educational—not sales demos. Sponsorship simply helps cover venue and lunch so the community can keep learning together.

Browse past sessions at https://coders.mu/meetups and review sponsor options at https://coders.mu/sponsor-us#sponsor-cta.`,
  },
}
