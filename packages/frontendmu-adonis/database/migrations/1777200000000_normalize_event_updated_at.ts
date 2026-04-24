import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.defer(async (db) => {
      await db
        .from(this.tableName)
        .whereRaw("typeof(updated_at) = 'integer'")
        .update({
          updated_at: db.raw("datetime(updated_at / 1000, 'unixepoch')"),
        })
    })
  }

  async down() {
    // No-op. This migration only normalizes broken SQLite timestamp values.
  }
}
