#!/usr/bin/env node

/**
 * Simple data migration script using raw SQL
 * This avoids TypeScript compilation issues with the full AdonisJS framework
 */

import pkg from 'pg'
const { Client } = pkg
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Database connection
const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

// Utility functions
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

function extractGitHubUsername(url) {
  if (!url) return null
  const match = url.match(/github\.com\/([^\/]+)/)
  return match ? match[1] : null
}

// Load data files
function loadDataFiles() {
  try {
    const peoplePath = path.join(__dirname, '../../../frontendmu-data/data/people.js')
    const peopleContent = fs.readFileSync(peoplePath, 'utf8')

    // Extract the exported arrays from the JS file
    const organizersMatch = peopleContent.match(/export const organizers = (\[[\s\S]*?\]);/)
    const communityMembersMatch = peopleContent.match(/export const communityMembers = (\[[\s\S]*?\]);/)

    const organizers = organizersMatch ? eval(organizersMatch[1]) : []
    const communityMembers = communityMembersMatch ? eval(communityMembersMatch[1]) : []

    // Load speakers profile
    const speakersProfilePath = path.join(__dirname, '../../../frontendmu-data/data/speakers-profile.json')
    const speakersProfile = JSON.parse(fs.readFileSync(speakersProfilePath, 'utf8'))

    // Load real meetups data
    const meetupsPath = path.join(__dirname, '../../../frontendmu-data/data/meetups-raw.json')
    const meetups = JSON.parse(fs.readFileSync(meetupsPath, 'utf8'))

    // Load sponsors - manually create the data since eval is problematic
    const sponsors = [
      {
        title: "Website Sponsor",
        description: "Having an online presence is not free. We pay for a domain name yearly and we are grateful for the support of our website sponsors.",
        sponsors: [
          {
            name: "Upcode.mu",
            sponsorUrl: "https://upcode.mu",
            logo: "logo-upcode.svg",
            description: "Domain Name",
          },
          {
            name: "Cloud.mu",
            sponsorUrl: "https://cloud.mu",
            logo: "logo-cloud_mu.svg",
            description: "Hosting",
          },
        ],
      },
      {
        title: "Goodies Sponsors",
        description: "Goodies are a great way to show your appreciation to our speakers and attendees.",
        sponsors: [
          {
            name: "Jetbrains",
            sponsorUrl: "https://www.jetbrains.com/",
            logo: "jetbrains.svg",
            description: "Licenses for raffles",
          },
        ],
      },
      {
        title: "Partner",
        description: "Goodies are a great way to show your appreciation to our speakers and attendees.",
        sponsors: [
          {
            name: "JSNation",
            sponsorUrl: "https://www.jsnation.com/",
            logo: "gitnation_jsnation_dark.png",
            description: "Conference Tickets & Discounts",
          },
          {
            name: "VueJS London",
            sponsorUrl: "https://vuejslive.com/",
            logo: "gitnation_vuejslondon.png",
            description: "Conference Tickets & Discounts",
          },
        ],
      }
    ]

    // Load contributors
    const contributorsPath = path.join(__dirname, '../../../frontendmu-data/data/contributors.json')
    const contributors = JSON.parse(fs.readFileSync(contributorsPath, 'utf8'))

    // Load photos data
    const photosPath = path.join(__dirname, '../../../frontendmu-data/data/photos-raw.json')
    const photosData = JSON.parse(fs.readFileSync(photosPath, 'utf8'))

    return { organizers, communityMembers, speakersProfile, sponsors, contributors, meetups, photosData }
  } catch (error) {
    console.error('Error loading data files:', error.message)
    return { organizers: [], communityMembers: [], speakersProfile: [], sponsors: [], contributors: [], meetups: [], photosData: {} }
  }
}

async function migrateUsers(data) {
  console.log('🔄 Migrating users...')

  // Migrate organizers
  for (const organizer of data.organizers) {
    const githubUsername = extractGitHubUsername(organizer.imageUrl)

    const profileData = data.speakersProfile.find(p => p.github === githubUsername)

    await client.query(`
      INSERT INTO users (id, name, email, github_username, avatar_url, role, bio, linkedin_url, twitter_url, website_url, featured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [
      organizer.id,
      organizer.name,
      null, // email
      githubUsername,
      organizer.imageUrl,
      'organizer',
      profileData?.bio || null,
      organizer.linkedin || null,
      profileData?.twitter ? `https://twitter.com/${profileData.twitter.replace('@', '')}` : null,
      profileData?.website || null,
      true, // featured
    ])

    console.log(`✅ Created organizer: ${organizer.name}`)
  }

  // Migrate community members
  for (const member of data.communityMembers) {
    const githubUsername = extractGitHubUsername(member.imageUrl)

    await client.query(`
      INSERT INTO users (id, name, email, github_username, avatar_url, role, bio, linkedin_url, twitter_url, website_url, featured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [
      member.id,
      member.name,
      null, // email
      githubUsername,
      member.imageUrl,
      'community_member',
      null, // bio
      null, // linkedin
      null, // twitter
      null, // website
      false, // featured
    ])

    console.log(`✅ Created community member: ${member.name}`)
  }

  // Create speakers from top contributors
  const topContributors = data.contributors
    .filter(c => c.contributions >= 10)
    .slice(0, 20)

  for (const contributor of topContributors) {
    const existing = await client.query('SELECT id FROM users WHERE github_username = $1', [contributor.username])
    if (existing.rows.length > 0) continue

    const profileData = data.speakersProfile.find(p => p.github === contributor.username)

    await client.query(`
      INSERT INTO users (id, name, email, github_username, avatar_url, role, bio, linkedin_url, twitter_url, website_url, featured, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    `, [
      generateUUID(),
      profileData?.job_title ? `${contributor.username} (${profileData.job_title})` : contributor.username,
      null, // email
      contributor.username,
      `https://github.com/${contributor.username}.png`,
      'speaker',
      profileData?.bio || null,
      null, // linkedin
      profileData?.twitter ? `https://twitter.com/${profileData.twitter.replace('@', '')}` : null,
      profileData?.website || null,
      contributor.contributions > 50, // featured
    ])

    console.log(`✅ Created speaker: ${contributor.username}`)
  }

  console.log('✅ Users migration complete')
}

async function migrateEvents(data) {
  console.log('🔄 Migrating events...')

  // Create a mapping of original IDs to UUIDs for foreign key relationships
  const eventIdMap = new Map()

  // Use real meetups data
  for (const event of data.meetups) {
    const originalId = event.id
    const uuid = generateUUID()
    eventIdMap.set(originalId, uuid)
    // Parse time string to extract start and end times
    let startTime = null
    let endTime = null

    if (event.Time) {
      // Convert time formats to HH:MM
      const convertTime = (timeStr) => {
        const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/)
        if (!match) return null

        let hour = parseInt(match[1])
        const minute = match[2] ? parseInt(match[2]) : 0
        const ampm = match[3]?.toLowerCase()

        if (ampm === 'pm' && hour < 12) hour += 12
        if (ampm === 'am' && hour === 12) hour = 0

        return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      }

      // Try to extract times from various formats like "10am to 2pm" or "10:00 - 14:00"
      const timeMatch = event.Time.match(/(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)/)
      if (timeMatch) {
        startTime = convertTime(timeMatch[1].trim())
        endTime = convertTime(timeMatch[2].trim())
      }
    }

    // Convert date format if needed
    let eventDate = event.Date
    if (eventDate && eventDate.includes('/')) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = eventDate.split('/')
      if (parts.length === 3) {
        eventDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      }
    }

    await client.query(`
      INSERT INTO events (id, title, description, location, venue, event_date, start_time, end_time, attendee_count, seats_available, accepting_rsvp, rsvp_closing_date, rsvp_link, album_name, cover_image_url, parking_location, map_url, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW())
      ON CONFLICT (id) DO NOTHING
    `, [
      uuid, // Use generated UUID
      event.title || 'Untitled Event',
      event.description || null,
      event.Location || null,
      event.Venue || null,
      eventDate,
      startTime,
      endTime,
      event.Attendees || 0,
      event.seats_available || null,
      event.accepting_rsvp || false,
      event.rsvp_closing_date ? new Date(event.rsvp_closing_date) : null,
      event.rsvplink || null,
      event.album || null,
      null, // cover_image_url - will be set later if available
      event.parking_location || null,
      event.map || null,
      'published', // Default to published
    ])

    console.log(`✅ Created event: ${event.title} (${event.Date})`)
  }

  console.log(`✅ Events migration complete - ${data.meetups.length} events migrated`)
  return eventIdMap
}

async function migrateSessions(data, eventIdMap) {
  console.log('🔄 Migrating sessions...')

  const sessionIdMap = new Map()

  for (const event of data.meetups) {
    const eventUuid = eventIdMap.get(event.id)
    if (!eventUuid) continue
    if (!event.sessions || !Array.isArray(event.sessions)) continue

    for (const session of event.sessions) {
      const sessionUuid = generateUUID()
      sessionIdMap.set(session.id, sessionUuid)

      // Extract speaker information from session data
      let speakerName = null
      let githubUsername = null

      if (session.Session_id && session.Session_id.speakers) {
        speakerName = session.Session_id.speakers.name || null
        githubUsername = session.Session_id.speakers.github_account || null
      }

      // Find speaker user by name or GitHub username
      let speakerId = null
      if (speakerName || githubUsername) {
        let speakerQuery = 'SELECT id FROM users WHERE '
        let params = []
        let conditions = []

        if (speakerName) {
          conditions.push('name ILIKE $' + (params.length + 1))
          params.push(`%${speakerName}%`)
        }

        if (githubUsername) {
          conditions.push('github_username = $' + (params.length + 1))
          params.push(githubUsername)
        }

        if (conditions.length > 0) {
          speakerQuery += conditions.join(' OR ')
          const speakerResult = await client.query(speakerQuery, params)
          if (speakerResult.rows.length > 0) {
            speakerId = speakerResult.rows[0].id
          }
        }
      }

      await client.query(`
        INSERT INTO sessions (id, event_id, title, description, "order", created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        sessionUuid,
        eventUuid,
        session.Session_id?.title || 'Untitled Session',
        session.Session_id?.description || null,
        session.Session_id?.sort || null,
      ])

      // Link speaker to session if found
      if (speakerId) {
        await client.query(`
          INSERT INTO session_speakers (session_id, speaker_id, created_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (session_id, speaker_id) DO NOTHING
        `, [sessionUuid, speakerId])
      }

      console.log(`✅ Created session: ${session.Session_id?.title || 'Untitled'} ${speakerName ? `by ${speakerName}` : ''}`)
    }
  }

  console.log('✅ Sessions migration complete')
  return sessionIdMap
}

async function migrateSponsors(data) {
  console.log('🔄 Migrating sponsors...')

  // Flatten sponsors from nested structure
  const allSponsors = []

  data.sponsors.forEach(category => {
    if (category.sponsors) {
      category.sponsors.forEach(sponsor => {
        let sponsorTypes = []
        if (category.title.includes('Website')) sponsorTypes = ['website']
        else if (category.title.includes('Goodies')) sponsorTypes = ['swag']
        else if (category.title.includes('Partner')) sponsorTypes = ['conference']
        else sponsorTypes = ['venue']

        allSponsors.push({
          name: sponsor.name,
          website: sponsor.sponsorUrl,
          description: sponsor.description,
          logoUrl: `/img/sponsors/${sponsor.logo}`,
          sponsorTypes,
          darkbg: false,
          status: 'active',
        })
      })
    }
  })

  // Remove duplicates
  const uniqueSponsors = allSponsors.filter((sponsor, index, self) =>
    index === self.findIndex(s => s.name === sponsor.name)
  )

  for (const sponsor of uniqueSponsors) {
    const sponsorId = generateUUID()

    await client.query(`
      INSERT INTO sponsors (id, name, website, description, logo_url, logomark_url, sponsor_types, darkbg, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    `, [
      sponsorId,
      sponsor.name,
      sponsor.website,
      sponsor.description,
      sponsor.logoUrl,
      null, // logomark_url
      JSON.stringify(sponsor.sponsorTypes),
      sponsor.darkbg,
      sponsor.status,
    ])

    console.log(`✅ Created sponsor: ${sponsor.name}`)
  }

  console.log('✅ Sponsors migration complete')
}

async function migrateEventSponsors() {
  console.log('🔄 Migrating event-sponsor relationships...')

  const events = await client.query('SELECT id, title FROM events')
  const sponsors = await client.query('SELECT id, name FROM sponsors')

  for (let i = 0; i < events.rows.length; i++) {
    const event = events.rows[i]
    const eventSponsors = sponsors.rows.slice(i * 2, (i + 1) * 2) // 2 sponsors per event

    for (const sponsor of eventSponsors) {
      await client.query(`
        INSERT INTO event_sponsors (event_id, sponsor_id, created_at)
        VALUES ($1, $2, NOW())
      `, [event.id, sponsor.id])

      console.log(`✅ Linked sponsor ${sponsor.name} to event ${event.title}`)
    }
  }

  console.log('✅ Event-sponsors migration complete')
}

async function migrateEventPhotos(data) {
  console.log('🔄 Migrating event photos...')

  const events = await client.query('SELECT id, title, album_name FROM events WHERE album_name IS NOT NULL')

  for (const event of events.rows) {
    // Check if we have photos for this album
    const albumPhotos = data.photosData[event.album_name]
    if (!albumPhotos || !Array.isArray(albumPhotos)) continue

    for (let i = 0; i < albumPhotos.length; i++) {
      const photo = albumPhotos[i]

      await client.query(`
        INSERT INTO event_photos (id, event_id, photo_url, caption, "order", created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (id) DO NOTHING
      `, [
        generateUUID(),
        event.id,
        photo.imagename || `/img/gallery/${event.album_name}/${i + 1}.jpg`,
        photo.caption || null,
        i + 1,
      ])

      console.log(`✅ Created photo for event: ${event.title} (${i + 1}/${albumPhotos.length})`)
    }
  }

  console.log('✅ Event photos migration complete')
}

async function migratePages() {
  console.log('🔄 Migrating pages...')

  const pages = [
    {
      id: generateUUID(),
      slug: 'welcome',
      title: 'Welcome to Frontend.mu',
      content: 'Welcome to the Mauritian frontend community...',
      metaDescription: 'Learn about Frontend.mu, the Mauritian frontend community',
      status: 'published',
    }
  ]

  for (const page of pages) {
    await client.query(`
      INSERT INTO pages (id, slug, title, content, meta_description, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    `, [
      page.id,
      page.slug,
      page.title,
      page.content,
      page.metaDescription,
      page.status,
    ])

    console.log(`✅ Created page: ${page.title}`)
  }

  console.log('✅ Pages migration complete')
}

async function runMigration() {
  console.log('🚀 Starting data migration...')

  try {
    await client.connect()
    console.log('✅ Connected to database')

    const data = loadDataFiles()
    console.log('✅ Loaded data files')

    await migrateUsers(data)
    const eventIdMap = await migrateEvents(data)
    const sessionIdMap = await migrateSessions(data, eventIdMap)
    await migrateSponsors(data)
    await migrateEventSponsors()
    await migrateEventPhotos(data)
    await migratePages()

    console.log('🎉 Data migration completed successfully!')

    // Show summary
    const userCount = await client.query('SELECT COUNT(*) as count FROM users')
    const eventCount = await client.query('SELECT COUNT(*) as count FROM events')
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM sessions')
    const sponsorCount = await client.query('SELECT COUNT(*) as count FROM sponsors')

    console.log('\n📊 Migration Summary:')
    console.log(`   Users: ${userCount.rows[0].count}`)
    console.log(`   Events: ${eventCount.rows[0].count}`)
    console.log(`   Sessions: ${sessionCount.rows[0].count}`)
    console.log(`   Sponsors: ${sponsorCount.rows[0].count}`)

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run the migration
runMigration()
