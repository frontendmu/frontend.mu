import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'
import {
  createPgClient,
  importDataModule,
  nowSql,
  readJsonFile,
  requireFile,
  resolveFrontendmuDataPath,
} from './_helpers.js'

type Person = {
  id: string
  name: string
  imageUrl: string
  linkedin?: string | null
  role?: string | null
}

type SpeakerProfile = {
  github?: string
  bio?: string | null
  website?: string | null
  twitter?: string | null
  job_title?: string | null
}

type Contributor = {
  username: string
  contributions: number
}

type SponsorsModule = Array<{
  title: string
  sponsors?: Array<{
    name: string
    sponsorUrl?: string | null
    description?: string | null
    logo?: string | null
    darkbg?: boolean | null
  }>
}>

function extractGitHubUsername(url: string | null | undefined) {
  if (!url) return null
  const match = url.match(/github\.com\/([^/]+)/)
  return match ? match[1] : null
}

function toTwitterUrl(handle: string | null | undefined) {
  if (!handle) return null
  return `https://twitter.com/${handle.replace('@', '')}`
}

async function migrateData() {
  const client = createPgClient()

  const peoplePath = resolveFrontendmuDataPath('people.js')
  const speakersProfilePath = resolveFrontendmuDataPath('speakers-profile.json')
  const sponsorsPath = resolveFrontendmuDataPath('sponsors.js')
  const contributorsPath = resolveFrontendmuDataPath('contributors.json')

  requireFile(peoplePath)
  requireFile(speakersProfilePath)
  requireFile(sponsorsPath)
  requireFile(contributorsPath)

  const peopleModule = await importDataModule<{
    organizers: Person[]
    communityMembers: Person[]
  }>(peoplePath)
  const speakerProfiles = readJsonFile<SpeakerProfile[]>(speakersProfilePath)
  const sponsorsData = await importDataModule<SponsorsModule>(sponsorsPath)
  const contributors = readJsonFile<Contributor[]>(contributorsPath)

  const profileByGithub = new Map(
    speakerProfiles.filter((profile) => profile.github).map((profile) => [profile.github!, profile])
  )

  const now = nowSql()

  try {
    await client.connect()

    console.log('Migrating users...')
    for (const organizer of peopleModule.organizers) {
      const githubUsername = extractGitHubUsername(organizer.imageUrl)
      const profile = githubUsername ? profileByGithub.get(githubUsername) : null

      await client.query(
        `INSERT INTO users (
          id, name, role, github_username, avatar_url, linkedin_url, twitter_url,
          website_url, featured, is_organizer, is_community_member, bio, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO NOTHING`,
        [
          organizer.id,
          organizer.name,
          'organizer',
          githubUsername,
          organizer.imageUrl,
          organizer.linkedin || null,
          toTwitterUrl(profile?.twitter),
          profile?.website || null,
          true,
          true,
          false,
          profile?.bio || null,
          now,
          now,
        ]
      )
    }

    for (const member of peopleModule.communityMembers) {
      await client.query(
        `INSERT INTO users (
          id, name, role, github_username, avatar_url, featured, is_organizer,
          is_community_member, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO NOTHING`,
        [
          member.id,
          member.name,
          'member',
          extractGitHubUsername(member.imageUrl),
          member.imageUrl,
          false,
          false,
          true,
          now,
          now,
        ]
      )
    }

    const topContributors = contributors
      .filter((contributor) => contributor.contributions >= 10)
      .slice(0, 20)
    for (const contributor of topContributors) {
      const existing = await client.query(
        'SELECT id FROM users WHERE github_username = $1 LIMIT 1',
        [contributor.username]
      )
      if (existing.rows.length > 0) continue

      const profile = profileByGithub.get(contributor.username)
      await client.query(
        `INSERT INTO users (
          id, name, role, github_username, avatar_url, website_url, twitter_url,
          bio, featured, is_organizer, is_community_member, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          randomUUID(),
          profile?.job_title
            ? `${contributor.username} (${profile.job_title})`
            : contributor.username,
          'member',
          contributor.username,
          `https://github.com/${contributor.username}.png`,
          profile?.website || null,
          toTwitterUrl(profile?.twitter),
          profile?.bio || null,
          contributor.contributions > 50,
          false,
          false,
          now,
          now,
        ]
      )
    }

    console.log('Migrating sample events and related records...')
    const sampleEvents = [
      {
        id: randomUUID(),
        title: 'Frontend.mu Meetup #1',
        description: 'First frontend meetup in Mauritius featuring local speakers',
        location: 'Port Louis, Mauritius',
        venue: 'Tech Hub Mauritius',
        eventDate: DateTime.fromISO('2024-03-15T18:00:00'),
        startTime: '18:00',
        endTime: '21:00',
        attendeeCount: 50,
        seatsAvailable: 100,
        acceptingRsvp: true,
        rsvpClosingDate: DateTime.fromISO('2024-03-14T00:00:00'),
        rsvpLink: 'https://eventbrite.com/example1',
        albumName: 'meetup-1',
        coverImageUrl: '/img/events/meetup-1-cover.jpg',
        parkingLocation: 'Nearby parking available',
        mapUrl: 'https://maps.google.com/example1',
      },
      {
        id: randomUUID(),
        title: 'Frontend.mu Meetup #2 - Vue.js Special',
        description: 'Vue.js focused meetup with workshops and talks',
        location: 'Port Louis, Mauritius',
        venue: 'Microsoft Innovation Hub',
        eventDate: DateTime.fromISO('2024-06-20T17:00:00'),
        startTime: '17:00',
        endTime: '20:00',
        attendeeCount: 75,
        seatsAvailable: 120,
        acceptingRsvp: true,
        rsvpClosingDate: DateTime.fromISO('2024-06-18T00:00:00'),
        rsvpLink: 'https://eventbrite.com/example2',
        albumName: 'meetup-2',
        coverImageUrl: '/img/events/meetup-2-cover.jpg',
        parkingLocation: 'Free parking at venue',
        mapUrl: 'https://maps.google.com/example2',
      },
    ]

    const speakerRows = await client.query<{ id: string }>(`
      SELECT id
      FROM users
      WHERE github_username IS NOT NULL
      ORDER BY created_at ASC
      LIMIT 4
    `)

    for (const event of sampleEvents) {
      await client.query(
        `INSERT INTO events (
          id, title, description, location, venue, event_date, start_time, end_time,
          attendee_count, seats_available, accepting_rsvp, rsvp_closing_date, rsvp_link,
          album_name, cover_image_url, parking_location, map_url, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
        ON CONFLICT (id) DO NOTHING`,
        [
          event.id,
          event.title,
          event.description,
          event.location,
          event.venue,
          event.eventDate.toSQL(),
          event.startTime,
          event.endTime,
          event.attendeeCount,
          event.seatsAvailable,
          event.acceptingRsvp,
          event.rsvpClosingDate.toSQL(),
          event.rsvpLink,
          event.albumName,
          event.coverImageUrl,
          event.parkingLocation,
          event.mapUrl,
          'published',
          now,
          now,
        ]
      )

      for (const [index, title] of [
        `Opening Keynote - ${event.title}`,
        'Main Talk: Modern Frontend Development',
        'Q&A and Networking',
      ].entries()) {
        const sessionId = randomUUID()
        await client.query(
          `INSERT INTO sessions (id, event_id, title, description, "order", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            sessionId,
            event.id,
            title,
            index === 0 ? 'Welcome and introduction to the meetup' : null,
            index + 1,
            now,
            now,
          ]
        )

        for (const speaker of speakerRows.rows.slice(0, Math.min(2, speakerRows.rows.length))) {
          await client.query(
            `INSERT INTO session_speakers (session_id, speaker_id, created_at)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [sessionId, speaker.id, now]
          )
        }
      }

      for (const [index, caption] of [
        'Group photo of attendees',
        'Speaker presenting',
        'Networking session',
      ].entries()) {
        await client.query(
          `INSERT INTO event_photos (id, event_id, photo_url, caption, "order", created_at)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            randomUUID(),
            event.id,
            `/img/gallery/${event.albumName}/${index + 1}.jpg`,
            caption,
            index + 1,
            now,
          ]
        )
      }
    }

    console.log('Migrating sponsors...')
    const uniqueSponsors = new Map<
      string,
      {
        id: string
        name: string
        website: string | null
        description: string | null
        logoUrl: string | null
        sponsorTypes: string[]
        logoBg: string | null
      }
    >()

    for (const category of sponsorsData) {
      for (const sponsor of category.sponsors || []) {
        if (!uniqueSponsors.has(sponsor.name)) {
          let sponsorTypes = ['venue']
          if (category.title.includes('Website')) sponsorTypes = ['website']
          else if (category.title.includes('Goodies')) sponsorTypes = ['swag']
          else if (category.title.includes('Partner')) sponsorTypes = ['conference']

          uniqueSponsors.set(sponsor.name, {
            id: randomUUID(),
            name: sponsor.name,
            website: sponsor.sponsorUrl || null,
            description: sponsor.description || null,
            logoUrl: sponsor.logo ? `/img/sponsors/${sponsor.logo}` : null,
            sponsorTypes,
            logoBg: sponsor.darkbg ? '#111827' : null,
          })
        }
      }
    }

    for (const sponsor of uniqueSponsors.values()) {
      await client.query(
        `INSERT INTO sponsors (
          id, name, website, description, logo_url, logomark_url, sponsor_types, logo_bg, status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          sponsor.id,
          sponsor.name,
          sponsor.website,
          sponsor.description,
          sponsor.logoUrl,
          null,
          JSON.stringify(sponsor.sponsorTypes),
          sponsor.logoBg,
          'active',
          now,
          now,
        ]
      )
    }

    const eventRows = await client.query<{ id: string }>(
      'SELECT id FROM events ORDER BY event_date ASC'
    )
    const sponsorRows = await client.query<{ id: string }>(
      'SELECT id FROM sponsors ORDER BY name ASC'
    )
    for (const [index, event] of eventRows.rows.entries()) {
      for (const sponsor of sponsorRows.rows.slice(index * 2, index * 2 + 2)) {
        await client.query(
          `INSERT INTO event_sponsors (event_id, sponsor_id, created_at)
           VALUES ($1, $2, $3)
           ON CONFLICT DO NOTHING`,
          [event.id, sponsor.id, now]
        )
      }
    }

    console.log('Migrating pages...')
    await client.query(
      `INSERT INTO pages (id, slug, title, content, meta_description, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [
        randomUUID(),
        'welcome',
        'Welcome to Frontend.mu',
        'Welcome to the Mauritian frontend community...',
        'Learn about Frontend.mu, the Mauritian frontend community',
        'published',
        now,
        now,
      ]
    )

    const summary = await Promise.all([
      client.query<{ total: string }>('SELECT COUNT(*) AS total FROM users'),
      client.query<{ total: string }>('SELECT COUNT(*) AS total FROM events'),
      client.query<{ total: string }>('SELECT COUNT(*) AS total FROM sessions'),
      client.query<{ total: string }>('SELECT COUNT(*) AS total FROM sponsors'),
    ])

    console.log('Migration summary:')
    console.log({
      users: Number(summary[0].rows[0]?.total || 0),
      events: Number(summary[1].rows[0]?.total || 0),
      sessions: Number(summary[2].rows[0]?.total || 0),
      sponsors: Number(summary[3].rows[0]?.total || 0),
    })
  } catch (error) {
    console.error('Migration failed:', error)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

await migrateData()
