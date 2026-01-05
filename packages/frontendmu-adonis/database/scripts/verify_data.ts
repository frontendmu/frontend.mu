#!/usr/bin/env tsx

/**
 * Data Verification Script
 *
 * This script verifies that all data has been migrated correctly
 * and provides a summary of record counts and data integrity checks.
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
    // Count records in each table
    const userCount = await User.query().count('* as total')
    const eventCount = await Event.query().count('* as total')
    const sessionCount = await Session.query().count('* as total')
    const sponsorCount = await Sponsor.query().count('* as total')
    const photoCount = await EventPhoto.query().count('* as total')
    const pageCount = await Page.query().count('* as total')

    console.log('📊 Record Counts:')
    console.log(`   Users: ${userCount[0].total}`)
    console.log(`   Events: ${eventCount[0].total}`)
    console.log(`   Sessions: ${sessionCount[0].total}`)
    console.log(`   Sponsors: ${sponsorCount[0].total}`)
    console.log(`   Event Photos: ${photoCount[0].total}`)
    console.log(`   Pages: ${pageCount[0].total}`)
    console.log()

    // Check for orphaned records
    console.log('🔗 Checking Relationships:')

    // Check sessions have valid events
    const orphanedSessions = await Session.query()
      .whereNotExists(
        Event.query().whereColumn('events.id', 'sessions.event_id')
      )
      .count('* as total')

    console.log(`   Orphaned sessions: ${orphanedSessions[0].total}`)

    // Check photos have valid events
    const orphanedPhotos = await EventPhoto.query()
      .whereNotExists(
        Event.query().whereColumn('events.id', 'event_photos.event_id')
      )
      .count('* as total')

    console.log(`   Orphaned photos: ${orphanedPhotos[0].total}`)

    // Check users by role
    const organizers = await User.query().where('role', 'organizer').count('* as total')
    const speakers = await User.query().where('role', 'speaker').count('* as total')
    const communityMembers = await User.query().where('role', 'community_member').count('* as total')

    console.log('\n👥 User Distribution:')
    console.log(`   Organizers: ${organizers[0].total}`)
    console.log(`   Speakers: ${speakers[0].total}`)
    console.log(`   Community Members: ${communityMembers[0].total}`)

    // Check events by status
    const publishedEvents = await Event.query().where('status', 'published').count('* as total')
    const draftEvents = await Event.query().where('status', 'draft').count('* as total')

    console.log('\n📅 Event Status:')
    console.log(`   Published: ${publishedEvents[0].total}`)
    console.log(`   Draft: ${draftEvents[0].total}`)

    // Check sponsors by status
    const activeSponsors = await Sponsor.query().where('status', 'active').count('* as total')

    console.log('\n🏢 Sponsor Status:')
    console.log(`   Active: ${activeSponsors[0].total}`)

    // Check sessions per event
    const eventsWithSessions = await Event.query()
      .has('sessions')
      .count('* as total')

    console.log('\n🎤 Events with Sessions:')
    console.log(`   Events with sessions: ${eventsWithSessions[0].total}`)

    // Sample data check
    if (userCount[0].total > 0) {
      console.log('\n👀 Sample Users:')
      const sampleUsers = await User.query().limit(3)
      sampleUsers.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.githubUsername || 'No GitHub'}`)
      })
    }

    if (eventCount[0].total > 0) {
      console.log('\n📅 Sample Events:')
      const sampleEvents = await Event.query().limit(2)
      for (const event of sampleEvents) {
        const sessionCount = await event.related('sessions').query().count('* as total')
        const photoCount = await event.related('photos').query().count('* as total')
        console.log(`   - ${event.title} (${event.eventDate.toISOString().split('T')[0]})`)
        console.log(`     Sessions: ${sessionCount[0].total}, Photos: ${photoCount[0].total}`)
      }
    }

    // Summary
    const totalIssues = parseInt(orphanedSessions[0].total) + parseInt(orphanedPhotos[0].total)
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
    await db.manager.closeAll()
  }
}

// Run verification
verifyDataIntegrity()
