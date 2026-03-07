import { extractDebugSource, isDebugBarEnabled, recordDebugQuery } from '#debug_bar/manager'
import type { DbQueryEventNode } from '@adonisjs/lucid/types/database'

interface DebugBarEmitter {
  on(event: 'db:query', listener: (event: DbQueryEventNode) => void): void
}

declare global {
  var frontendMuDebugBarQueryRunnerPatched: boolean | undefined
}

export function setupDebugBar(emitter: DebugBarEmitter) {
  if (!isDebugBarEnabled()) {
    return
  }

  if (!globalThis.frontendMuDebugBarQueryRunnerPatched) {
    emitter.on('db:query', (event) => {
      recordDebugQuery({
        ...event,
        source: extractDebugSource(new Error().stack),
      })
    })

    globalThis.frontendMuDebugBarQueryRunnerPatched = true
  }
}
