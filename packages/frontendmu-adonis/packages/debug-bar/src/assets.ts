import { readFileSync, statSync } from 'node:fs'
import { isDebugBarEnabled } from '#debug_bar/manager'

let debugBarScript: string | null = null
let debugBarShell: string | null = null
let debugBarScriptMtimeMs: number | null = null
let debugBarShellMtimeMs: number | null = null
const debugBarScriptPath = new URL('./debug-bar.js', import.meta.url)
const debugBarShellPath = new URL('./debug-bar.html', import.meta.url)

export function getDebugBarScript() {
  const debugMode = isDebugBarEnabled()

  if (!debugMode && debugBarScript) {
    return debugBarScript
  }

  if (!debugMode) {
    debugBarScript = readFileSync(debugBarScriptPath, 'utf8')
    return debugBarScript
  }

  const currentMtimeMs = statSync(debugBarScriptPath).mtimeMs

  if (!debugBarScript || debugBarScriptMtimeMs !== currentMtimeMs) {
    debugBarScript = readFileSync(debugBarScriptPath, 'utf8')
    debugBarScriptMtimeMs = currentMtimeMs
  }

  return debugBarScript
}

export function renderDebugBarShell(debugBarId: string, previousDebugBarId?: string | null) {
  const debugMode = isDebugBarEnabled()

  if (!debugMode && !debugBarShell) {
    debugBarShell = readFileSync(debugBarShellPath, 'utf8')
  } else if (debugMode) {
    const currentMtimeMs = statSync(debugBarShellPath).mtimeMs

    if (!debugBarShell || debugBarShellMtimeMs !== currentMtimeMs) {
      debugBarShell = readFileSync(debugBarShellPath, 'utf8')
      debugBarShellMtimeMs = currentMtimeMs
    }
  }

  const shell = debugBarShell ?? ''

  return shell
    .replaceAll('__DEBUG_BAR_ID__', escapeAttribute(debugBarId))
    .replaceAll('__DEBUG_BAR_PREV_ID__', escapeAttribute(previousDebugBarId ?? ''))
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
