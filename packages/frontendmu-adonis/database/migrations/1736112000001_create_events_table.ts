import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('title').notNullable()
      table.text('description').nullable()
      table.string('location').nullable()
      table.string('venue').nullable()
      table.timestamp('event_date').notNullable()
      table.time('start_time').nullable()
      table.time('end_time').nullable()
      table.integer('attendee_count').defaultTo(0).notNullable()
      table.integer('seats_available').nullable()
      table.boolean('accepting_rsvp').defaultTo(false).notNullable()
      table.timestamp('rsvp_closing_date').nullable()
      table.string('rsvp_link').nullable()
      table.string('album_name').nullable()
      table.string('cover_image_url').nullable()
      table.string('parking_location').nullable()
      table.string('map_url').nullable()
      table.enum('status', ['published', 'draft', 'cancelled']).defaultTo('published').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('event_date')
      table.index('status')
      table.index('title')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
