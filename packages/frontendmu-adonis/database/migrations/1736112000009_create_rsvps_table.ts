import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'rsvps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.uuid('event_id').notNullable().references('id').inTable('events').onDelete('CASCADE')
      table.enum('status', ['confirmed', 'waitlist', 'cancelled']).defaultTo('confirmed')
      table.text('notes').nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      // Ensure a user can only RSVP once per event
      table.unique(['user_id', 'event_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
