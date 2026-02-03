import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'session_speakers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table
        .uuid('session_id')
        .references('id')
        .inTable('sessions')
        .onDelete('CASCADE')
        .notNullable()
      table.uuid('speaker_id').references('id').inTable('users').onDelete('CASCADE').notNullable()

      table.timestamp('created_at').notNullable()

      table.primary(['session_id', 'speaker_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
