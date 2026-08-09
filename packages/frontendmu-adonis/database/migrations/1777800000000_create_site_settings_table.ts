import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'site_settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()

      // Calendar feed (.ics subscription) behaviour
      table.boolean('calendar_feed_enabled').defaultTo(true).notNullable()
      table.boolean('calendar_auto_include_new_events').defaultTo(true).notNullable()
      table.boolean('calendar_include_past_events').defaultTo(false).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
