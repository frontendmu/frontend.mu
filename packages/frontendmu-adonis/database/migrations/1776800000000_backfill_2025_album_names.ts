import { BaseSchema } from '@adonisjs/lucid/schema'

const BACKFILL: Array<{ slug: string; albumName: string }> = [
  { slug: '2025-september', albumName: '2025 September Selected' },
  { slug: '2025-october', albumName: '2025 October Selected' },
]

export default class extends BaseSchema {
  protected tableName = 'events'

  async up() {
    this.defer(async (db) => {
      for (const { slug, albumName } of BACKFILL) {
        await db
          .from(this.tableName)
          .where('slug', slug)
          .whereNull('album_name')
          .update({ album_name: albumName })
      }
    })
  }

  async down() {
    this.defer(async (db) => {
      for (const { slug, albumName } of BACKFILL) {
        await db
          .from(this.tableName)
          .where('slug', slug)
          .where('album_name', albumName)
          .update({ album_name: null })
      }
    })
  }
}
