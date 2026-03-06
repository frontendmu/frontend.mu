/**
 * Import JSON data into SQLite database.
 *
 * Run AFTER switching to SQLite and running migrations:
 *   node ace migration:run
 *   npx tsx database/scripts/import_sqlite_data.ts
 *
 * Reads from database/exports/*.json (created by export_pg_data.ts).
 */

import knex from 'knex'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ISO 8601 pattern — Lucid expects SQL format (no T, no Z) for DateTime.fromSQL()
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function isoToSql(value: string): string {
  return value.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '')
}

// Tables in dependency order (parents before children)
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

async function importData() {
  const dbPath = process.env.DB_DATABASE || './tmp/db.production.sqlite3'

  const db = knex({
    client: 'better-sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true,
  })

  const exportDir = join(__dirname, '..', 'exports')

  if (!existsSync(exportDir)) {
    console.error('No exports directory found. Run export_pg_data.ts first.')
    process.exit(1)
  }

  for (const table of tables) {
    const filePath = join(exportDir, `${table}.json`)

    if (!existsSync(filePath)) {
      console.log(`  ${table}: skipped (no export file)`)
      continue
    }

    const rows: Record<string, any>[] = JSON.parse(readFileSync(filePath, 'utf-8'))
    if (rows.length === 0) {
      console.log(`  ${table}: skipped (empty)`)
      continue
    }

    // Get valid columns from the target table
    const columnInfo = await db(table).columnInfo()
    const validColumns = new Set(Object.keys(columnInfo))

    // Filter rows to only include columns that exist in the target table
    const filteredRows = rows.map((row) => {
      const filtered: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        if (!validColumns.has(key)) continue

        // Serialize arrays/objects to JSON strings for SQLite
        if (Array.isArray(value) || (typeof value === 'object' && value !== null && !(value instanceof Date))) {
          filtered[key] = JSON.stringify(value)
        } else if (typeof value === 'string' && isoDateRegex.test(value)) {
          filtered[key] = isoToSql(value)
        } else {
          filtered[key] = value
        }
      }
      return filtered
    })

    // Insert in batches of 100
    for (let i = 0; i < filteredRows.length; i += 100) {
      const batch = filteredRows.slice(i, i + 100)
      await db(table).insert(batch)
    }

    console.log(`  ${table}: ${filteredRows.length} rows imported`)
  }

  await db.destroy()
  console.log('\nImport complete!')
}

importData().catch((err) => {
  console.error('Import failed:', err.message)
  process.exit(1)
})
