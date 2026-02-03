import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_roles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table
        .integer('role_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('roles')
        .onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      // Unique constraint to prevent duplicate user-role assignments
      table.unique(['user_id', 'role_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
