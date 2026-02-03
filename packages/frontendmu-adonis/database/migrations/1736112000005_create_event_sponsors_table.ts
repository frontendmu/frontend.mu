import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_sponsors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE').notNullable()
      table
        .uuid('sponsor_id')
        .references('id')
        .inTable('sponsors')
        .onDelete('CASCADE')
        .notNullable()

      table.timestamp('created_at').notNullable()

      table.primary(['event_id', 'sponsor_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
