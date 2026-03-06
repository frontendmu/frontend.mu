import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_photos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.uuid('event_id').references('id').inTable('events').onDelete('CASCADE').notNullable()
      table.string('photo_url').notNullable()
      table.text('caption').nullable()
      table.integer('order').nullable()

      table.timestamp('created_at').notNullable()

      table.index('event_id')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
