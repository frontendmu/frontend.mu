import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Session from '#models/session'

export type UserRole = 'admin' | 'organizer' | 'speaker' | 'community_member'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare name: string

  @column()
  declare email: string | null

  @column()
  declare githubUsername: string | null

  @column()
  declare avatarUrl: string | null

  @column()
  declare role: UserRole

  @column()
  declare bio: string | null

  @column()
  declare linkedinUrl: string | null

  @column()
  declare twitterUrl: string | null

  @column()
  declare websiteUrl: string | null

  @column()
  declare featured: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  // Relationships
  @manyToMany(() => Session, {
    pivotTable: 'session_speakers',
    pivotForeignKey: 'speaker_id',
    pivotRelatedForeignKey: 'session_id',
  })
  declare sessions: ManyToMany<typeof Session>

  /**
   * Check if user is a speaker
   */
  get isSpeaker(): boolean {
    return this.role === 'speaker'
  }

  /**
   * Check if user is featured
   */
  get isFeatured(): boolean {
    return this.featured
  }
}
