import { BaseSchema } from '@adonisjs/lucid/schema'

const SESSION_KINDS = ['talk', 'intro', 'sponsored', 'break', 'photo', 'quiz', 'other'] as const

export default class extends BaseSchema {
  protected tableName = 'sessions'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .string('kind')
        .notNullable()
        .defaultTo('talk')
        .checkIn([...SESSION_KINDS])
      table.uuid('sponsor_id').nullable().references('id').inTable('sponsors').onDelete('SET NULL')
      table.integer('duration_minutes').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('kind')
      table.dropColumn('sponsor_id')
      table.dropColumn('duration_minutes')
    })
  }
}
