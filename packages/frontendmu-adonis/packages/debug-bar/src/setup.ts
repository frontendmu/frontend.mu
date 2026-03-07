import { QueryRunner } from '../../../node_modules/@adonisjs/lucid/build/src/query_runner/index.js'
import { extractDebugSource, isDebugBarEnabled, recordDebugQuery } from '#debug_bar/manager'

interface DebugBarEmitter {
  on(event: string, listener: typeof recordDebugQuery): void
}

declare global {
  var frontendMuDebugBarQueryRunnerPatched: boolean | undefined
}

export function setupDebugBar(_emitter: DebugBarEmitter) {
  if (!isDebugBarEnabled()) {
    return
  }

  if (!globalThis.frontendMuDebugBarQueryRunnerPatched) {
    const originalRun = QueryRunner.prototype.run

    QueryRunner.prototype.run = async function patchedRun(query) {
      const queryRunner = this as any
      let queryPayload: Record<string, unknown> | null = null
      const startedAt = process.hrtime()

      const queryWithEvents = query as any

      if (queryWithEvents && typeof queryWithEvents.once === 'function') {
        queryWithEvents.once('query', (payload: Record<string, unknown>) => {
          queryPayload = payload
        })
      }

      queryRunner.debug = true

      if (queryRunner.reporter) {
        queryRunner.reporter.debug = true
      }

      if (!queryRunner.logData?.source) {
        queryRunner.logData = {
          ...queryRunner.logData,
          source: extractDebugSource(new Error().stack),
        }
      }

      try {
        const result = await originalRun.call(this, query)
        recordPatchedQuery(queryRunner, queryPayload, startedAt)
        return result
      } catch (error) {
        recordPatchedQuery(queryRunner, queryPayload, startedAt)
        throw error
      }
    }

    globalThis.frontendMuDebugBarQueryRunnerPatched = true
  }
}

function recordPatchedQuery(
  queryRunner: any,
  queryPayload: Record<string, unknown> | null,
  startedAt: [number, number]
) {
  const logData = queryRunner?.logData ?? {}
  const sqlValue = queryPayload?.sql ?? logData.sql
  const sql = typeof sqlValue === 'string' ? sqlValue : null

  if (!sql) {
    return
  }

  const bindingsValue = queryPayload?.bindings ?? logData.bindings
  const bindings = Array.isArray(bindingsValue) ? bindingsValue : []
  const methodValue = queryPayload?.method ?? logData.method ?? inferMethodFromSql(sql)
  const connectionValue =
    logData.connection ??
    queryPayload?.connection ??
    queryRunner?.client?.connectionName ??
    'default'

  recordDebugQuery({
    connection: String(connectionValue),
    method: String(methodValue),
    sql,
    bindings,
    duration: process.hrtime(startedAt),
    source:
      typeof logData.source === 'string' && logData.source.length
        ? logData.source
        : extractDebugSource(new Error().stack),
  })
}

function inferMethodFromSql(sql: string) {
  const candidate = sql.trim().split(/\s+/, 1)[0]?.toLowerCase()
  if (!candidate) {
    return 'query'
  }

  return candidate
}
