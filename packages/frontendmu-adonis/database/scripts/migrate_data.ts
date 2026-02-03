import { Database } from '@adonisjs/lucid/database'
import { BaseModel } from '@adonisjs/lucid/orm'
import { crypto } from 'node:crypto'

// Initialize the database connection
const db = new Database({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'frontendmu_dev',
      },
    },
  },
})

// Set the database instance for models
BaseModel.useConnection(db.connection())

// Import models
import User from '#models/user'
import Event from '#models/event'
import Session from '#models/session'
import Sponsor from '#models/sponsor'
import EventPhoto from '#models/event_photo'
import Page from '#models/page'

// Import data sources
import { organizers, communityMembers } from '../../../../frontendmu-data/data/people.js'
import speakersProfile from '../../../../frontendmu-data/data/speakers-profile.json'
import sponsorsData from '../../../../frontendmu-data/data/sponsors.js'
import contributors from '../../../../frontendmu-data/data/contributors.json'

// Utility function to generate UUID
function generateUUID(): string {
  return crypto.randomUUID()
}

// Utility function to parse date string
function parseDate(dateString: string): Date {
  return new Date(dateString)
}

// Utility function to extract GitHub username from URL
function extractGitHubUsername(url: string): string | null {
  if (!url) return null
  const match = url.match(/github\.com\/([^\/]+)/)
  return match ? match[1] : null
}

async function migrateUsers() {
  console.log('🔄 Migrating users...')

  // Migrate organizers
  for (const organizer of organizers) {
    const githubUsername = extractGitHubUsername(organizer.imageUrl)

    const user = new User()
    user.id = organizer.id
    user.name = organizer.name
    user.role = 'organizer'
    user.githubUsername = githubUsername
    user.avatarUrl = organizer.imageUrl
    user.linkedinUrl = organizer.linkedin || null
    user.twitterUrl = null
    user.websiteUrl = null
    user.featured = true
    user.bio = null

    // Try to find additional profile data
    const profileData = speakersProfile.find((p) => p.github === githubUsername)
    if (profileData) {
      user.bio = profileData.bio
      user.websiteUrl = profileData.website || null
      user.twitterUrl = profileData.twitter
        ? `https://twitter.com/${profileData.twitter.replace('@', '')}`
        : null
    }

    await user.save()
    console.log(`✅ Created organizer: ${user.name}`)
  }

  // Migrate community members
  for (const member of communityMembers) {
    const githubUsername = extractGitHubUsername(member.imageUrl)

    const user = new User()
    user.id = member.id
    user.name = member.name
    user.role = 'community_member'
    user.githubUsername = githubUsername
    user.avatarUrl = member.imageUrl
    user.linkedinUrl = null
    user.twitterUrl = null
    user.websiteUrl = null
    user.featured = false
    user.bio = null

    await user.save()
    console.log(`✅ Created community member: ${user.name}`)
  }

  // Create speaker users from contributors with high contribution counts
  const topContributors = contributors.filter((c) => c.contributions >= 10).slice(0, 20) // Limit to top 20 contributors

  for (const contributor of topContributors) {
    // Check if user already exists
    const existingUser = await User.findBy('githubUsername', contributor.username)
    if (existingUser) continue

    const user = new User()
    user.id = generateUUID()
    user.name = contributor.username // We'll use GitHub username as name for now
    user.role = 'speaker'
    user.githubUsername = contributor.username
    user.avatarUrl = `https://github.com/${contributor.username}.png`
    user.linkedinUrl = null
    user.twitterUrl = null
    user.websiteUrl = null
    user.featured = contributor.contributions > 50
    user.bio = null

    // Try to find additional profile data
    const profileData = speakersProfile.find((p) => p.github === contributor.username)
    if (profileData) {
      user.name = profileData.job_title
        ? `${contributor.username} (${profileData.job_title})`
        : contributor.username
      user.bio = profileData.bio
      user.websiteUrl = profileData.website || null
      user.twitterUrl = profileData.twitter
        ? `https://twitter.com/${profileData.twitter.replace('@', '')}`
        : null
    }

    await user.save()
    console.log(`✅ Created speaker: ${user.name}`)
  }

  console.log('✅ Users migration complete')
}

async function migrateEvents() {
  console.log('🔄 Migrating events...')

  // Since meetups-raw.json is empty, create some sample events for testing
  const sampleEvents = [
    {
      id: generateUUID(),
      title: 'Frontend.mu Meetup #1',
      description: 'First frontend meetup in Mauritius featuring local speakers',
      location: 'Port Louis, Mauritius',
      venue: 'Tech Hub Mauritius',
      eventDate: new Date('2024-03-15'),
      startTime: '18:00',
      endTime: '21:00',
      attendeeCount: 50,
      seatsAvailable: 100,
      acceptingRsvp: true,
      rsvpClosingDate: new Date('2024-03-14'),
      rsvpLink: 'https://eventbrite.com/example1',
      albumName: 'meetup-1',
      coverImageUrl: '/img/events/meetup-1-cover.jpg',
      parkingLocation: 'Nearby parking available',
      mapUrl: 'https://maps.google.com/example1',
      status: 'published' as const,
    },
    {
      id: generateUUID(),
      title: 'Frontend.mu Meetup #2 - Vue.js Special',
      description: 'Vue.js focused meetup with workshops and talks',
      location: 'Port Louis, Mauritius',
      venue: 'Microsoft Innovation Hub',
      eventDate: new Date('2024-06-20'),
      startTime: '17:00',
      endTime: '20:00',
      attendeeCount: 75,
      seatsAvailable: 120,
      acceptingRsvp: true,
      rsvpClosingDate: new Date('2024-06-18'),
      rsvpLink: 'https://eventbrite.com/example2',
      albumName: 'meetup-2',
      coverImageUrl: '/img/events/meetup-2-cover.jpg',
      parkingLocation: 'Free parking at venue',
      mapUrl: 'https://maps.google.com/example2',
      status: 'published' as const,
    },
  ]

  for (const eventData of sampleEvents) {
    const event = new Event()
    Object.assign(event, eventData)
    await event.save()
    console.log(`✅ Created event: ${event.title}`)
  }

  console.log('✅ Events migration complete')
}

async function migrateSessions() {
  console.log('🔄 Migrating sessions...')

  // Get all events
  const events = await Event.all()

  for (const event of events) {
    // Create sample sessions for each event
    const sessions = [
      {
        id: generateUUID(),
        eventId: event.id,
        title: `Opening Keynote - ${event.title}`,
        description: 'Welcome and introduction to the meetup',
        order: 1,
      },
      {
        id: generateUUID(),
        eventId: event.id,
        title: 'Main Talk: Modern Frontend Development',
        description: 'Deep dive into modern frontend technologies',
        order: 2,
      },
      {
        id: generateUUID(),
        eventId: event.id,
        title: 'Q&A and Networking',
        description: 'Open discussion and networking session',
        order: 3,
      },
    ]

    for (const sessionData of sessions) {
      const session = new Session()
      Object.assign(session, sessionData)
      await session.save()

      // Add speakers to sessions
      const speakers = await User.query().where('role', 'speaker').limit(2)
      await session.related('speakers').attach(speakers.map((s) => s.id))

      console.log(`✅ Created session: ${session.title}`)
    }
  }

  console.log('✅ Sessions migration complete')
}

async function migrateSponsors() {
  console.log('🔄 Migrating sponsors...')

  // Flatten sponsors from the nested structure
  const allSponsors: any[] = []

  sponsorsData.forEach((category) => {
    if (category.sponsors) {
      category.sponsors.forEach((sponsor: any) => {
        // Map sponsor types based on category
        let sponsorTypes: string[] = []
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
          status: 'active' as const,
        })
      })
    }
  })

  // Remove duplicates
  const uniqueSponsors = allSponsors.filter(
    (sponsor, index, self) => index === self.findIndex((s) => s.name === sponsor.name)
  )

  for (const sponsorData of uniqueSponsors) {
    const sponsor = new Sponsor()
    sponsor.id = generateUUID()
    Object.assign(sponsor, sponsorData)
    await sponsor.save()
    console.log(`✅ Created sponsor: ${sponsor.name}`)
  }

  console.log('✅ Sponsors migration complete')
}

async function migrateEventSponsors() {
  console.log('🔄 Migrating event-sponsor relationships...')

  // Get all events and sponsors
  const events = await Event.all()
  const sponsors = await Sponsor.all()

  // Link sponsors to events (sample relationships)
  for (const [i, event] of events.entries()) {
    const eventSponsors = sponsors.slice(i * 2, (i + 1) * 2) // 2 sponsors per event

    for (const sponsor of eventSponsors) {
      await event.related('sponsors').attach([sponsor.id])
      console.log(`✅ Linked sponsor ${sponsor.name} to event ${event.title}`)
    }
  }

  console.log('✅ Event-sponsors migration complete')
}

async function migrateEventPhotos() {
  console.log('🔄 Migrating event photos...')

  // Since photos-raw.json is empty, create sample photos
  const events = await Event.all()

  for (const event of events) {
    const photos = [
      {
        id: generateUUID(),
        eventId: event.id,
        photoUrl: `/img/gallery/${event.albumName}/1.jpg`,
        caption: 'Group photo of attendees',
        order: 1,
      },
      {
        id: generateUUID(),
        eventId: event.id,
        photoUrl: `/img/gallery/${event.albumName}/2.jpg`,
        caption: 'Speaker presenting',
        order: 2,
      },
      {
        id: generateUUID(),
        eventId: event.id,
        photoUrl: `/img/gallery/${event.albumName}/3.jpg`,
        caption: 'Networking session',
        order: 3,
      },
    ]

    for (const photoData of photos) {
      const photo = new EventPhoto()
      Object.assign(photo, photoData)
      await photo.save()
      console.log(`✅ Created photo for event: ${event.title}`)
    }
  }

  console.log('✅ Event photos migration complete')
}

async function migratePages() {
  console.log('🔄 Migrating pages...')

  // Create some sample pages (static content will be handled separately)
  const pages = [
    {
      id: generateUUID(),
      slug: 'welcome',
      title: 'Welcome to Frontend.mu',
      content: 'Welcome to the Mauritian frontend community...',
      metaDescription: 'Learn about Frontend.mu, the Mauritian frontend community',
      status: 'published' as const,
    },
  ]

  for (const pageData of pages) {
    const page = new Page()
    Object.assign(page, pageData)
    await page.save()
    console.log(`✅ Created page: ${page.title}`)
  }

  console.log('✅ Pages migration complete')
}

async function runMigration() {
  console.log('🚀 Starting data migration...')

  try {
    await migrateUsers()
    await migrateEvents()
    await migrateSessions()
    await migrateSponsors()
    await migrateEventSponsors()
    await migrateEventPhotos()
    await migratePages()

    console.log('🎉 Data migration completed successfully!')

    // Verification
    const userCount = await User.query().count('* as total')
    const eventCount = await Event.query().count('* as total')
    const sessionCount = await Session.query().count('* as total')
    const sponsorCount = await Sponsor.query().count('* as total')

    console.log('\n📊 Migration Summary:')
    console.log(`   Users: ${userCount[0].total}`)
    console.log(`   Events: ${eventCount[0].total}`)
    console.log(`   Sessions: ${sessionCount[0].total}`)
    console.log(`   Sponsors: ${sponsorCount[0].total}`)
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await db.manager.closeAll()
  }
}

// Run the migration
runMigration()
