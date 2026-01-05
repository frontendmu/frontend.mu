import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import Session from '#models/session'
import Sponsor from '#models/sponsor'
import EventPhoto from '#models/event_photo'

export type EventStatus = 'published' | 'draft' | 'cancelled'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare location: string | null

  @column()
  declare venue: string | null

  @column.dateTime()
  declare eventDate: DateTime

  @column.time()
  declare startTime: DateTime | null

  @column.time()
  declare endTime: DateTime | null

  @column()
  declare attendeeCount: number

  @column()
  declare seatsAvailable: number | null

  @column()
  declare acceptingRsvp: boolean

  @column.dateTime()
  declare rsvpClosingDate: DateTime | null

  @column()
  declare rsvpLink: string | null

  @column()
  declare albumName: string | null

  @column()
  declare coverImageUrl: string | null

  @column()
  declare parkingLocation: string | null

  @column()
  declare mapUrl: string | null

  @column()
  declare status: EventStatus

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @hasMany(() => Session)
  declare sessions: HasMany<typeof Session>

  @belongsTo(() => Event, {
    foreignKey: 'eventId',
    relatedKey: 'id',
  })
  declare event: BelongsTo<typeof Event>

  @hasMany(() => EventPhoto)
  declare photos: HasMany<typeof EventPhoto>

  // Many-to-many with sponsors through event_sponsors table
  @belongsTo(() => Sponsor, {
    foreignKey: 'sponsorId',
    relatedKey: 'id',
  })
  declare sponsors: BelongsTo<typeof Sponsor>

  /**
   * Check if event is published
   */
  get isPublished(): boolean {
    return this.status === 'published'
  }

  /**
   * Check if event is in the past
   */
  get isPast(): boolean {
    return this.eventDate < DateTime.now()
  }

  /**
   * Check if event is upcoming
   */
  get isUpcoming(): boolean {
    return this.eventDate > DateTime.now()
  }
}
