import { BaseSchema } from '@adonisjs/lucid/schema'

const SESSION_KINDS = ['talk', 'intro', 'sponsored', 'break', 'photo', 'quiz', 'other'] as const

export default class extends BaseSchema {
  protected tableName = 'sessions'

  /*
   * Adding a FK column in SQLite triggers a table-recreate. The existing
   * session_speakers → sessions FK has ON DELETE CASCADE, which would fire
   * during the recreate and wipe session_speakers. We disable FK enforcement
   * around the alter to preserve the pivot rows.
   */
  async up() {
    this.schema.raw('PRAGMA foreign_keys = OFF')
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('kind')
        .notNullable()
        .defaultTo('talk')
        .checkIn([...SESSION_KINDS])
      table.uuid('sponsor_id').nullable().references('id').inTable('sponsors').onDelete('SET NULL')
      table.integer('duration_minutes').nullable()
    })
    this.schema.raw('PRAGMA foreign_keys = ON')
  }

  async down() {
    this.schema.raw('PRAGMA foreign_keys = OFF')
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kind')
      table.dropColumn('sponsor_id')
      table.dropColumn('duration_minutes')
    })
    this.schema.raw('PRAGMA foreign_keys = ON')
  }
}
