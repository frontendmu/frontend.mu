import type { HttpContext } from '@adonisjs/core/http'
import { setSeoMeta, type SeoMetaInput } from '#utils/seo'

const META: Record<string, SeoMetaInput> = {
  sponsorUs: {
    title: 'Sponsor us',
    description:
      'Support coders.mu by sponsoring a meetup. Help fund venues, food, equipment, and travel for speakers.',
    canonical: '/sponsor-us',
  },
  about: {
    title: 'About',
    description:
      'About Front-End Coders Mauritius — who we are, what we do, and the values that drive our monthly meetups.',
    canonical: '/about',
  },
  community: {
    title: 'Community',
    description:
      'Join the coders.mu community on Discord, GitHub, WhatsApp, Twitter, Instagram, and LinkedIn.',
    canonical: '/community',
  },
  branding: {
    title: 'Branding',
    description:
      'Logos, colours, and brand assets for partners and contributors using the coders.mu identity.',
    canonical: '/branding',
  },
  history: {
    title: 'History',
    description:
      'The story of Front-End Coders Mauritius — how the community started and how it has grown.',
    canonical: '/history',
  },
  contribute: {
    title: 'Contribute',
    description:
      'Help build coders.mu — submit talks, contribute to the open-source site, organise a meetup, or sponsor an event.',
    canonical: '/contribute',
  },
  codingGuidelines: {
    title: 'Coding guidelines',
    description: 'Conventions, style rules, and patterns the coders.mu site is built with.',
    canonical: '/coding-guidelines',
  },
  codeOfConduct: {
    title: 'Code of Conduct',
    description:
      'The expectations we hold for everyone participating in the coders.mu community — at meetups, online, and in the repo.',
    canonical: '/code-of-conduct',
  },
  apiDocs: {
    title: 'Public API',
    description:
      'Documentation for the public, read-only coders.mu API — perfect for embedding upcoming meetups on your own site.',
    canonical: '/api-docs',
  },
  privacy: {
    title: 'Privacy',
    description:
      'How coders.mu handles your personal data — what we collect, why, and how to ask us to remove it.',
    canonical: '/privacy',
  },
  terms: {
    title: 'Terms',
    description:
      'The rules of the road for using coders.mu — what we expect of you, what you can expect of us.',
    canonical: '/terms',
  },
}

export default class PagesController {
  async sponsorUs(ctx: HttpContext) {
    setSeoMeta(ctx, META.sponsorUs)
    return ctx.inertia.render('sponsor-us', {})
  }

  async about(ctx: HttpContext) {
    setSeoMeta(ctx, META.about)
    return ctx.inertia.render('about', {})
  }

  async community(ctx: HttpContext) {
    setSeoMeta(ctx, META.community)
    return ctx.inertia.render('community', {})
  }

  async branding(ctx: HttpContext) {
    setSeoMeta(ctx, META.branding)
    return ctx.inertia.render('branding', {})
  }

  async history(ctx: HttpContext) {
    setSeoMeta(ctx, META.history)
    return ctx.inertia.render('history', {})
  }

  async contribute(ctx: HttpContext) {
    setSeoMeta(ctx, META.contribute)
    return ctx.inertia.render('contribute', {})
  }

  async codingGuidelines(ctx: HttpContext) {
    setSeoMeta(ctx, META.codingGuidelines)
    return ctx.inertia.render('coding-guidelines', {})
  }

  async codeOfConduct(ctx: HttpContext) {
    setSeoMeta(ctx, META.codeOfConduct)
    return ctx.inertia.render('code-of-conduct', {})
  }

  async apiDocs(ctx: HttpContext) {
    setSeoMeta(ctx, META.apiDocs)
    return ctx.inertia.render('api-docs', {})
  }

  async privacy(ctx: HttpContext) {
    setSeoMeta(ctx, META.privacy)
    return ctx.inertia.render('privacy', {})
  }

  async terms(ctx: HttpContext) {
    setSeoMeta(ctx, META.terms)
    return ctx.inertia.render('terms', {})
  }
}
