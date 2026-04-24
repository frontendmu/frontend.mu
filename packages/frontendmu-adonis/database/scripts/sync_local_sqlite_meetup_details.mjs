#!/usr/bin/env node

import Database from 'better-sqlite3'
import { sqlNow } from '#database/sql_now'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const workspaceDir = join(scriptDir, '..', '..')
const repoRootDir = join(workspaceDir, '..', '..')
const dbPath = join(workspaceDir, 'database', 'db.local.sqlite3')

// WARNING: This dev-only sync rewrites matched event child rows by deleting and
// recreating sessions, speaker links, sponsor links, and event photos.
const meetups = JSON.parse(
  readFileSync(join(repoRootDir, 'packages', 'frontendmu-data', 'data', 'meetups-raw.json'), 'utf8')
)
const speakers = JSON.parse(
  readFileSync(join(repoRootDir, 'packages', 'frontendmu-data', 'data', 'speakers-raw.json'), 'utf8')
)
const sponsors = JSON.parse(
  readFileSync(join(repoRootDir, 'packages', 'frontendmu-data', 'data', 'sponsors-raw.json'), 'utf8')
)
const photosByAlbum = JSON.parse(
  readFileSync(join(repoRootDir, 'packages', 'frontendmu-data', 'data', 'photos-raw.json'), 'utf8')
)

const db = new Database(dbPath)
db.pragma('foreign_keys = ON')

const speakerById = new Map(speakers.map((speaker) => [speaker.id, speaker]))
const sponsorById = new Map(sponsors.map((sponsor) => [sponsor.id, sponsor]))

function sqlFromIso(value) {
  if (!value) return null
  return value.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '')
}

function normalizeNullableNumber(value) {
  return value === undefined || value === null ? null : Number(value)
}

function normalizeNullableBoolean(value) {
  if (value === undefined || value === null) return null
  return value ? 1 : 0
}

function findEvent(meetup) {
  const year = String(meetup.Date || '').slice(0, 4)
  const matches = db
    .prepare(
      `
        SELECT id, slug, title, event_date, album_name
        FROM events
        WHERE title = ?
          AND substr(event_date, 1, 4) = ?
        ORDER BY event_date ASC
      `
    )
    .all(meetup.title, year)

  if (matches.length === 1) return matches[0]

  if (matches.length > 1) {
    const exactDate = matches.find((row) => String(row.event_date).startsWith(meetup.Date))
    if (exactDate) return exactDate
  }

  return null
}

const upsertUser = db.prepare(`
  INSERT INTO users (
    id, name, github_username, avatar_url, featured, created_at, updated_at, role,
    is_organizer, is_community_member
  ) VALUES (
    @id, @name, @github_username, @avatar_url, 0, @created_at, @updated_at, 'member', 0, 0
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    github_username = COALESCE(users.github_username, excluded.github_username),
    avatar_url = COALESCE(users.avatar_url, excluded.avatar_url),
    updated_at = excluded.updated_at
`)

const upsertSponsor = db.prepare(`
  INSERT INTO sponsors (
    id, name, website, description, logo_url, logomark_url, sponsor_types, status, created_at, updated_at, logo_bg
  ) VALUES (
    @id, @name, @website, @description, @logo_url, @logomark_url, @sponsor_types, 'active', @created_at, @updated_at, @logo_bg
  )
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    website = excluded.website,
    description = excluded.description,
    logo_url = excluded.logo_url,
    logomark_url = excluded.logomark_url,
    sponsor_types = excluded.sponsor_types,
    updated_at = excluded.updated_at,
    logo_bg = excluded.logo_bg
`)

const updateEvent = db.prepare(`
  UPDATE events
  SET description = @description,
      location = @location,
      venue = @venue,
      start_time = COALESCE(@start_time, start_time),
      end_time = COALESCE(@end_time, end_time),
      attendee_count = COALESCE(@attendee_count, attendee_count),
      seats_available = @seats_available,
      accepting_rsvp = COALESCE(@accepting_rsvp, accepting_rsvp),
      rsvp_closing_date = @rsvp_closing_date,
      rsvp_link = @rsvp_link,
      album_name = COALESCE(@album_name, album_name),
      parking_location = @parking_location,
      map_url = @map_url,
      updated_at = @updated_at
  WHERE id = @id
`)

const deleteSessionLinksByEvent = db.prepare(
  `DELETE FROM session_speakers WHERE session_id IN (SELECT id FROM sessions WHERE event_id = ?)`
)
const deleteSessionsByEvent = db.prepare(`DELETE FROM sessions WHERE event_id = ?`)
const deleteEventSponsorsByEvent = db.prepare(`DELETE FROM event_sponsors WHERE event_id = ?`)
const deleteEventPhotosByEvent = db.prepare(`DELETE FROM event_photos WHERE event_id = ?`)

const insertSession = db.prepare(`
  INSERT INTO sessions (
    id, event_id, title, description, "order", kind, sponsor_id, duration_minutes, created_at, updated_at
  ) VALUES (
    @id, @event_id, @title, @description, @order, @kind, @sponsor_id, @duration_minutes, @created_at, @updated_at
  )
`)

const insertSessionSpeaker = db.prepare(`
  INSERT OR IGNORE INTO session_speakers (session_id, speaker_id, created_at)
  VALUES (?, ?, ?)
`)

const insertEventSponsor = db.prepare(`
  INSERT OR IGNORE INTO event_sponsors (event_id, sponsor_id, created_at)
  VALUES (?, ?, ?)
`)

const insertEventPhoto = db.prepare(`
  INSERT INTO event_photos (id, event_id, photo_url, caption, "order", created_at)
  VALUES (?, ?, ?, NULL, ?, ?)
`)

function ensureSpeakerUser(speakerRef, now) {
  const speakerId = typeof speakerRef === 'string' ? speakerRef : speakerRef?.id
  if (!speakerId) return null

  const existingById = db.prepare(`SELECT id FROM users WHERE id = ?`).get(speakerId)
  if (existingById) return existingById.id

  const embeddedSpeaker = typeof speakerRef === 'object' ? speakerRef : null
  const speaker = speakerById.get(speakerId) || embeddedSpeaker
  if (!speaker) return null

  const githubUsername = speaker.github_account || null
  if (githubUsername) {
    const existingByGithub = db
      .prepare(`SELECT id FROM users WHERE github_username = ?`)
      .get(githubUsername)

    if (existingByGithub) {
      return existingByGithub.id
    }
  }

  upsertUser.run({
    id: speakerId,
    name: speaker.name,
    github_username: githubUsername,
    avatar_url: githubUsername ? `https://github.com/${githubUsername}.png` : null,
    created_at: now,
    updated_at: now,
  })

  return speakerId
}

function ensureSponsorRecord(rawSponsor, now) {
  const sponsorId = rawSponsor?.Sponsor_id?.id || rawSponsor?.id
  if (!sponsorId) return null

  const sponsor = rawSponsor?.Sponsor_id || sponsorById.get(sponsorId)
  if (!sponsor) return null

  upsertSponsor.run({
    id: sponsor.id,
    name: sponsor.Name || sponsor.name,
    website: sponsor.Website || sponsor.website || null,
    description: sponsor.Description || sponsor.description || null,
    logo_url:
      sponsor.Logo?.filename_disk ||
      sponsor.logo ||
      sponsor.Logo?.id ||
      null,
    logomark_url:
      sponsor.logomark?.filename_disk ||
      sponsor.logomark ||
      sponsor.logomark?.id ||
      sponsor.logomark_url ||
      null,
    sponsor_types: JSON.stringify(sponsor.Sponsor_type || sponsor.sponsor_type || []),
    created_at: now,
    updated_at: now,
    logo_bg: sponsor.darkbg ? '#111827' : null,
  })

  return sponsor.id
}

function parseStartTime(value) {
  if (!value) return null

  const timeMatch = value.match(
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?\s*(?:to|-)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/
  )
  const singleMatch = value.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|AM|PM)?/)

  const match = timeMatch || singleMatch
  if (!match) return null

  let hours = Number.parseInt(match[1], 10)
  const minutes = match[2] || '00'
  const period = (match[3] || '').toLowerCase()

  if (period === 'pm' && hours < 12) hours += 12
  if (period === 'am' && hours === 12) hours = 0

  return `${String(hours).padStart(2, '0')}:${minutes}:00`
}

const syncMeetupDetails = db.transaction(() => {
  const now = sqlNow()
  let eventsMatched = 0
  let sessionsInserted = 0
  let speakerLinksInserted = 0
  let sponsorLinksInserted = 0
  let photosInserted = 0

  for (const meetup of meetups) {
    const event = findEvent(meetup)
    if (!event) continue

    eventsMatched++

    updateEvent.run({
      id: event.id,
      description: meetup.description || null,
      location: meetup.Location || null,
      venue: meetup.Venue || null,
      start_time: parseStartTime(meetup.Time),
      end_time: null,
      attendee_count: normalizeNullableNumber(meetup.Attendees),
      seats_available: normalizeNullableNumber(meetup.seats_available),
      accepting_rsvp: normalizeNullableBoolean(meetup.accepting_rsvp),
      rsvp_closing_date: sqlFromIso(meetup.rsvp_closing_date),
      rsvp_link: meetup.rsvplink || null,
      album_name: meetup.album || event.album_name || null,
      parking_location: meetup.parking_location || null,
      map_url: meetup.map || null,
      updated_at: now,
    })

    deleteSessionLinksByEvent.run(event.id)
    deleteSessionsByEvent.run(event.id)
    deleteEventSponsorsByEvent.run(event.id)
    deleteEventPhotosByEvent.run(event.id)

    for (const rawSponsor of meetup.sponsors || []) {
      ensureSponsorRecord(rawSponsor, now)
    }

    const rawSessions = meetup.sessions || []
    rawSessions.forEach((rawSession, index) => {
      const sessionId = randomUUID()
      const speaker = rawSession.Session_id?.speakers || null
      const sponsorId = rawSession.sponsor_id || null

      insertSession.run({
        id: sessionId,
        event_id: event.id,
        title: rawSession.Session_id?.title || rawSession.title || `Session ${index + 1}`,
        description: rawSession.Session_id?.description || rawSession.description || null,
        order: index + 1,
        kind: rawSession.kind || 'talk',
        sponsor_id: sponsorId,
        duration_minutes: normalizeNullableNumber(
          rawSession.duration_minutes ?? rawSession.durationMinutes
        ),
        created_at: now,
        updated_at: now,
      })
      sessionsInserted++

      if (speaker?.id) {
        const resolvedSpeakerId = ensureSpeakerUser(speaker, now)
        if (resolvedSpeakerId) {
          insertSessionSpeaker.run(sessionId, resolvedSpeakerId, now)
          speakerLinksInserted++
        }
      }
    })

    for (const rawSponsor of meetup.sponsors || []) {
      const sponsorId = ensureSponsorRecord(rawSponsor, now)
      if (!sponsorId) continue
      insertEventSponsor.run(event.id, sponsorId, now)
      sponsorLinksInserted++
    }

    const albumName = meetup.album || event.album_name
    const albumPhotos = albumName ? photosByAlbum[albumName] || [] : []
    albumPhotos.forEach((photoUrl, index) => {
      insertEventPhoto.run(randomUUID(), event.id, photoUrl, index + 1, now)
      photosInserted++
    })
  }

  return { eventsMatched, sessionsInserted, speakerLinksInserted, sponsorLinksInserted, photosInserted }
})

try {
  const result = syncMeetupDetails()
  console.log(JSON.stringify(result, null, 2))
} finally {
  db.close()
}
