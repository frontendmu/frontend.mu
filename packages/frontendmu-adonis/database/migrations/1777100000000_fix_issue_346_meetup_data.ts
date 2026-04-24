import { BaseSchema } from '@adonisjs/lucid/schema'
import { sqlNow } from '#database/sql_now'

const ATTENDEE_FIXES = [
  { slug: '2025-september', attendeeCount: 40 },
  { slug: '2025-october', attendeeCount: 40 },
] as const

const TITLE_FIXES = [
  { slug: '2022-september', from: 'The CSS Meetup ', to: 'The CSS Meetup' },
  { slug: '2020-july', from: 'Testing & Accesibility', to: 'Testing & Accessibility' },
] as const

const SLUG_SHIFT_FIXES = [
  {
    targetSlug: '2024-february',
    occupiedSlug: '2024-march',
    trailingSlug: '2024-march-2',
    tempSlug: '__issue_346_tmp_2024_february__',
  },
  {
    targetSlug: '2020-january',
    occupiedSlug: '2020-february',
    trailingSlug: '2020-february-2',
    tempSlug: '__issue_346_tmp_2020_january__',
  },
] as const

const SINGLE_SLUG_FIXES = [{ from: '2016-july', to: '2016-september' }] as const

async function shiftSlugLeftOrThrow(
  db: any,
  { targetSlug, occupiedSlug, trailingSlug, tempSlug }: (typeof SLUG_SHIFT_FIXES)[number],
  now: string
) {
  const [target, occupied, trailing, temp] = await Promise.all([
    db.from('events').select('id').where('slug', targetSlug).first(),
    db.from('events').select('id').where('slug', occupiedSlug).first(),
    db.from('events').select('id').where('slug', trailingSlug).first(),
    db.from('events').select('id').where('slug', tempSlug).first(),
  ])

  if (temp) {
    throw new Error(
      `Issue 346 slug fix cannot use temporary slug "${tempSlug}" because it already exists`
    )
  }

  if (!occupied && !trailing) {
    if (target) return
    throw new Error(
      `Issue 346 slug fix expected "${occupiedSlug}" and "${trailingSlug}" or an already-fixed state`
    )
  }

  if (!occupied || !trailing) {
    throw new Error(
      `Issue 346 slug fix found a partial state for "${targetSlug}" / "${occupiedSlug}" / "${trailingSlug}"`
    )
  }

  if (target) {
    throw new Error(
      `Issue 346 slug fix cannot move "${occupiedSlug}" to occupied slug "${targetSlug}"`
    )
  }

  await db.transaction(async (trx: any) => {
    await trx.from('events').where('slug', occupiedSlug).update({ slug: tempSlug, updated_at: now })
    await trx
      .from('events')
      .where('slug', trailingSlug)
      .update({ slug: occupiedSlug, updated_at: now })
    await trx.from('events').where('slug', tempSlug).update({ slug: targetSlug, updated_at: now })
  })
}

async function shiftSlugRightOrThrow(
  db: any,
  { targetSlug, occupiedSlug, trailingSlug, tempSlug }: (typeof SLUG_SHIFT_FIXES)[number],
  now: string
) {
  const [target, occupied, trailing, temp] = await Promise.all([
    db.from('events').select('id').where('slug', targetSlug).first(),
    db.from('events').select('id').where('slug', occupiedSlug).first(),
    db.from('events').select('id').where('slug', trailingSlug).first(),
    db.from('events').select('id').where('slug', tempSlug).first(),
  ])

  if (temp) {
    throw new Error(
      `Issue 346 slug rollback cannot use temporary slug "${tempSlug}" because it already exists`
    )
  }

  if (!target && occupied && trailing) return

  if (!target || !occupied) {
    throw new Error(
      `Issue 346 slug rollback found a partial state for "${targetSlug}" / "${occupiedSlug}" / "${trailingSlug}"`
    )
  }

  if (trailing) {
    throw new Error(
      `Issue 346 slug rollback cannot move "${occupiedSlug}" to occupied slug "${trailingSlug}"`
    )
  }

  await db.transaction(async (trx: any) => {
    await trx.from('events').where('slug', targetSlug).update({ slug: tempSlug, updated_at: now })
    await trx
      .from('events')
      .where('slug', occupiedSlug)
      .update({ slug: trailingSlug, updated_at: now })
    await trx.from('events').where('slug', tempSlug).update({ slug: occupiedSlug, updated_at: now })
  })
}

async function renameSlugOrThrow(
  db: any,
  { from, to }: (typeof SINGLE_SLUG_FIXES)[number],
  now: string
) {
  const [source, target] = await Promise.all([
    db.from('events').select('id').where('slug', from).first(),
    db.from('events').select('id').where('slug', to).first(),
  ])

  if (!source && target) return
  if (!source) {
    throw new Error(`Issue 346 slug fix expected source slug "${from}" to exist`)
  }
  if (target) {
    throw new Error(`Issue 346 slug fix cannot move "${from}" to occupied slug "${to}"`)
  }

  await db.from('events').where('slug', from).update({ slug: to, updated_at: now })
}

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const now = sqlNow()

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

      for (const fix of SLUG_SHIFT_FIXES) {
        await shiftSlugLeftOrThrow(db, fix, now)
      }

      for (const fix of SINGLE_SLUG_FIXES) {
        await renameSlugOrThrow(db, fix, now)
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

      // The checked-in local dev SQLite already has the agenda moved, so this can
      // intentionally no-op there while still backfilling older production snapshots.
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
      const now = sqlNow()

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

      for (const fix of SLUG_SHIFT_FIXES) {
        await shiftSlugRightOrThrow(db, fix, now)
      }

      for (const { from, to } of [...SINGLE_SLUG_FIXES].reverse()) {
        await renameSlugOrThrow(db, { from: to, to: from }, now)
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
