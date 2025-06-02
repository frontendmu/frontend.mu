interface SponsorshipTemplate {
  title: string
  text: string
}

export const sponsorshipTemplates: Record<string, SponsorshipTemplate> = {
  ceo: {
    title: 'For CEOs and Decision Makers',
    text: `Dear {{companyName}} leadership team,

As the CEO of {{companyName}}, you understand the importance of building a strong tech community and attracting top talent. Frontend Coders Mauritius, largest frontend development community, presents a unique opportunity to position {{companyName}} as a tech leader while accessing a pool of skilled developers.

By sponsoring our meetups, you'll gain:
• Direct access to 500+ frontend developers
• Enhanced employer branding in the tech community
• Opportunities to showcase {{companyName}}'s tech innovation
• Priority access to talented developers

Learn more about our impact at https://frontend.coders.mu/meetups and view our sponsorship opportunities at https://frontend.coders.mu/sponsor-us#sponsor-cta.`,
  },
  hr: {
    title: 'For HR and Talent Acquisition',
    text: `Hello {{companyName}} HR team,

Looking to attract top frontend development talent? Frontend Coders Mauritius offers {{companyName}} a direct channel to connect with over 500 skilled developers in Mauritius.

Our meetups provide:
• Direct recruitment opportunities
• Enhanced employer branding
• Platform to showcase {{companyName}}'s work culture
• Networking with experienced developers

Check our past events at https://frontend.coders.mu/meetups to see the caliber of talent you'll connect with. Visit https://frontend.coders.mu/sponsor-us#sponsor-cta to learn about our sponsorship packages.`,
  },
  tech: {
    title: 'For Tech Leaders and Engineering Managers',
    text: `Hey {{companyName}} tech team,

Want to boost your team's frontend expertise and community presence? Frontend Coders Mauritius meetups are where Mauritius' frontend developers gather to share knowledge and explore new technologies.

Sponsoring offers your team:
• Speaking opportunities to showcase your tech stack
• Knowledge sharing with 500+ frontend developers
• Access to the latest frontend trends and best practices
• Community recognition as a tech-forward company

See our technical talks at https://frontend.coders.mu/meetups and explore sponsorship benefits at https://frontend.coders.mu/sponsor-us#sponsor-cta.`,
  },
}
