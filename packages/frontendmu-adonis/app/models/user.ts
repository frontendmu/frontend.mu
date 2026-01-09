import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, manyToMany, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import type { ManyToMany, HasMany } from '@adonisjs/lucid/types/relations'
import Session from '#models/session'
import Rsvp from '#models/rsvp'
import Role from '#models/role'
import db from '@adonisjs/lucid/services/db'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

/**
 * @deprecated Use hasRole() and can() methods instead
 */
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

  /**
   * @deprecated Use the roles relationship instead. Kept for backward compatibility during migration.
   */
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

  @column()
  declare googleId: string | null

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

  @hasMany(() => Rsvp)
  declare rsvps: HasMany<typeof Rsvp>

  @manyToMany(() => Role, {
    pivotTable: 'user_roles',
    pivotTimestamps: {
      createdAt: 'created_at',
      updatedAt: false,
    },
  })
  declare roles: ManyToMany<typeof Role>

  // ==========================================
  // RBAC Caching
  // ==========================================

  private rolesCache?: Set<string>
  private permissionsCache?: Set<string>

  /**
   * Load roles into cache using raw query for reliability
   */
  private async loadRoles(): Promise<void> {
    if (this.rolesCache) return

    const roles = await db
      .from('roles')
      .innerJoin('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', this.id)
      .select('roles.name')

    this.rolesCache = new Set(roles.map((r) => r.name))
  }

  /**
   * Load permissions into cache using raw query for reliability
   */
  private async loadPermissions(): Promise<void> {
    if (this.permissionsCache) return

    const permissions = await db
      .from('permissions')
      .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permission_id')
      .innerJoin('roles', 'roles.id', 'role_permissions.role_id')
      .innerJoin('user_roles', 'roles.id', 'user_roles.role_id')
      .where('user_roles.user_id', this.id)
      .select('permissions.name')
      .distinct()

    this.permissionsCache = new Set(permissions.map((p) => p.name))
  }

  /**
   * Clear the RBAC cache (useful after role/permission changes)
   */
  public clearRbacCache(): void {
    this.rolesCache = undefined
    this.permissionsCache = undefined
  }

  // ==========================================
  // Role Checking Methods
  // ==========================================

  /**
   * Check if user has a specific role
   * @example await user.hasRole('admin')
   */
  public async hasRole(role: string): Promise<boolean> {
    await this.loadRoles()
    return this.rolesCache!.has(role)
  }

  /**
   * Check if user has any of the specified roles
   * @example await user.hasAnyRole(['admin', 'organizer'])
   */
  public async hasAnyRole(roles: string[]): Promise<boolean> {
    await this.loadRoles()
    return roles.some((role) => this.rolesCache!.has(role))
  }

  /**
   * Check if user has all of the specified roles
   * @example await user.hasAllRoles(['member', 'speaker'])
   */
  public async hasAllRoles(roles: string[]): Promise<boolean> {
    await this.loadRoles()
    return roles.every((role) => this.rolesCache!.has(role))
  }

  // ==========================================
  // Permission Checking Methods
  // ==========================================

  /**
   * Check if user has a specific permission
   * @example await user.can('create-event')
   */
  public async can(permission: string): Promise<boolean> {
    await this.loadPermissions()
    return this.permissionsCache!.has(permission)
  }

  /**
   * Check if user does NOT have a specific permission
   * @example await user.cannot('delete-user')
   */
  public async cannot(permission: string): Promise<boolean> {
    return !(await this.can(permission))
  }

  /**
   * Check if user has any of the specified permissions
   * @example await user.canAny(['edit-event', 'delete-event'])
   */
  public async canAny(permissions: string[]): Promise<boolean> {
    await this.loadPermissions()
    return permissions.some((permission) => this.permissionsCache!.has(permission))
  }

  /**
   * Check if user has all of the specified permissions
   * @example await user.canAll(['view-event', 'edit-event'])
   */
  public async canAll(permissions: string[]): Promise<boolean> {
    await this.loadPermissions()
    return permissions.every((permission) => this.permissionsCache!.has(permission))
  }

  /**
   * Get all permissions for the user
   * @example await user.getAllPermissions()
   */
  public async getAllPermissions(): Promise<string[]> {
    await this.loadPermissions()
    return Array.from(this.permissionsCache!)
  }

  // ==========================================
  // Computed Properties
  // ==========================================

  get isSpeaker(): boolean {
    return this.sessions && this.sessions.length > 0
  }

  /**
   * @deprecated Use hasRole() or can() instead
   * Kept for backward compatibility during migration
   */
  hasAppRole(minimumRole: AppRole): boolean {
    const hierarchy: AppRole[] = ['viewer', 'member', 'organizer', 'superadmin']
    return hierarchy.indexOf(this.role) >= hierarchy.indexOf(minimumRole)
  }
}
