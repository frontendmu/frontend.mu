import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('slug').notNullable().unique()
      table.string('title').notNullable()
      table.text('content').nullable()
      table.text('meta_description').nullable()
      table.enum('status', ['published', 'draft']).defaultTo('draft').notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.index('slug')
      table.index('status')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
