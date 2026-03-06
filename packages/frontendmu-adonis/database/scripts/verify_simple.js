#!/usr/bin/env node

/**
 * Simple data verification script using raw SQL
 */

import pkg from 'pg'
const { Client } = pkg

// Database connection
const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

async function verifyDataIntegrity() {
  console.log('🔍 Verifying data integrity...\n')

  try {
    await client.connect()

    // Count records in each table
    const userCount = await client.query('SELECT COUNT(*) as count FROM users')
    const eventCount = await client.query('SELECT COUNT(*) as count FROM events')
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM sessions')
    const sponsorCount = await client.query('SELECT COUNT(*) as count FROM sponsors')
    const photoCount = await client.query('SELECT COUNT(*) as count FROM event_photos')
    const pageCount = await client.query('SELECT COUNT(*) as count FROM pages')

    console.log('📊 Record Counts:')
    console.log(`   Users: ${userCount.rows[0].count}`)
    console.log(`   Events: ${eventCount.rows[0].count}`)
    console.log(`   Sessions: ${sessionCount.rows[0].count}`)
    console.log(`   Sponsors: ${sponsorCount.rows[0].count}`)
    console.log(`   Event Photos: ${photoCount.rows[0].count}`)
    console.log(`   Pages: ${pageCount.rows[0].count}`)
    console.log()

    // Check for orphaned records
    console.log('🔗 Checking Relationships:')

    // Check sessions have valid events
    const orphanedSessions = await client.query(`
      SELECT COUNT(*) as count
      FROM sessions s
      LEFT JOIN events e ON s.event_id = e.id
      WHERE e.id IS NULL
    `)

    console.log(`   Orphaned sessions: ${orphanedSessions.rows[0].count}`)

    // Check photos have valid events
    const orphanedPhotos = await client.query(`
      SELECT COUNT(*) as count
      FROM event_photos ep
      LEFT JOIN events e ON ep.event_id = e.id
      WHERE e.id IS NULL
    `)

    console.log(`   Orphaned photos: ${orphanedPhotos.rows[0].count}`)

    // Check users by role
    const organizers = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'organizer'")
    const speakers = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'speaker'")
    const communityMembers = await client.query("SELECT COUNT(*) as count FROM users WHERE role = 'community_member'")

    console.log('\n👥 User Distribution:')
    console.log(`   Organizers: ${organizers.rows[0].count}`)
    console.log(`   Speakers: ${speakers.rows[0].count}`)
    console.log(`   Community Members: ${communityMembers.rows[0].count}`)

    // Check events by status
    const publishedEvents = await client.query("SELECT COUNT(*) as count FROM events WHERE status = 'published'")
    const draftEvents = await client.query("SELECT COUNT(*) as count FROM events WHERE status = 'draft'")

    console.log('\n📅 Event Status:')
    console.log(`   Published: ${publishedEvents.rows[0].count}`)
    console.log(`   Draft: ${draftEvents.rows[0].count}`)

    // Check sponsors by status
    const activeSponsors = await client.query("SELECT COUNT(*) as count FROM sponsors WHERE status = 'active'")

    console.log('\n🏢 Sponsor Status:')
    console.log(`   Active: ${activeSponsors.rows[0].count}`)

    // Check sessions per event
    const eventsWithSessions = await client.query(`
      SELECT COUNT(DISTINCT e.id) as count
      FROM events e
      JOIN sessions s ON e.id = s.event_id
    `)

    console.log('\n🎤 Events with Sessions:')
    console.log(`   Events with sessions: ${eventsWithSessions.rows[0].count}`)

    // Sample data check
    if (userCount.rows[0].count > 0) {
      console.log('\n👀 Sample Users:')
      const sampleUsers = await client.query('SELECT name, role, github_username FROM users LIMIT 5')
      sampleUsers.rows.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.github_username || 'No GitHub'}`)
      })
    }

    if (eventCount.rows[0].count > 0) {
      console.log('\n📅 Sample Events:')
      const sampleEvents = await client.query(`
        SELECT e.title, e.event_date,
               (SELECT COUNT(*) FROM sessions s WHERE s.event_id = e.id) as session_count,
               (SELECT COUNT(*) FROM event_photos ep WHERE ep.event_id = e.id) as photo_count
        FROM events e
        LIMIT 2
      `)
      sampleEvents.rows.forEach(event => {
        console.log(`   - ${event.title} (${event.event_date.toISOString().split('T')[0]})`)
        console.log(`     Sessions: ${event.session_count}, Photos: ${event.photo_count}`)
      })
    }

    // Summary
    const totalIssues = parseInt(orphanedSessions.rows[0].count) + parseInt(orphanedPhotos.rows[0].count)
    if (totalIssues === 0) {
      console.log('\n✅ Data integrity check PASSED')
    } else {
      console.log(`\n⚠️  Data integrity check found ${totalIssues} issues`)
    }

    console.log('\n🎉 Verification complete!')

  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run verification
verifyDataIntegrity()
