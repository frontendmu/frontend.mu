#!/usr/bin/env tsx

import { createPgClient, logSection } from './_helpers.js'

async function count(client: ReturnType<typeof createPgClient>, table: string) {
  const result = await client.query<{ total: string }>(`SELECT COUNT(*) AS total FROM "${table}"`)
  return Number(result.rows[0]?.total || 0)
}

async function verifyDataIntegrity() {
  const client = createPgClient()

  try {
    await client.connect()

    logSection('Record Counts')
    const counts = {
      users: await count(client, 'users'),
      events: await count(client, 'events'),
      sessions: await count(client, 'sessions'),
      sponsors: await count(client, 'sponsors'),
      eventPhotos: await count(client, 'event_photos'),
      pages: await count(client, 'pages'),
    }
    console.log(counts)

    logSection('Relationships')
    const orphanedSessions = await client.query<{ total: string }>(`
      SELECT COUNT(*) AS total
      FROM sessions s
      LEFT JOIN events e ON e.id = s.event_id
      WHERE e.id IS NULL
    `)
    const orphanedPhotos = await client.query<{ total: string }>(`
      SELECT COUNT(*) AS total
      FROM event_photos p
      LEFT JOIN events e ON e.id = p.event_id
      WHERE e.id IS NULL
    `)
    console.log({
      orphanedSessions: Number(orphanedSessions.rows[0]?.total || 0),
      orphanedPhotos: Number(orphanedPhotos.rows[0]?.total || 0),
    })

    logSection('User Distribution')
    const userDistribution = await client.query<{ role: string; total: string }>(`
      SELECT role, COUNT(*) AS total
      FROM users
      GROUP BY role
      ORDER BY role ASC
    `)
    console.table(
      userDistribution.rows.map((row) => ({ role: row.role, total: Number(row.total) }))
    )

    logSection('Event Status')
    const eventStatuses = await client.query<{ status: string; total: string }>(`
      SELECT status, COUNT(*) AS total
      FROM events
      GROUP BY status
      ORDER BY status ASC
    `)
    console.table(
      eventStatuses.rows.map((row) => ({ status: row.status, total: Number(row.total) }))
    )

    logSection('Sponsor Status')
    const sponsorStatuses = await client.query<{ status: string; total: string }>(`
      SELECT status, COUNT(*) AS total
      FROM sponsors
      GROUP BY status
      ORDER BY status ASC
    `)
    console.table(
      sponsorStatuses.rows.map((row) => ({ status: row.status, total: Number(row.total) }))
    )

    logSection('Sample Data')
    const sampleUsers = await client.query<{
      name: string
      role: string
      github_username: string | null
    }>(`
      SELECT name, role, github_username
      FROM users
      ORDER BY created_at ASC
      LIMIT 3
    `)
    const sampleEvents = await client.query<{
      title: string
      event_date: string
      session_count: string
      photo_count: string
    }>(`
      SELECT
        e.title,
        e.event_date::text AS event_date,
        COUNT(DISTINCT s.id) AS session_count,
        COUNT(DISTINCT p.id) AS photo_count
      FROM events e
      LEFT JOIN sessions s ON s.event_id = e.id
      LEFT JOIN event_photos p ON p.event_id = e.id
      GROUP BY e.id
      ORDER BY e.event_date ASC
      LIMIT 2
    `)
    console.table(sampleUsers.rows)
    console.table(
      sampleEvents.rows.map((row) => ({
        title: row.title,
        eventDate: row.event_date.split(' ')[0],
        sessions: Number(row.session_count),
        photos: Number(row.photo_count),
      }))
    )

    console.log('\nVerification complete.')
  } catch (error) {
    console.error('Verification failed:', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

await verifyDataIntegrity()
