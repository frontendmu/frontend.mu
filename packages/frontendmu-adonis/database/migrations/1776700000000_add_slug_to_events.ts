import { BaseSchema } from '@adonisjs/lucid/schema'
import { DateTime } from 'luxon'

function parseDate(value: string | Date): DateTime {
  if (value instanceof Date) return DateTime.fromJSDate(value, { zone: 'utc' })
  const sql = DateTime.fromSQL(value, { zone: 'utc' })
  if (sql.isValid) return sql
  const iso = DateTime.fromISO(value, { zone: 'utc' })
  if (iso.isValid) return iso
  throw new Error(`Unparseable event_date value: ${value}`)
}

function baseSlugFromDate(date: DateTime): string {
  return `${date.year}-${date.toFormat('LLLL').toLowerCase()}`
}

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('slug').nullable()
    })

    this.defer(async (db) => {
      const rows = await db
        .from(this.tableName)
        .select('id', 'event_date')
        .orderBy('created_at', 'asc')

      const taken = new Set<string>()
      for (const row of rows) {
        const base = baseSlugFromDate(parseDate(row.event_date))
        let slug = base
        if (taken.has(slug)) {
          let n = 2
          while (taken.has(`${base}-${n}`)) n++
          slug = `${base}-${n}`
        }
        taken.add(slug)
        await db.from(this.tableName).where('id', row.id).update({ slug })
      }
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['slug'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['slug'])
    })
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('slug')
    })
  }
}
