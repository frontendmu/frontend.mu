import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'event_photos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('storage_key').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('storage_key')
    })
  }
}
