/**
 * Export all data from PostgreSQL to JSON files.
 *
 * Run BEFORE switching to SQLite:
 *   npx tsx database/scripts/export_pg_data.ts
 *
 * Requires the PG container to be running (podman compose up -d).
 * Reads connection details from environment or uses defaults from .env.example.
 */

import pg from 'pg'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const { Client } = pg
const scriptDir = dirname(fileURLToPath(import.meta.url))

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

async function exportData() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5433,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'frontendmu_docker_dev',
  })

  await client.connect()
  console.log('Connected to PostgreSQL')

  const exportDir = join(scriptDir, '..', 'exports')
  mkdirSync(exportDir, { recursive: true })

  for (const table of tables) {
    try {
      const result = await client.query(`SELECT * FROM "${table}"`)
      writeFileSync(join(exportDir, `${table}.json`), JSON.stringify(result.rows, null, 2))
      console.log(`  ${table}: ${result.rows.length} rows`)
    } catch (err: any) {
      console.log(`  ${table}: skipped (${err.message})`)
    }
  }

  await client.end()
  console.log(`\nExported to database/exports/`)
}

exportData().catch((err) => {
  console.error('Export failed:', err.message)
  process.exit(1)
})
