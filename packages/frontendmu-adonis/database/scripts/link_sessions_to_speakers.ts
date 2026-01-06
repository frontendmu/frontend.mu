import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { Client } = pg

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

async function runMigration() {
  console.log('Starting session-speaker linking by session order...\n')

  try {
    await client.connect()

    // Load raw data
    const meetupsPath = join(__dirname, '../../../frontendmu-data/data/meetups-raw.json')
    const meetupsRaw: any[] = JSON.parse(readFileSync(meetupsPath, 'utf-8'))
    
    console.log('Loaded ' + meetupsRaw.length + ' meetups')
    
    // Get all events from database (by title matching)
    const eventsResult = await client.query('SELECT id, title FROM events ORDER BY event_date')
    
    const eventByTitle = new Map<string, string>()
    for (const row of eventsResult.rows) {
      eventByTitle.set(row.title.toLowerCase().trim(), row.id)
    }
    
    // Get all sessions from database (ordered by event date and session order)
    const sessionsResult = await client.query('SELECT id, event_id, title FROM sessions ORDER BY event_id, "order"')
    
    // Create event -> sessions map (maintaining order)
    const eventSessions = new Map<string, any[]>()
    for (const row of sessionsResult.rows) {
      const sessions = eventSessions.get(row.event_id) || []
      sessions.push({ id: row.id, title: row.title })
      eventSessions.set(row.event_id, sessions)
    }
    
    let linksCreated = 0
    let linksSkipped = 0
    let sessionsNotFound = 0
    let speakersNotFound = 0
    let eventsNotFound = 0
    
    // Process each meetup
    for (const meetup of meetupsRaw) {
      const meetupTitle = meetup.title.toLowerCase().trim()
      
      // Find matching event by title
      let eventId = eventByTitle.get(meetupTitle)
      
      // Try partial match
      if (!eventId) {
        for (const [title, id] of eventByTitle) {
          if (meetupTitle.includes(title) || title.includes(meetupTitle)) {
            eventId = id
            break
          }
        }
      }
      
      if (!eventId) {
        eventsNotFound++
        continue
      }
      
      const eventSessionsList = eventSessions.get(eventId) || []
      
      // Process each session in order (matching by position)
      const rawSessions = meetup.sessions || []
      
      for (let i = 0; i < rawSessions.length; i++) {
        const rawSession = rawSessions[i]
        
        // Get speaker info from Session_id
        const speakerInfo = rawSession.Session_id?.speakers
        if (!speakerInfo || !speakerInfo.id) {
          continue
        }
        
        const speakerId = speakerInfo.id
        
        // Get the session at the same position in the database
        const dbSession = eventSessionsList[i]
        
        if (!dbSession) {
          sessionsNotFound++
          continue
        }
        
        // Check if speaker exists
        const speakerCheck = await client.query(
          'SELECT id FROM users WHERE id = $1',
          [speakerId]
        )
        
        if (speakerCheck.rows.length === 0) {
          speakersNotFound++
          continue
        }
        
        // Check if link already exists
        const existingLink = await client.query(
          'SELECT session_id FROM session_speakers WHERE session_id = $1 AND speaker_id = $2',
          [dbSession.id, speakerId]
        )
        
        if (existingLink.rows.length === 0) {
          await client.query(
            'INSERT INTO session_speakers (session_id, speaker_id, created_at) VALUES ($1, $2, NOW())',
            [dbSession.id, speakerId]
          )
          linksCreated++
        } else {
          linksSkipped++
        }
      }
    }
    
    console.log('\nSession-Speaker Links:')
    console.log('  Created: ' + linksCreated)
    console.log('  Skipped (already linked): ' + linksSkipped)
    console.log('  Events not found: ' + eventsNotFound)
    console.log('  Sessions not found: ' + sessionsNotFound)
    console.log('  Speakers not found: ' + speakersNotFound)
    
    // Final summary
    const speakerCount = await client.query("SELECT COUNT(DISTINCT speaker_id) FROM session_speakers")
    const sessionCount = await client.query("SELECT COUNT(DISTINCT session_id) FROM session_speakers")
    
    console.log('\nFinal Summary:')
    console.log('  Speakers with sessions: ' + speakerCount.rows[0].count)
    console.log('  Sessions with speakers: ' + sessionCount.rows[0].count)
    
    console.log('\nMigration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
