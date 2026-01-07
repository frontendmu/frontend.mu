import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.string('password').nullable()

      table.boolean('is_organizer').defaultTo(false).notNullable()

      table.boolean('is_community_member').defaultTo(false).notNullable()

      table.enum('app_role', ['viewer', 'member', 'organizer', 'superadmin']).defaultTo('viewer').notNullable()
    })

    this.schema.alter(this.tableName, (table) => {
      table.dropColumn('role')
    })

    this.schema.alter(this.tableName, (table) => {
      table.renameColumn('app_role', 'role')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('password')
      table.dropColumn('is_organizer')
      table.dropColumn('is_community_member')
    })

    this.schema.alter(this.tableName, (table) => {
      table.dropColumn('role')
    })

    this.schema.alter(this.tableName, (table) => {
      table.enum('role', ['admin', 'organizer', 'speaker', 'community_member']).defaultTo('community_member').notNullable()
    })
  }
}
