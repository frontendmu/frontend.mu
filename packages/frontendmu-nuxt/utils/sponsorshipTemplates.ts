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

Looking to attract top frontend development talent? Frontend Coders Mauritius offers {{companyName}} a direct channel to connect with over 500 skilled developers in Mauritius.

Our meetups provide:
• Direct recruitment opportunities
• Enhanced employer branding
• Platform to showcase {{companyName}}'s work culture
• Networking with experienced developers

Check our past events at https://coders.mu/meetups to see the caliber of talent you'll connect with. Visit https://coders.mu/sponsor-us#sponsor-cta to learn about our sponsorship packages.`,
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

See our technical talks at https://coders.mu/meetups and explore sponsorship benefits at https://coders.mu/sponsor-us#sponsor-cta.`,
  },
}
