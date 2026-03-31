/**
 * Export all data from the production SQLite database to JSON files.
 *
 * Usage:
 *   npx tsx database/scripts/export_sqlite_data.ts
 *
 * Reads from tmp/db.production.sqlite3 (or DB_DATABASE env var).
 * Writes to database/exports/*.json.
 */

import knex from 'knex'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))

const tables = [
  'users',
  'events',
  'sessions',
  'session_speakers',
  'sponsors',
  'event_sponsors',
  'event_photos',
  'pages',
  'rsvps',
  'permissions',
  'roles',
  'role_permissions',
  'user_roles',
]

async function exportData() {
  const dbPath = process.env.DB_DATABASE || './tmp/db.production.sqlite3'

  const db = knex({
    client: 'better-sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true,
  })

  const exportDir = join(scriptDir, '..', 'exports')
  mkdirSync(exportDir, { recursive: true })

  for (const table of tables) {
    try {
      const rows = await db(table).select('*')
      writeFileSync(join(exportDir, `${table}.json`), JSON.stringify(rows, null, 2))
      console.log(`  ${table}: ${rows.length} rows`)
    } catch (err: any) {
      console.log(`  ${table}: skipped (${err.message})`)
    }
  }

  await db.destroy()
  console.log(`\nExported to database/exports/`)
}

exportData().catch((err) => {
  console.error('Export failed:', err.message)
  process.exit(1)
})
