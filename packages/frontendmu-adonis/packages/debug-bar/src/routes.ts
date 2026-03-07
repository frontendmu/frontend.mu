import {
  getStoredDebugBarSnapshot,
  getStoredDebugBarSnapshotsForRequest,
  isDebugBarEnabled,
} from '#debug_bar/manager'
import { getDebugBarScript } from '#debug_bar/assets'

interface DebugBarRouter {
  get(path: string, handler: (ctx: any) => any): void
}

declare global {
  var debugBarRoutesRegistered: boolean | undefined
}

export function registerDebugBarRoutes(router: DebugBarRouter) {
  if (globalThis.debugBarRoutesRegistered) {
    return
  }

  router.get('/_debug/:id', async ({ params, response }) => {
    if (!isDebugBarEnabled()) {
      return response.notFound()
    }

    const snapshot = getStoredDebugBarSnapshot(params.id)

    if (!snapshot) {
      return response.notFound({ error: 'Debug snapshot not found' })
    }

    return response.json(snapshot)
  })

  router.get('/_debug/request/:id', async ({ params, response }) => {
    if (!isDebugBarEnabled()) {
      return response.notFound()
    }

    return response.json(getStoredDebugBarSnapshotsForRequest(params.id))
  })

  router.get('/_debug/assets/debug-bar.js', async ({ response }) => {
    if (!isDebugBarEnabled()) {
      return response.notFound()
    }

    response.header('content-type', 'application/javascript; charset=utf-8')
    return response.send(getDebugBarScript())
  })

  globalThis.debugBarRoutesRegistered = true
}
