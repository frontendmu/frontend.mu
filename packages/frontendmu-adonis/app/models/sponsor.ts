import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { BaseModel, column, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'

export type SponsorStatus = 'active' | 'inactive'

export default class Sponsor extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(sponsor: Sponsor) {
    sponsor.id = sponsor.id || randomUUID()
  }

  @column()
  declare name: string

  @column()
  declare website: string | null

  @column()
  declare description: string | null

  @column()
  declare logoUrl: string | null

  @column()
  declare logomarkUrl: string | null

  @column()
  declare sponsorTypes: string[]

  @column()
  declare logoBg: string | null

  @column()
  declare status: SponsorStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @manyToMany(() => Event, {
    pivotTable: 'event_sponsors',
    pivotForeignKey: 'sponsor_id',
    pivotRelatedForeignKey: 'event_id',
    pivotColumns: ['created_at'],
  })
  declare events: ManyToMany<typeof Event>

  /**
   * Check if sponsor is active
   */
  get isActive(): boolean {
    return this.status === 'active'
  }

  /**
   * Get sponsor types as formatted strings
   */
  get formattedTypes(): string[] {
    return this.sponsorTypes || []
  }
}
