import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'sponsors'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('logo_bg').nullable().defaultTo(null)
    })

    // Migrate existing data: darkbg=true → '#111827'
    this.defer(async (db) => {
      await db.from(this.tableName).where('darkbg', true).update({ logo_bg: '#111827' })
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('darkbg')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('darkbg').defaultTo(false).notNullable()
    })

    this.defer(async (db) => {
      await db.from(this.tableName).whereNotNull('logo_bg').update({ darkbg: true })
    })

    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('logo_bg')
    })
  }
}
