/**
 * Generate db.local.sqlite3 with seed data for local development.
 *
 * Includes: events, sessions, speakers, sponsors, pages, RBAC setup,
 *           dummy users with dummy RSVPs for development.
 * Excludes: passwords, google IDs, emails, real RSVPs, user role assignments.
 *
 * Usage:
 *   DB_DATABASE=database/db.local.sqlite3 node ace migration:fresh
 *   npx tsx database/scripts/generate_local_db.ts
 *
 * Requires database/exports/*.json (from export_pg_data.ts).
 */

import knex from 'knex'
import phc from '@phc/format'
import { scryptSync, randomBytes, randomUUID } from 'node:crypto'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const exportDir = join(scriptDir, '..', 'exports')

// ISO 8601 pattern — Lucid expects SQL format (no T, no Z) for DateTime.fromSQL()
const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

function isoToSql(value: string): string {
  return value
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
    .replace(/Z$/, '')
}
const dbPath = join(scriptDir, '..', 'db.local.sqlite3')

// Fields to strip from users for privacy
const userSensitiveFields = ['password', 'google_id', 'email']

// Tables to import (in dependency order)
// Excluded: rsvps, user_roles (user-specific data)
const tables = [
  'users',
  'events',
  'sessions',
  'session_speakers',
  'sponsors',
  'event_sponsors',
  'event_photos',
  'pages',
  'permissions',
  'roles',
  'role_permissions',
]

function readExport(table: string): Record<string, any>[] {
  const filePath = join(exportDir, `${table}.json`)
  if (!existsSync(filePath)) return []
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

async function generate() {
  if (!existsSync(exportDir)) {
    console.error('No database/exports/ directory. Run export_pg_data.ts first.')
    process.exit(1)
  }

  if (!existsSync(dbPath)) {
    console.error(`${dbPath} not found. Run migrations first:`)
    console.error('  DB_DATABASE=database/db.local.sqlite3 node ace migration:fresh')
    process.exit(1)
  }

  const db = knex({
    client: 'better-sqlite3',
    connection: { filename: dbPath },
    useNullAsDefault: true,
  })

  // Only include users who are speakers (referenced in session_speakers)
  const sessionSpeakers = readExport('session_speakers')
  const speakerIds = new Set(sessionSpeakers.map((ss) => ss.speaker_id))

  for (const table of tables) {
    let rows = readExport(table)
    if (rows.length === 0) {
      console.log(`  ${table}: skipped (empty)`)
      continue
    }

    // Only keep speaker users, not all users
    if (table === 'users') {
      rows = rows.filter((row) => speakerIds.has(row.id))
    }

    // Get valid columns from the target table
    const columnInfo = await db(table).columnInfo()
    const validColumns = new Set(Object.keys(columnInfo))

    const filteredRows = rows.map((row) => {
      const filtered: Record<string, any> = {}
      for (const [key, value] of Object.entries(row)) {
        if (!validColumns.has(key)) continue

        // Strip sensitive user fields
        if (table === 'users' && userSensitiveFields.includes(key)) continue

        // Serialize arrays/objects to JSON strings for SQLite
        if (
          Array.isArray(value) ||
          (typeof value === 'object' && value !== null && !(value instanceof Date))
        ) {
          filtered[key] = JSON.stringify(value)
        } else if (typeof value === 'string' && isoDateRegex.test(value)) {
          filtered[key] = isoToSql(value)
        } else {
          filtered[key] = value
        }
      }
      return filtered
    })

    for (let i = 0; i < filteredRows.length; i += 100) {
      await db(table).insert(filteredRows.slice(i, i + 100))
    }

    console.log(`  ${table}: ${filteredRows.length} rows`)
  }

  // Create admin account for local dev
  const adminEmail = 'rajnikant@super.com'
  const adminPassword = 'password1234'

  // Hash password using scrypt + PHC format (matching AdonisJS hash config)
  const salt = randomBytes(16)
  const cost = 16384
  const blockSize = 8
  const parallelization = 1
  const hash = scryptSync(adminPassword, salt, 64, { cost, blockSize, parallelization })
  const hashedPassword = phc.serialize({
    id: 'scrypt',
    params: { n: cost, r: blockSize, p: parallelization },
    salt,
    hash,
  })

  const adminId = randomUUID()
  const now = new Date()
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')

  await db('users').insert({
    id: adminId,
    name: 'Rajnikant',
    email: adminEmail,
    password: hashedPassword,
    role: 'superadmin',
    featured: false,
    is_organizer: true,
    is_community_member: true,
    created_at: now,
    updated_at: now,
  })

  // Assign superadmin role
  const superadminRole = await db('roles').where('name', 'superadmin').first()
  if (superadminRole) {
    await db('user_roles').insert({
      user_id: adminId,
      role_id: superadminRole.id,
      created_at: now,
    })
  }

  console.log(`  admin: rajnikant@super.com / password1234`)

  // Create dummy users with dummy RSVPs for local dev
  const dummyUsers = [
    { name: 'AliceDev', email: 'alice@example.com', github_username: 'alice-dev' },
    { name: 'Bob Tester', email: 'bob@example.com', github_username: 'bob-tester' },
    { name: 'Charlie Mock', email: 'charlie@example.com', github_username: 'charlie-mock' },
    { name: 'Diana Sample', email: 'diana@example.com', github_username: 'diana-sample' },
    { name: 'Eve Fixture', email: 'eve@example.com', github_username: 'eve-fixture' },
  ]

  const dummyUserIds: string[] = []
  for (const u of dummyUsers) {
    const id = randomUUID()
    dummyUserIds.push(id)
    await db('users').insert({
      id,
      name: u.name,
      email: u.email,
      github_username: u.github_username,
      role: 'viewer',
      featured: false,
      is_organizer: false,
      is_community_member: true,
      created_at: now,
      updated_at: now,
    })
  }

  // Assign dummy RSVPs — each user RSVPs to a random subset of events
  const allEvents = await db('events').select('id').orderBy('event_date', 'desc').limit(20)
  let rsvpCount = 0
  for (const userId of dummyUserIds) {
    // Each dummy user RSVPs to 3-8 random events
    const count = 3 + Math.floor(Math.random() * 6)
    const shuffled = [...allEvents].sort(() => Math.random() - 0.5).slice(0, count)
    for (const event of shuffled) {
      await db('rsvps').insert({
        id: randomUUID(),
        user_id: userId,
        event_id: event.id,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      })
      rsvpCount++
    }
  }

  console.log(`  dummy users: ${dummyUsers.length}, dummy RSVPs: ${rsvpCount}`)

  // Assign viewer role to all users without a role
  const viewerRole = await db('roles').where('name', 'viewer').first()
  if (viewerRole) {
    const usersWithoutRoles = await db('users')
      .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
      .whereNull('user_roles.user_id')
      .select('users.id')

    if (usersWithoutRoles.length > 0) {
      await db('user_roles').insert(
        usersWithoutRoles.map((u) => ({
          user_id: u.id,
          role_id: viewerRole.id,
          created_at: now,
        }))
      )
    }
    console.log(`  viewer role assigned: ${usersWithoutRoles.length} users`)
  }

  // Set organizer titles and linkedin URLs from organizers.json
  const organizersPath = join(scriptDir, '..', 'data', 'organizers.json')
  if (existsSync(organizersPath)) {
    const organizers = JSON.parse(readFileSync(organizersPath, 'utf-8'))
    for (const org of organizers) {
      if (org.id) {
        await db('users')
          .where('id', org.id)
          .update({
            title: org.role || null,
            linkedin_url: org.linkedin || null,
            is_organizer: true,
          })
      }
    }
    console.log(`  organizer titles: ${organizers.length} updated`)
  }

  await db.destroy()
  console.log(`\nGenerated: database/db.local.sqlite3`)
  console.log('This file can be committed to the repo for local development.')
}

generate().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
