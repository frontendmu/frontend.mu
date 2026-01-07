import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Session from '#models/session'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export type AppRole = 'viewer' | 'member' | 'organizer' | 'superadmin'

export default class User extends compose(BaseModel, AuthFinder) {
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
  declare role: AppRole

  @column({ serializeAs: null })
  declare password: string | null

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

  @column()
  declare isOrganizer: boolean

  @column()
  declare isCommunityMember: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @manyToMany(() => Session, {
    pivotTable: 'session_speakers',
    pivotForeignKey: 'speaker_id',
    pivotRelatedForeignKey: 'session_id',
  })
  declare sessions: ManyToMany<typeof Session>

  get isSpeaker(): boolean {
    return this.sessions && this.sessions.length > 0
  }

  hasAppRole(minimumRole: AppRole): boolean {
    const hierarchy: AppRole[] = ['viewer', 'member', 'organizer', 'superadmin']
    return hierarchy.indexOf(this.role) >= hierarchy.indexOf(minimumRole)
  }
}
