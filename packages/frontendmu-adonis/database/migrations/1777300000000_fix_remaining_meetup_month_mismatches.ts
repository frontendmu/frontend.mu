import { BaseSchema } from '@adonisjs/lucid/schema'

const DATE_FIXES = [
  { slug: '2016-september', eventDate: '2016-09-24 00:00:00' },
  { slug: '2024-february', eventDate: '2024-02-24 00:00:00' },
] as const

function sqlNow(): string {
  return new Date()
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
}

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.defer(async (db) => {
      const now = sqlNow()

      for (const { slug, eventDate } of DATE_FIXES) {
        await db.from(this.tableName).where('slug', slug).update({
          event_date: eventDate,
          updated_at: now,
        })
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      const now = sqlNow()

      await db.from(this.tableName).where('slug', '2016-september').update({
        event_date: '2016-07-30 00:00:00',
        updated_at: now,
      })

      await db.from(this.tableName).where('slug', '2024-february').update({
        event_date: '2024-03-02 00:00:00',
        updated_at: now,
      })
    })
  }
}
