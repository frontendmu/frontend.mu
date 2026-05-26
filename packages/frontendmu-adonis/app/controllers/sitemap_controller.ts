import type { HttpContext } from '@adonisjs/core/http'
import { type DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Event from '#models/event'
import User from '#models/user'
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

    // Speakers with at least one session — avoids polluting the index with
    // attendee accounts that never spoke.
    const speakerRows = await db.from('session_speakers').distinct('speaker_id')
    const speakerIds = speakerRows.map((r) => r.speaker_id as string).filter(Boolean)
    if (speakerIds.length > 0) {
      const speakers = await User.query().whereIn('id', speakerIds).select('id', 'updatedAt')
      for (const speaker of speakers) {
        entries.push({
          loc: canonicalUrl(`/speaker/${speaker.id}`),
          lastmod: toIso(speaker.updatedAt as DateTime | null | undefined),
        })
      }
    }

    response.header('Content-Type', 'application/xml; charset=utf-8')
    response.header('Cache-Control', 'public, max-age=3600')
    return response.send(renderSitemap(entries))
  }
}
