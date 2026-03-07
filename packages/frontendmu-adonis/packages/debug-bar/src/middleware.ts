import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import {
  getDebugBarRequestId,
  isDebugBarEnabled,
  recordDebugRender,
  recordRequestMatched,
  runWithDebugBar,
  storeDebugBarSnapshot,
} from '#debug_bar/manager'

const debugBarLastSnapshotCookie = 'debugbar_last_snapshot'
const debugBarSnapshotCookieMaxAgeSeconds = 120

export default class DebugBarMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    if (!isDebugBarEnabled() || isDebugRoute(ctx.request.url())) {
      return next()
    }

    return runWithDebugBar(async () => {
      const previousDebugBarId = ctx.request.cookie(debugBarLastSnapshotCookie) ?? null

      recordRequestMatched(ctx.route?.pattern ?? null)
      const debugBarId = getDebugBarRequestId()

      if ('view' in ctx && debugBarId) {
        ctx.view.share({ debugBarId, debugBarPrevId: previousDebugBarId })
      }

      if ('inertia' in ctx) {
        if (debugBarId) {
          ctx.inertia.share({ debugBarId, debugBarPrevId: previousDebugBarId })
        }

        const originalRender = ctx.inertia.render.bind(ctx.inertia)

        ctx.inertia.render = (async (component, pageProps, viewProps) => {
          const startedAt = performance.now()
          const result = await originalRender(component, pageProps, viewProps)
          recordDebugRender('Inertia response rendered', startedAt, component)
          return result
        }) as typeof ctx.inertia.render
      }

      const response = await next()
      const snapshotId = storeDebugBarSnapshot(ctx)

      if (snapshotId) {
        ctx.response.header('x-debug-bar-id', snapshotId)
        ctx.response.cookie(debugBarLastSnapshotCookie, snapshotId, {
          path: '/',
          maxAge: debugBarSnapshotCookieMaxAgeSeconds,
          sameSite: 'lax',
          httpOnly: true,
        })
      }

      return response
    })
  }
}

function isDebugRoute(url: string) {
  return url.startsWith('/_debug')
}
