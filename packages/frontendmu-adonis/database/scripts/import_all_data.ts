import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { Client } = pg

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

function parseDate(dateString: string): Date | null {
  if (!dateString) return null
  const date = new Date(dateString)
  return isNaN(date.getTime()) ? null : date
}

async function importSpeakers() {
  console.log('Importing speakers from speakers-raw.json...')

  const dataPath = join(__dirname, '../../../frontendmu-data/data/speakers-raw.json')
  const speakersData = JSON.parse(readFileSync(dataPath, 'utf-8'))

  let imported = 0
  for (const speaker of speakersData) {
    await client.query(
      `INSERT INTO users (id, name, github_username, role, featured, avatar_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id) DO NOTHING`,
      [
        speaker.id,
        speaker.name,
        speaker.github_account,
        'speaker',
        speaker.featured,
        speaker.github_account ? `https://github.com/${speaker.github_account}.png` : null,
      ]
    )
    imported++
  }

  console.log('Imported ' + imported + ' speakers')
}

async function importMeetups() {
  console.log('\nImporting meetups from meetups-raw.json...')

  const dataPath = join(__dirname, '../../../frontendmu-data/data/meetups-raw.json')
  const meetupsData = JSON.parse(readFileSync(dataPath, 'utf-8'))

  let eventsImported = 0
  let sessionsImported = 0
  let speakersLinked = 0

  for (const meetup of meetupsData) {
    // Check if event already exists by title
    const existingResult = await client.query('SELECT id FROM events WHERE title = $1', [
      meetup.title,
    ])

    if (existingResult.rows.length > 0) {
      console.log('  Event already exists: ' + meetup.title)
      continue
    }

    const eventDate = parseDate(meetup.Date)
    if (!eventDate) {
      console.log('  Invalid date for: ' + meetup.title)
      continue
    }

    // Parse time - convert to proper time format (HH:MM)
    let startTime: string | null = null
    if (meetup.Time) {
      // Match patterns like "10am", "10am to 2pm", "10:00 - 11:30", etc.
      const timeMatch = meetup.Time.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i)
      if (timeMatch) {
        let hours = Number.parseInt(timeMatch[1])
        const minutes = timeMatch[2] || '00'
        const period = (timeMatch[3] || '').toLowerCase()

        if (period === 'pm' && hours < 12) {
          hours += 12
        } else if (period === 'am' && hours === 12) {
          hours = 0
        }

        startTime = hours.toString().padStart(2, '0') + ':' + minutes
      }
    }

    const eventId = generateUUID()
    await client.query(
      `INSERT INTO events (id, title, description, location, venue, event_date, start_time, end_time, attendee_count, album_name, map_url, parking_location, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'published', NOW())`,
      [
        eventId,
        meetup.title,
        meetup.description,
        meetup.Location,
        meetup.Venue,
        eventDate,
        startTime,
        null,
        meetup.Attendees || 0,
        meetup.album,
        meetup.map,
        meetup.parking_location,
      ]
    )

    eventsImported++

    // Import sessions from the raw data
    const rawSessions = meetup.sessions || []
    let order = 1

    for (const rawSession of rawSessions) {
      const sessionTitle = rawSession.Session_id?.title || 'Session ' + order
      const speakerInfo = rawSession.Session_id?.speakers

      const sessionId = rawSession.id ? generateUUID() : generateUUID()

      await client.query(
        'INSERT INTO sessions (id, event_id, title, "order", created_at) VALUES ($1, $2, $3, $4, NOW())',
        [sessionId, eventId, sessionTitle, order++]
      )

      sessionsImported++

      // Link speaker if exists
      if (speakerInfo && speakerInfo.id) {
        await client.query(
          'INSERT INTO session_speakers (session_id, speaker_id, created_at) VALUES ($1, $2, NOW())',
          [sessionId, speakerInfo.id]
        )
        speakersLinked++
      }
    }

    console.log('  Imported: ' + meetup.title + ' (' + rawSessions.length + ' sessions)')
  }

  console.log('\nEvents: ' + eventsImported)
  console.log('Sessions: ' + sessionsImported)
  console.log('Speaker links: ' + speakersLinked)
}

async function importSponsors() {
  console.log('\nImporting sponsors from sponsors-raw.json...')

  const dataPath = join(__dirname, '../../../frontendmu-data/data/sponsors-raw.json')
  const sponsorsData = JSON.parse(readFileSync(dataPath, 'utf-8'))

  let sponsorsImported = 0
  let sponsorLinksCreated = 0

  for (const sponsor of sponsorsData) {
    // Check if sponsor already exists
    const existingResult = await client.query('SELECT id FROM sponsors WHERE id = $1', [sponsor.id])

    if (existingResult.rows.length > 0) {
      console.log('  Sponsor already exists: ' + sponsor.name)
    } else {
      // Insert sponsor
      await client.query(
        `INSERT INTO sponsors (id, name, website, description, logo_url, logomark_url, sponsor_types, darkbg, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', NOW())
         ON CONFLICT (id) DO NOTHING`,
        [
          sponsor.id,
          sponsor.name,
          sponsor.website,
          sponsor.description,
          sponsor.logo,
          sponsor.logomark,
          JSON.stringify(sponsor.sponsor_type),
          sponsor.darkbg,
        ]
      )
      sponsorsImported++
      console.log('  Imported sponsor: ' + sponsor.name)
    }

    // Link sponsor to events based on meetup data
    if (sponsor.meetups && sponsor.meetups.length > 0) {
      for (const meetup of sponsor.meetups) {
        // Find event by title (most reliable match)
        const eventResult = await client.query('SELECT id FROM events WHERE title = $1', [
          meetup.title,
        ])

        if (eventResult.rows.length > 0) {
          const eventId = eventResult.rows[0].id

          // Check if link already exists
          const linkResult = await client.query(
            'SELECT 1 FROM event_sponsors WHERE event_id = $1 AND sponsor_id = $2',
            [eventId, sponsor.id]
          )

          if (linkResult.rows.length === 0) {
            await client.query(
              'INSERT INTO event_sponsors (event_id, sponsor_id, created_at) VALUES ($1, $2, NOW())',
              [eventId, sponsor.id]
            )
            sponsorLinksCreated++
            console.log('    Linked to event: ' + meetup.title)
          }
        } else {
          console.log('    Event not found: ' + meetup.title)
        }
      }
    }
  }

  console.log('\nSponsors: ' + sponsorsImported)
  console.log('Sponsor-Event links: ' + sponsorLinksCreated)
}

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function runMigration() {
  console.log('Starting data migration...\n')

  try {
    await client.connect()

    await importSpeakers()
    await importMeetups()
    await importSponsors()

    // Summary
    const userResult = await client.query('SELECT COUNT(*) as total FROM users')
    const eventResult = await client.query('SELECT COUNT(*) as total FROM events')
    const sessionResult = await client.query('SELECT COUNT(*) as total FROM sessions')
    const speakerLinkResult = await client.query('SELECT COUNT(*) as total FROM session_speakers')
    const sponsorResult = await client.query('SELECT COUNT(*) as total FROM sponsors')
    const sponsorLinkResult = await client.query('SELECT COUNT(*) as total FROM event_sponsors')

    console.log('\nFinal Summary:')
    console.log('  Users: ' + userResult.rows[0].total)
    console.log('  Events: ' + eventResult.rows[0].total)
    console.log('  Sessions: ' + sessionResult.rows[0].total)
    console.log('  Speaker links: ' + speakerLinkResult.rows[0].total)
    console.log('  Sponsors: ' + sponsorResult.rows[0].total)
    console.log('  Sponsor-Event links: ' + sponsorLinkResult.rows[0].total)

    console.log('\nDone!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
