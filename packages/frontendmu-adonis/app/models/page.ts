import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export type PageStatus = 'published' | 'draft'

export default class Page extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare slug: string

  @column()
  declare title: string

  @column()
  declare content: string | null

  @column()
  declare metaDescription: string | null

  @column()
  declare status: PageStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  /**
   * Check if page is published
   */
  get isPublished(): boolean {
    return this.status === 'published'
  }
}
