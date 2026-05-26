import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

const TRACKING_PARAM = /^(utm_[a-z_]+|fbclid|gclid|mc_[a-z0-9_]+|ref|trk)$/i

/**
 * Canonicalises GET URLs so search engines (and shares) all converge on the
 * same form:
 *   - trailing-slash stripped (except for "/")
 *   - tracking params (utm_*, ref, trk, fbclid, gclid, …) stripped
 * Inertia XHRs (X-Inertia: true) and non-GET requests are skipped so SPA
 * navigation and form posts don't get redirected.
 */
export default class CanonicalUrlMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const request = ctx.request

    if (request.method() !== 'GET') return next()
    if (request.header('x-inertia')) return next()

    const pathname = request.url(false)
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
