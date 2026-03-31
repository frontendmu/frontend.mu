#!/usr/bin/env tsx

import { createPgClient } from './_helpers.js'

const TABLES = [
  'event_photos',
  'session_speakers',
  'sessions',
  'event_sponsors',
  'rsvps',
  'user_roles',
  'role_permissions',
  'permissions',
  'roles',
  'events',
  'sponsors',
  'pages',
  'users',
]

async function cleanDatabase() {
  const client = createPgClient()

  try {
    await client.connect()
    console.log('Cleaning database...')

    await client.query(
      `TRUNCATE TABLE ${TABLES.map((table) => `"${table}"`).join(', ')} RESTART IDENTITY CASCADE`
    )

    console.log('Database cleaned successfully.')
  } catch (error) {
    console.error('Database cleanup failed:', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

await cleanDatabase()
