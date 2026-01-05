import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().notNullable()
      table.string('name').notNullable()
      table.string('email', 254).nullable().unique()
      table.string('github_username').nullable().unique()
      table.string('avatar_url').nullable()
      table.enum('role', ['admin', 'organizer', 'speaker', 'community_member']).defaultTo('community_member').notNullable()
      table.text('bio').nullable()
      table.string('linkedin_url').nullable()
      table.string('twitter_url').nullable()
      table.string('website_url').nullable()
      table.boolean('featured').defaultTo(false).notNullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
