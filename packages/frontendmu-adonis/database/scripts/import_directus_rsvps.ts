/**
 * Import RSVPs from the Directus SQLite database into the AdonisJS SQLite database.
 *
 * - Maps events by title + date
 * - Creates missing events in AdonisJS if they have RSVPs
 * - Matches users by email or github_username, creates new ones if unmatched
 * - Creates RSVP records
 *
 * Usage:
 *   npx tsx database/scripts/import_directus_rsvps.ts
 *
 * Requires:
 *   - Directus DB at ../frontendmu-directus/directus/database/database.sqlite
 *   - AdonisJS DB at tmp/db.production.sqlite3 (with migrations already run)
 */

import knex from 'knex'
import { randomUUID } from 'node:crypto'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const DIRECTUS_DB = join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  '..',
  'frontendmu-directus',
  'directus',
  'database',
  'database.sqlite'
)
const ADONIS_DB = join(__dirname, '..', '..', 'tmp', 'db.production.sqlite3')

function epochToSqlDate(epoch: number): string {
  const d = new Date(epoch)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} 00:00:00`
}

function nowSql(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
}

async function main() {
  const directus = knex({
    client: 'better-sqlite3',
    connection: { filename: DIRECTUS_DB },
    useNullAsDefault: true,
  })

  const adonis = knex({
    client: 'better-sqlite3',
    connection: { filename: ADONIS_DB },
    useNullAsDefault: true,
  })

  // 1. Load all AdonisJS events (for matching)
  const adonisEvents = await adonis('events').select('id', 'title', 'event_date')

  // Build a lookup: "title|YYYY-MM-DD" -> AdonisJS UUID
  const eventMap = new Map<string, string>()
  for (const e of adonisEvents) {
    const date = e.event_date.split(' ')[0] // "YYYY-MM-DD"
    eventMap.set(`${e.title}|${date}`, e.id)
  }

  // 2. Load all AdonisJS users (for matching)
  const adonisUsers = await adonis('users').select('id', 'email', 'github_username')
  const userByEmail = new Map<string, string>()
  const userByGithub = new Map<string, string>()
  for (const u of adonisUsers) {
    if (u.email) userByEmail.set(u.email.toLowerCase(), u.id)
    if (u.github_username) userByGithub.set(u.github_username.toLowerCase(), u.id)
  }

  // 3. Load Directus events that have RSVPs
  const directusEvents = await directus('Events as e')
    .join('Events_directus_users as r', 'r.Events_id', 'e.id')
    .select('e.id', 'e.title', 'e.Date', 'e.description', 'e.Location', 'e.Venue')
    .groupBy('e.id')

  // 4. Map Directus events to AdonisJS events, creating missing ones
  const directusEventToAdonis = new Map<number, string>()
  let eventsCreated = 0

  for (const de of directusEvents) {
    const date = epochToSqlDate(de.Date).split(' ')[0]
    const key = `${de.title}|${date}`

    if (eventMap.has(key)) {
      directusEventToAdonis.set(de.id, eventMap.get(key)!)
    } else {
      // Create missing event in AdonisJS
      const newId = randomUUID()
      const now = nowSql()
      await adonis('events').insert({
        id: newId,
        title: de.title,
        description: de.description || null,
        location: de.Location || null,
        venue: de.Venue || null,
        event_date: epochToSqlDate(de.Date),
        status: 'published',
        attendee_count: 0,
        accepting_rsvp: false,
        created_at: now,
        updated_at: now,
      })
      directusEventToAdonis.set(de.id, newId)
      eventMap.set(key, newId)
      eventsCreated++
      console.log(`  Created missing event: "${de.title}" (${date})`)
    }
  }

  // 5. Load all Directus RSVPs with user info
  const rsvps = await directus('Events_directus_users as r')
    .leftJoin('directus_users as u', 'u.id', 'r.directus_users_id')
    .select(
      'r.Events_id',
      'r.directus_users_id',
      'r.name as rsvp_name',
      'u.first_name',
      'u.last_name',
      'u.email',
      'u.github_username',
      'u.full_name'
    )

  // 6. Map Directus users to AdonisJS users, creating missing ones
  const directusUserToAdonis = new Map<string, string>()
  // Track users created from RSVP name only (no directus_users_id)
  const anonymousUsers = new Map<string, string>()
  let usersCreated = 0
  let rsvpsCreated = 0
  let rsvpsSkipped = 0

  for (const rsvp of rsvps) {
    const eventId = directusEventToAdonis.get(rsvp.Events_id)
    if (!eventId) {
      rsvpsSkipped++
      continue
    }

    let userId: string | undefined

    if (rsvp.directus_users_id) {
      // Check cache first
      if (directusUserToAdonis.has(rsvp.directus_users_id)) {
        userId = directusUserToAdonis.get(rsvp.directus_users_id)!
      } else {
        // Try matching by email
        if (rsvp.email) {
          userId = userByEmail.get(rsvp.email.toLowerCase())
        }
        // Try matching by github_username
        if (!userId && rsvp.github_username) {
          userId = userByGithub.get(rsvp.github_username.toLowerCase())
        }
        // Create new user if not found
        if (!userId) {
          const name =
            rsvp.full_name ||
            [rsvp.first_name, rsvp.last_name].filter(Boolean).join(' ') ||
            rsvp.rsvp_name ||
            'Unknown'
          userId = randomUUID()
          const now = nowSql()
          await adonis('users').insert({
            id: userId,
            name,
            email: rsvp.email || null,
            github_username: rsvp.github_username || null,
            role: 'viewer',
            featured: false,
            is_organizer: false,
            is_community_member: true,
            created_at: now,
          })
          if (rsvp.email) userByEmail.set(rsvp.email.toLowerCase(), userId)
          if (rsvp.github_username) userByGithub.set(rsvp.github_username.toLowerCase(), userId)
          usersCreated++
        }
        directusUserToAdonis.set(rsvp.directus_users_id, userId)
      }
    } else {
      // Anonymous RSVP (no directus_users_id) - use rsvp_name
      const name = rsvp.rsvp_name || 'Anonymous'
      if (anonymousUsers.has(name)) {
        userId = anonymousUsers.get(name)!
      } else {
        userId = randomUUID()
        const now = nowSql()
        await adonis('users').insert({
          id: userId,
          name,
          role: 'viewer',
          featured: false,
          is_organizer: false,
          is_community_member: true,
          created_at: now,
        })
        anonymousUsers.set(name, userId)
        usersCreated++
      }
    }

    // 7. Create RSVP (skip if already exists)
    const existing = await adonis('rsvps')
      .where({ user_id: userId, event_id: eventId })
      .first()

    if (!existing) {
      const now = nowSql()
      await adonis('rsvps').insert({
        id: randomUUID(),
        user_id: userId,
        event_id: eventId,
        status: 'confirmed',
        created_at: now,
        updated_at: now,
      })
      rsvpsCreated++
    } else {
      rsvpsSkipped++
    }
  }

  console.log(`\nDone:`)
  console.log(`  Events created: ${eventsCreated}`)
  console.log(`  Users created: ${usersCreated}`)
  console.log(`  RSVPs created: ${rsvpsCreated}`)
  console.log(`  RSVPs skipped: ${rsvpsSkipped}`)

  await directus.destroy()
  await adonis.destroy()
}

main().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
