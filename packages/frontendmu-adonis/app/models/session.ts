import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, manyToMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'
import User from '#models/user'

export default class Session extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare eventId: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare order: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @manyToMany(() => User, {
    pivotTable: 'session_speakers',
    pivotForeignKey: 'session_id',
    pivotRelatedForeignKey: 'speaker_id',
    pivotColumns: ['created_at'],
  })
  declare speakers: ManyToMany<typeof User>
}
