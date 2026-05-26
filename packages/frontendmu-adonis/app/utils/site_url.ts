import env from '#start/env'

const CANONICAL_HOST = 'https://coders.mu'

function rawSiteUrl(): string {
  const fromEnv = env.get('APP_URL')
  if (fromEnv && /^https?:\/\//i.test(fromEnv)) return fromEnv
  return CANONICAL_HOST
}

export function siteUrl(): string {
  return rawSiteUrl().replace(/\/$/, '')
}

export function canonicalUrl(path: string): string {
  const base = siteUrl()
  if (!path || path === '/') return base + '/'
  const normalised = path.startsWith('/') ? path : `/${path}`
  return base + normalised
}
