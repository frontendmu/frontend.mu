import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sponsors'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('name').notNullable()
      table.string('website').nullable()
      table.text('description').nullable()
      table.string('logo_url').nullable()
      table.string('logomark_url').nullable()
      table.jsonb('sponsor_types').notNullable()
      table.boolean('darkbg').defaultTo(false).notNullable()
      table.enum('status', ['active', 'inactive']).defaultTo('active').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('name')
      table.index('status')
      table.index(['sponsor_types'], 'gin', 'btree')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
