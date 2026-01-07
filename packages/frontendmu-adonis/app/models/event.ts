import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'
import { BaseModel, column, belongsTo, hasMany, manyToMany, beforeCreate } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'
import Session from '#models/session'
import Sponsor from '#models/sponsor'
import EventPhoto from '#models/event_photo'
import Rsvp from '#models/rsvp'

export type EventStatus = 'published' | 'draft' | 'cancelled'

export default class Event extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static assignUuid(event: Event) {
    if (!event.id) {
      event.id = randomUUID()
    }
  }

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

  @column()
  declare startTime: string | null

  @column()
  declare endTime: string | null

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

  @belongsTo(() => Event)
  declare event: BelongsTo<typeof Event>

  @hasMany(() => EventPhoto)
  declare photos: HasMany<typeof EventPhoto>

  // Many-to-many with sponsors through event_sponsors table
  @manyToMany(() => Sponsor, {
    pivotTable: 'event_sponsors',
  })
  declare sponsors: ManyToMany<typeof Sponsor>

  // RSVPs for this event
  @hasMany(() => Rsvp)
  declare rsvps: HasMany<typeof Rsvp>

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

  /**
   * API serialization - map model fields to frontend naming convention
   */
  get Date(): string | null {
    return this.eventDate?.toISO() ?? null
  }

  get Time(): string | null {
    return this.startTime
  }

  get Venue(): string | null {
    return this.venue
  }

  get Location(): string | null {
    return this.location
  }

  get Attendees(): number {
    return this.attendeeCount
  }

  get seats_available(): number | null {
    return this.seatsAvailable
  }

  get album(): string | null {
    return this.albumName
  }

  get map(): string | null {
    return this.mapUrl
  }

  get parking_location(): string | null {
    return this.parkingLocation
  }

  get accepting_rsvp(): boolean {
    return this.acceptingRsvp
  }
}
