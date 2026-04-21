import { BaseSchema } from '@adonisjs/lucid/schema'

const ATTENDEE_FIXES = [
  { slug: '2025-september', attendeeCount: 40 },
  { slug: '2025-october', attendeeCount: 40 },
] as const

const TITLE_FIXES = [
  { slug: '2022-september', from: 'The CSS Meetup ', to: 'The CSS Meetup' },
  { slug: '2020-july', from: 'Testing & Accesibility', to: 'Testing & Accessibility' },
] as const

const SLUG_FIXES = [
  { from: '2024-march', to: '2024-february' },
  { from: '2024-march-2', to: '2024-march' },
  { from: '2020-february', to: '2020-january' },
  { from: '2020-february-2', to: '2020-february' },
  { from: '2016-july', to: '2016-september' },
] as const

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = new Date()

      for (const { slug, attendeeCount } of ATTENDEE_FIXES) {
        await db
          .from('events')
          .where('slug', slug)
          .where('attendee_count', 0)
          .update({ attendee_count: attendeeCount, updated_at: now })
      }

      for (const { slug, from, to } of TITLE_FIXES) {
        await db
          .from('events')
          .where('slug', slug)
          .where('title', from)
          .update({ title: to, updated_at: now })
      }

      for (const { from, to } of SLUG_FIXES) {
        const existingTarget = await db.from('events').where('slug', to).first()
        if (existingTarget) continue

        await db.from('events').where('slug', from).update({ slug: to, updated_at: now })
      }

      const february = await db.from('events').select('id').where('slug', '2026-february').first()
      const march = await db.from('events').select('id').where('slug', '2026-march').first()

      if (!february || !march) return

      const [{ total: februarySessions }] = (await db
        .from('sessions')
        .where('event_id', february.id)
        .count('* as total')) as Array<{ total: number | string }>
      const [{ total: marchSessions }] = (await db
        .from('sessions')
        .where('event_id', march.id)
        .count('* as total')) as Array<{ total: number | string }>

      if (Number(februarySessions) === 0 && Number(marchSessions) > 0) {
        await db.from('sessions').where('event_id', march.id).update({
          event_id: february.id,
          updated_at: now,
        })
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      const now = new Date()

      for (const { slug, attendeeCount } of ATTENDEE_FIXES) {
        await db
          .from('events')
          .where('slug', slug)
          .where('attendee_count', attendeeCount)
          .update({ attendee_count: 0, updated_at: now })
      }

      for (const { slug, from, to } of TITLE_FIXES) {
        await db.from('events').where('slug', slug).where('title', to).update({
          title: from,
          updated_at: now,
        })
      }

      for (const { from, to } of [...SLUG_FIXES].reverse()) {
        const existingSource = await db.from('events').where('slug', from).first()
        if (existingSource) continue

        await db.from('events').where('slug', to).update({ slug: from, updated_at: now })
      }

      const february = await db.from('events').select('id').where('slug', '2026-february').first()
      const march = await db.from('events').select('id').where('slug', '2026-march').first()

      if (!february || !march) return

      const [{ total: februarySessions }] = (await db
        .from('sessions')
        .where('event_id', february.id)
        .count('* as total')) as Array<{ total: number | string }>
      const [{ total: marchSessions }] = (await db
        .from('sessions')
        .where('event_id', march.id)
        .count('* as total')) as Array<{ total: number | string }>

      if (Number(marchSessions) === 0 && Number(februarySessions) > 0) {
        await db.from('sessions').where('event_id', february.id).update({
          event_id: march.id,
          updated_at: now,
        })
      }
    })
  }
}
