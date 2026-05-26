import type { HttpContext } from '@adonisjs/core/http'
import { canonicalUrl, siteUrl } from '#utils/site_url'

export type SeoMeta = {
  title: string
  description: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string | null
  ogType: 'website' | 'article' | 'profile'
  noindex: boolean
}

const SITE_NAME = 'coders.mu'
const TITLE_SUFFIX = ' · coders.mu'
const DEFAULT_DESCRIPTION =
  'A community of frontend, backend, and full-stack developers in Mauritius. Monthly meetups, talks, and open conversations on the craft.'

const NOINDEX_PATH_PREFIXES = ['/admin', '/profile', '/login', '/register', '/auth']

function defaultsFor(ctx: HttpContext): SeoMeta {
  const path = ctx.request.url(false)
  const noindex = NOINDEX_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  )
  return {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    canonical: canonicalUrl(path),
    ogTitle: SITE_NAME,
    ogDescription: DEFAULT_DESCRIPTION,
    ogImage: null,
    ogType: 'website',
    noindex,
  }
}

export type SeoMetaInput = Partial<Omit<SeoMeta, 'canonical'>> & {
  /** Path relative to site root, e.g. "/meetup/2024-august". If omitted, the current request URL is used. */
  canonical?: string
}

/**
 * Compute the final SEO meta for the current request and stash it on the Edge
 * view so the inertia layout template can render <title>/<meta>/<link rel=canonical>/og:* tags
 * into the initial HTML response — important for Google because we don't run SSR.
 */
export function setSeoMeta(ctx: HttpContext, input: SeoMetaInput = {}): SeoMeta {
  const defaults = defaultsFor(ctx)

  const title = input.title ? `${input.title}${TITLE_SUFFIX}` : defaults.title
  const description = input.description ?? defaults.description

  const canonical = input.canonical
    ? input.canonical.startsWith('http')
      ? input.canonical
      : canonicalUrl(input.canonical)
    : defaults.canonical

  const ogImage = input.ogImage
    ? input.ogImage.startsWith('http')
      ? input.ogImage
      : siteUrl() + (input.ogImage.startsWith('/') ? input.ogImage : `/${input.ogImage}`)
    : null

  const meta: SeoMeta = {
    title,
    description,
    canonical,
    ogTitle: input.ogTitle ?? title,
    ogDescription: input.ogDescription ?? description,
    ogImage,
    ogType: input.ogType ?? defaults.ogType,
    noindex: input.noindex ?? defaults.noindex,
  }

  ctx.view.share({ seoMeta: meta })
  return meta
}
