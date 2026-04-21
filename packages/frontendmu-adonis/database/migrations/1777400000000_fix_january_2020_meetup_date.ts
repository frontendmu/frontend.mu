import { BaseSchema } from '@adonisjs/lucid/schema'
import { sqlNow } from '#database/sql_now'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.defer(async (db) => {
      await db.from(this.tableName).where('slug', '2020-january').update({
        event_date: '2020-01-25 00:00:00',
        updated_at: sqlNow(),
      })
    })
  }

  async down() {
    this.defer(async (db) => {
      await db.from(this.tableName).where('slug', '2020-january').update({
        event_date: '2020-02-01 00:00:00',
        updated_at: sqlNow(),
      })
    })
  }
}
