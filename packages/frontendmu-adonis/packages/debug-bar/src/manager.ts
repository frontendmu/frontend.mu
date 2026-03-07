import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import type { HttpContext } from '@adonisjs/core/http'
import type { DbQueryEventNode } from '@adonisjs/lucid/types/database'

export interface DebugBarTimelineEntry {
  type: 'request' | 'query' | 'render'
  label: string
  startMs: number
  durationMs: number | null
  meta?: string | null
}

export interface DebugBarQuery {
  connection: string
  method: string
  sql: string
  bindings: unknown[]
  durationMs: number | null
  source: string | null
}

export interface DebugBarRequestInfo {
  method: string
  url: string
  path: string
  route: string | null
  statusCode: number
  requestHeaders: Record<string, unknown>
  responseHeaders: Record<string, unknown>
  query: Record<string, unknown>
  body: Record<string, unknown>
  params: Record<string, unknown>
  session: Record<string, unknown> | null
}

export interface DebugBarSnapshot {
  enabled: true
  requestMs: number
  queryCount: number
  queryTimeMs: number
  requests: DebugBarRequestInfo
  timeline: DebugBarTimelineEntry[]
  queries: DebugBarQuery[]
}

interface DebugBarStore {
  id: string
  startedAt: number
  queries: DebugBarQuery[]
  timeline: DebugBarTimelineEntry[]
}

interface DebugQueryEvent extends DbQueryEventNode {
  source?: string | null
}

interface DebugBarSnapshotEntry {
  expiresAt: number
  snapshot: DebugBarSnapshot
}

interface DebugBarRequestSnapshot {
  id: string
  snapshot: DebugBarSnapshot
}

interface DebugBarRequestSnapshotEntry {
  expiresAt: number
  snapshots: DebugBarRequestSnapshot[]
}

const debugBarStorage = new AsyncLocalStorage<DebugBarStore>()
const applicationRoot = process.cwd()
const snapshotTtlMs = 2 * 60 * 1000
const debugBarSnapshots = new Map<string, DebugBarSnapshotEntry>()
const debugBarRequestSnapshots = new Map<string, DebugBarRequestSnapshotEntry>()

export function isDebugBarEnabled() {
  return process.env.NODE_ENV === 'development'
}

export async function runWithDebugBar<T>(callback: () => Promise<T>): Promise<T> {
  if (!isDebugBarEnabled()) {
    return callback()
  }

  return debugBarStorage.run(
    {
      id: randomUUID(),
      startedAt: performance.now(),
      queries: [],
      timeline: [
        {
          type: 'request',
          label: 'Request received',
          startMs: 0,
          durationMs: null,
          meta: null,
        },
      ],
    },
    callback
  )
}

export function getDebugBarSnapshot(ctx: HttpContext): DebugBarSnapshot | null {
  if (!isDebugBarEnabled()) {
    return null
  }

  const store = debugBarStorage.getStore()

  if (!store) {
    return null
  }

  const requestMs = roundMs(performance.now() - store.startedAt)
  const queryTimeMs = roundMs(
    store.queries.reduce((total, query) => total + (query.durationMs ?? 0), 0)
  )
  const requestInfo = buildRequestInfo(ctx)
  const timeline = [
    ...store.timeline,
    {
      type: 'request' as const,
      label: 'Request finished',
      startMs: requestMs,
      durationMs: 0,
      meta: `${requestInfo.statusCode} ${requestInfo.route ?? requestInfo.path}`,
    },
  ]

  return {
    enabled: true,
    requestMs,
    queryCount: store.queries.length,
    queryTimeMs,
    requests: requestInfo,
    timeline: dedupeFinishedRequestEntries(timeline).sort(
      (left, right) => left.startMs - right.startMs
    ),
    queries: store.queries,
  }
}

export function getDebugBarRequestId() {
  return debugBarStorage.getStore()?.id ?? null
}

export function storeDebugBarSnapshot(ctx: HttpContext) {
  const snapshot = getDebugBarSnapshot(ctx)
  const id = getDebugBarRequestId()

  if (!snapshot || !id) {
    return null
  }

  pruneDebugBarSnapshots()
  debugBarSnapshots.set(id, {
    expiresAt: Date.now() + snapshotTtlMs,
    snapshot,
  })

  const clientRequestId = ctx.request.header('x-debug-request-id')

  if (clientRequestId) {
    storeRequestSnapshot(clientRequestId, { id, snapshot })
  }

  return id
}

export function getStoredDebugBarSnapshot(id: string) {
  pruneDebugBarSnapshots()

  return debugBarSnapshots.get(id)?.snapshot ?? null
}

export function getStoredDebugBarSnapshotsForRequest(id: string) {
  pruneDebugBarSnapshots()

  return debugBarRequestSnapshots.get(id)?.snapshots ?? []
}

export function recordDebugQuery(event: DebugQueryEvent) {
  const store = debugBarStorage.getStore()

  if (!store) {
    return
  }

  const durationMs = durationToMs(event.duration)
  const recordedAt = performance.now()
  const query = {
    connection: event.connection,
    method: event.method,
    sql: event.sql,
    bindings: event.bindings ?? [],
    durationMs,
    source: event.source ?? extractDebugSource(new Error().stack),
  }

  store.queries.push(query)
  store.timeline.push({
    type: 'query',
    label: `${event.method.toUpperCase()} ${event.connection}`,
    startMs: relativeStartMs(store.startedAt, recordedAt, durationMs),
    durationMs,
    meta: query.source,
  })
}

export function recordDebugRender(label: string, startedAt: number, meta?: string | null) {
  const store = debugBarStorage.getStore()

  if (!store) {
    return
  }

  const durationMs = roundMs(performance.now() - startedAt)
  store.timeline.push({
    type: 'render',
    label,
    startMs: roundMs(startedAt - store.startedAt),
    durationMs,
    meta: meta ?? null,
  })
}

export function recordRequestMatched(route: string | null) {
  const store = debugBarStorage.getStore()

  if (!store) {
    return
  }

  store.timeline.push({
    type: 'request',
    label: 'Route matched',
    startMs: roundMs(performance.now() - store.startedAt),
    durationMs: 0,
    meta: route,
  })
}

export function durationToMs(duration?: [number, number]) {
  if (!duration) {
    return null
  }

  return roundMs(duration[0] * 1000 + duration[1] / 1_000_000)
}

export function extractDebugSource(stack?: string) {
  if (!stack) {
    return null
  }

  const frames = stack.split('\n').slice(1)

  for (const frame of frames) {
    const parsedFrame = parseStackFrame(frame)

    if (!parsedFrame) {
      continue
    }

    const normalizedPath = normalizeFramePath(parsedFrame.path)

    if (!normalizedPath) {
      continue
    }

    if (
      normalizedPath.includes('/node_modules/') ||
      normalizedPath.includes('/src/debug_bar/manager.') ||
      normalizedPath.includes('/src/debug_bar/setup.') ||
      normalizedPath.includes('/packages/debug-bar/src/manager.') ||
      normalizedPath.includes('/packages/debug-bar/src/setup.') ||
      normalizedPath.includes('/build/src/') ||
      normalizedPath.startsWith('node:internal')
    ) {
      continue
    }

    if (!normalizedPath.startsWith(applicationRoot)) {
      continue
    }

    const relativePath = normalizedPath.slice(applicationRoot.length + 1)
    return `${relativePath}:${parsedFrame.line}`
  }

  return null
}

function buildRequestInfo(ctx: HttpContext): DebugBarRequestInfo {
  const rawResponse = ctx.response.response

  return {
    method: ctx.request.method(),
    url: safeCall(() => ctx.request.completeUrl(), ctx.request.url(true)),
    path: ctx.request.url(),
    route: safeCall(() => ctx.route?.pattern ?? null, null),
    statusCode: rawResponse.statusCode,
    requestHeaders: normalizeRecord(ctx.request.request.headers),
    responseHeaders: normalizeRecord(
      typeof rawResponse.getHeaders === 'function' ? rawResponse.getHeaders() : {}
    ),
    query: normalizeRecord(safeCall(() => ctx.request.qs(), {})),
    body: normalizeRecord(safeCall(() => ctx.request.all(), {})),
    params: normalizeRecord(safeCall(() => ctx.params ?? {}, {})),
    session: ctx.session ? normalizeRecord(safeCall(() => ctx.session.all(), {})) : null,
  }
}

function relativeStartMs(requestStartedAt: number, recordedAt: number, durationMs: number | null) {
  const offset = durationMs ?? 0
  return roundMs(Math.max(0, recordedAt - requestStartedAt - offset))
}

function parseStackFrame(frame: string) {
  const normalizedFrame = frame.trim().replace(/^at\s+/, '')
  const location = normalizedFrame.includes('(')
    ? normalizedFrame.slice(normalizedFrame.lastIndexOf('(') + 1, normalizedFrame.length - 1)
    : normalizedFrame
  const match = location.match(/^(.*):(\d+):(\d+)$/)

  if (!match) {
    return null
  }

  return {
    path: match[1],
    line: Number(match[2]),
  }
}

function normalizeFramePath(framePath: string) {
  if (framePath.startsWith('file://')) {
    return fileURLToPath(framePath)
  }

  return framePath
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }

  return JSON.parse(JSON.stringify(value)) as Record<string, unknown>
}

function dedupeFinishedRequestEntries(entries: DebugBarTimelineEntry[]) {
  let seenFinishedRequest = false

  return [...entries]
    .reverse()
    .filter((entry) => {
      if (entry.label !== 'Request finished') {
        return true
      }

      if (seenFinishedRequest) {
        return false
      }

      seenFinishedRequest = true
      return true
    })
    .reverse()
}

function safeCall<T>(callback: () => T, fallback: T): T {
  try {
    return callback()
  } catch {
    return fallback
  }
}

function roundMs(value: number) {
  return Math.round(value * 100) / 100
}

function pruneDebugBarSnapshots() {
  const now = Date.now()

  for (const [key, value] of debugBarSnapshots.entries()) {
    if (value.expiresAt <= now) {
      debugBarSnapshots.delete(key)
    }
  }

  for (const [key, value] of debugBarRequestSnapshots.entries()) {
    if (value.expiresAt <= now) {
      debugBarRequestSnapshots.delete(key)
    }
  }
}

function storeRequestSnapshot(clientRequestId: string, snapshot: DebugBarRequestSnapshot) {
  const existingSnapshots = debugBarRequestSnapshots.get(clientRequestId)?.snapshots ?? []
  const snapshots = existingSnapshots.filter((entry) => entry.id !== snapshot.id)

  snapshots.unshift(snapshot)
  debugBarRequestSnapshots.set(clientRequestId, {
    expiresAt: Date.now() + snapshotTtlMs,
    snapshots: snapshots.slice(0, 10),
  })
}
