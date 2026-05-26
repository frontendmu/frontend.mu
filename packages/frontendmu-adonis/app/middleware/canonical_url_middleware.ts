import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const TRACKING_PARAM = /^(utm_[a-z_]+|fbclid|gclid|mc_[a-z0-9_]+|ref|trk)$/i
const BYPASS_PREFIXES = ['/api/', '/auth/']

/**
 * Canonicalises GET URLs so search engines (and shares) all converge on the
 * same form:
 *   - trailing-slash stripped (except for "/")
 *   - tracking params (utm_*, ref, trk, fbclid, gclid, …) stripped
 * Inertia XHRs (X-Inertia: true), non-GET requests, and JSON-only routes
 * (/api/*, /auth/* OAuth callbacks) are skipped so API consumers and OAuth
 * flows aren't 301-redirected mid-request.
 */
export default class CanonicalUrlMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const request = ctx.request

    if (request.method() !== 'GET') return next()
    if (request.header('x-inertia')) return next()

    const pathname = request.url(false)

    for (const prefix of BYPASS_PREFIXES) {
      if (pathname.startsWith(prefix)) return next()
    }

    const qs = request.parsedUrl.query as string | null | undefined

    let canonicalPath = pathname
    if (canonicalPath.length > 1 && canonicalPath.endsWith('/')) {
      canonicalPath = canonicalPath.replace(/\/+$/, '')
    }

    let canonicalQuery = ''
    if (qs) {
      const params = new URLSearchParams(qs)
      const cleaned = new URLSearchParams()
      let dropped = false
      for (const [key, value] of params.entries()) {
        if (TRACKING_PARAM.test(key)) {
          dropped = true
          continue
        }
        cleaned.append(key, value)
      }
      canonicalQuery = cleaned.toString()
      if (!dropped && canonicalPath === pathname) {
        return next()
      }
    } else if (canonicalPath === pathname) {
      return next()
    }

    const target = canonicalQuery ? `${canonicalPath}?${canonicalQuery}` : canonicalPath
    return ctx.response.redirect(target, false, 301)
  }
}
