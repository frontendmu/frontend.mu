import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import { canonicalUrl } from '#utils/site_url'

type Entry = {
  loc: string
  lastmod?: string
}

const STATIC_PATHS = [
  '/',
  '/meetups',
  '/speakers',
  '/sponsors',
  '/sponsor-us',
  '/team',
  '/about',
  '/community',
  '/contribute',
  '/branding',
  '/history',
  '/code-of-conduct',
  '/coding-guidelines',
  '/api-docs',
  '/privacy',
  '/terms',
]

function toIso(dt: DateTime | null | undefined): string | undefined {
  return dt?.toUTC().toISO() ?? undefined
}

function xmlEscape(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function renderSitemap(entries: Entry[]): string {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>']
  lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
  for (const entry of entries) {
    lines.push('  <url>')
    lines.push(`    <loc>${xmlEscape(entry.loc)}</loc>`)
    if (entry.lastmod) lines.push(`    <lastmod>${entry.lastmod}</lastmod>`)
    lines.push('  </url>')
  }
  lines.push('</urlset>')
  return lines.join('\n')
}

export default class SitemapController {
  async index({ response }: HttpContext) {
    const entries: Entry[] = STATIC_PATHS.map((path) => ({ loc: canonicalUrl(path) }))

    const events = await Event.query()
      .where('status', 'published')
      .select('slug', 'updatedAt')
      .orderBy('eventDate', 'desc')

    for (const event of events) {
      if (!event.slug) continue
      entries.push({
        loc: canonicalUrl(`/meetup/${event.slug}`),
        lastmod: toIso(event.updatedAt),
      })
    }

    // Speakers with at least one session. Lastmod tracks the most recent
    // session they spoke at (not user.updatedAt, which would churn on every
    // OAuth login refresh and other profile writes that don't change the
    // public /speaker/<id> page). Sessions imported by migrations may not
    // have updated_at set, so we coalesce to created_at — better than no
    // lastmod at all.
    const speakerRows = await db
      .from('session_speakers')
      .join('sessions', 'sessions.id', 'session_speakers.session_id')
      .groupBy('session_speakers.speaker_id')
      .select('session_speakers.speaker_id')
      .select(
        db.raw('MAX(COALESCE(sessions.updated_at, sessions.created_at)) as latest_session_at')
      )

    for (const row of speakerRows) {
      const id = row.speaker_id as string | undefined
      if (!id) continue
      const raw = row.latest_session_at as Date | string | null | undefined
      let dt: DateTime | undefined
      if (raw instanceof Date) {
        dt = DateTime.fromJSDate(raw)
      } else if (typeof raw === 'string' && raw) {
        // SQLite returns timestamps as `YYYY-MM-DD HH:MM:SS`; Postgres can
        // return ISO. Try fromSQL first then fall back to fromISO.
        dt = DateTime.fromSQL(raw, { zone: 'utc' })
        if (!dt.isValid) dt = DateTime.fromISO(raw, { zone: 'utc' })
      }
      entries.push({
        loc: canonicalUrl(`/speaker/${id}`),
        lastmod: dt?.isValid ? toIso(dt) : undefined,
      })
    }

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(renderSitemap(entries))
  }
}
