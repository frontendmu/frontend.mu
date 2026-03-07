import { readFileSync } from 'node:fs'
import { isDebugBarEnabled } from '#debug_bar/manager'

let debugBarScript: string | null = null
let debugBarShell: string | null = null
const debugBarScriptPath = new URL('./debug-bar.js', import.meta.url)
const debugBarShellPath = new URL('./debug-bar.html', import.meta.url)

export function getDebugBarScript() {
  if (!isDebugBarEnabled() && debugBarScript) {
    return debugBarScript
  }

  debugBarScript = readFileSync(debugBarScriptPath, 'utf8')
  return debugBarScript
}

export function renderDebugBarShell(debugBarId: string, previousDebugBarId?: string | null) {
  if (isDebugBarEnabled() || !debugBarShell) {
    debugBarShell = readFileSync(debugBarShellPath, 'utf8')
  }

  return debugBarShell
    .replaceAll('__DEBUG_BAR_ID__', escapeAttribute(debugBarId))
    .replaceAll('__DEBUG_BAR_PREV_ID__', escapeAttribute(previousDebugBarId ?? ''))
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
