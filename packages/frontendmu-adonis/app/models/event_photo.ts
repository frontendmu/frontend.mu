import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { BaseModel, column, belongsTo, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'

export default class EventPhoto extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(photo: EventPhoto) {
    if (!photo.id) photo.id = randomUUID()
  }

  @column()
  declare eventId: string

  @column()
  declare photoUrl: string

  @column()
  declare caption: string | null

  @column()
  declare order: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  // Relationships
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>
}
