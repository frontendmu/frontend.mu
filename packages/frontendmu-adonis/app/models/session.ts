import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { BaseModel, column, belongsTo, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'
import Event from '#models/event'
import Sponsor from '#models/sponsor'
import User from '#models/user'

export const SESSION_KINDS = [
  'talk',
  'intro',
  'sponsored',
  'break',
  'photo',
  'quiz',
  'other',
] as const
export type SessionKind = (typeof SESSION_KINDS)[number]

export default class Session extends BaseModel {
  static selfAssignPrimaryKey = true

  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(session: Session) {
    if (!session.id) {
      session.id = randomUUID()
    }
  }

  @column()
  declare eventId: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare order: number | null

  @column()
  declare kind: SessionKind

  @column()
  declare sponsorId: string | null

  @column()
  declare durationMinutes: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @belongsTo(() => Sponsor)
  declare sponsor: BelongsTo<typeof Sponsor>

  @manyToMany(() => User, {
    pivotTable: 'session_speakers',
    pivotForeignKey: 'session_id',
    pivotRelatedForeignKey: 'speaker_id',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare speakers: ManyToMany<typeof User>
}
