import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { isDebugBarEnabled } from '#debug_bar/manager'

let debugBarScript: string | null = null
let debugBarShell: string | null = null

export function getDebugBarScript() {
  if (!isDebugBarEnabled() && debugBarScript) {
    return debugBarScript
  }

  debugBarScript = readFileSync(join(process.cwd(), 'packages/debug-bar/src/debug-bar.js'), 'utf8')
  return debugBarScript
}

export function renderDebugBarShell(debugBarId: string, previousDebugBarId?: string | null) {
  if (isDebugBarEnabled() || !debugBarShell) {
    debugBarShell = readFileSync(
      join(process.cwd(), 'packages/debug-bar/src/debug-bar.html'),
      'utf8'
    )
  }

  return debugBarShell
    .replaceAll('__DEBUG_BAR_ID__', escapeAttribute(debugBarId))
    .replaceAll('__DEBUG_BAR_PREV_ID__', escapeAttribute(previousDebugBarId ?? ''))
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
