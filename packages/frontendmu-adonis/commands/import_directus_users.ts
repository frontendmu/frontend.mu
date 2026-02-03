import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Rsvp from '#models/rsvp'
import Event from '#models/event'
import type { AppRole } from '#models/user'

interface DirectusUser {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  full_name: string | null
  github_username: string | null
  provider: string
  external_identifier: string | null
  profile_picture: string | null
  status: string
  role_name: string | null
  last_access: string | null
  avatar: string | null
}

interface DirectusEvent {
  id: number
  title: string
  event_date: string
}

interface DirectusRsvp {
  id: number
  event_id: number
  user_id: string
  meta: string | null
  meal: string | null
  transport: string | null
  occupation: string | null
  is_public: number | null
  name: string | null
  profile_picture: string | null
  verified: number | null
}

/**
 * Import users and RSVPs from Directus database dump
 *
 * Usage:
 *   node ace import:directus-users
 *   node ace import:directus-users --dry-run
 *   node ace import:directus-users --skip-rsvps
 */
export default class ImportDirectusUsers extends BaseCommand {
  static commandName = 'import:directus-users'
  static description = 'Import users and RSVPs from Directus database dump'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Dry run - do not actually import' })
  declare dryRun: boolean

  @flags.boolean({ description: 'Skip RSVP import' })
  declare skipRsvps: boolean

  @flags.boolean({ description: 'Clear existing users before import (WARNING: destructive)' })
  declare clearUsers: boolean

  private basePath = 'database/backups'

  private stats = {
    usersTotal: 0,
    usersCreated: 0,
    usersSkipped: 0,
    usersErrors: 0,
    rsvpsTotal: 0,
    rsvpsCreated: 0,
    rsvpsSkipped: 0,
    rsvpsErrors: 0,
  }

  async run() {
    this.logger.info('Starting Directus import...')

    if (this.dryRun) {
      this.logger.warning('DRY RUN - No changes will be made')
    }

    // Load data files
    const usersFile = `${this.basePath}/directus_users.json`
    const eventsFile = `${this.basePath}/directus_events.json`
    const rsvpsFile = `${this.basePath}/directus_rsvps.json`

    if (!existsSync(usersFile)) {
      this.logger.error(`Users file not found: ${usersFile}`)
      this.logger.info('Run the SQLite export commands first to generate JSON files.')
      return
    }

    const directusUsers: DirectusUser[] = await this.loadJsonFile(usersFile)
    this.logger.info(`Loaded ${directusUsers.length} users from Directus`)

    // Clear existing users if requested
    if (this.clearUsers && !this.dryRun) {
      this.logger.warning('Clearing existing users...')
      await this.clearExistingUsers()
    }

    // Import users
    await this.importUsers(directusUsers)

    // Import RSVPs if not skipped
    if (!this.skipRsvps && existsSync(eventsFile) && existsSync(rsvpsFile)) {
      const directusEvents: DirectusEvent[] = await this.loadJsonFile(eventsFile)
      const directusRsvps: DirectusRsvp[] = await this.loadJsonFile(rsvpsFile)

      this.logger.info(`Loaded ${directusEvents.length} events for mapping`)
      this.logger.info(`Loaded ${directusRsvps.length} RSVPs from Directus`)

      await this.importRsvps(directusRsvps, directusEvents)
    }

    this.printSummary()
  }

  private async loadJsonFile<T>(filePath: string): Promise<T[]> {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  private async clearExistingUsers() {
    // First clear RSVPs (they reference users)
    await db.from('rsvps').delete()
    // Then clear session_speakers (they reference users)
    await db.from('session_speakers').delete()
    // Finally clear users
    await db.from('users').delete()
    this.logger.info('Cleared existing users, RSVPs, and session_speakers')
  }

  private mapRole(directusRoleName: string | null): AppRole {
    const roleName = directusRoleName?.toLowerCase() || ''

    switch (roleName) {
      case 'administrator':
        return 'superadmin'
      case 'admin':
        return 'organizer'
      case 'member':
        return 'member'
      case 'sso_google':
        return 'member'
      case 'nuxt':
        return 'viewer' // Service account
      default:
        return 'member'
    }
  }

  private async importUsers(directusUsers: DirectusUser[]) {
    this.logger.info('Importing users...')

    for (const directusUser of directusUsers) {
      this.stats.usersTotal++

      try {
        // Skip users without email
        if (!directusUser.email) {
          this.logger.debug(`Skipping user without email: ${directusUser.id}`)
          this.stats.usersSkipped++
          continue
        }

        // Skip inactive users
        if (directusUser.status !== 'active') {
          this.logger.debug(`Skipping inactive user: ${directusUser.email}`)
          this.stats.usersSkipped++
          continue
        }

        // Check if user already exists
        const existingUser = await User.query().where('email', directusUser.email).first()

        if (existingUser) {
          this.logger.debug(`Skipping existing user: ${directusUser.email}`)
          this.stats.usersSkipped++
          continue
        }

        // Build user data
        const role = this.mapRole(directusUser.role_name)
        const name = this.buildFullName(directusUser)

        const userData = {
          id: directusUser.id,
          email: directusUser.email,
          name: name,
          password: null,
          role: role,
          githubUsername: directusUser.github_username || null,
          avatarUrl: directusUser.profile_picture || null,
          googleId: directusUser.provider === 'google' ? directusUser.external_identifier : null,
          isOrganizer: role === 'organizer' || role === 'superadmin',
          isCommunityMember: true,
          featured: false,
          bio: null,
          linkedinUrl: null,
          twitterUrl: null,
          websiteUrl: null,
        }

        if (!this.dryRun) {
          await User.create(userData)
        }

        this.logger.success(`Created user: ${directusUser.email} (${role})`)
        this.stats.usersCreated++
      } catch (error) {
        this.logger.error(`Failed to import user ${directusUser.email}: ${error}`)
        this.stats.usersErrors++
      }
    }
  }

  private buildFullName(directusUser: DirectusUser): string {
    if (directusUser.full_name) {
      return directusUser.full_name
    }

    const firstName = directusUser.first_name || ''
    const lastName = directusUser.last_name || ''
    const combined = `${firstName} ${lastName}`.trim()

    if (combined) {
      return combined
    }

    // Fallback to email username
    return directusUser.email?.split('@')[0] || 'Unknown'
  }

  private async importRsvps(directusRsvps: DirectusRsvp[], directusEvents: DirectusEvent[]) {
    this.logger.info('Importing RSVPs...')

    // Build event ID mapping: Directus int ID -> AdonisJS UUID
    const eventMapping = await this.buildEventMapping(directusEvents)
    this.logger.info(`Mapped ${eventMapping.size} events`)

    for (const directusRsvp of directusRsvps) {
      this.stats.rsvpsTotal++

      try {
        // Get mapped event UUID
        const eventUuid = eventMapping.get(directusRsvp.event_id)
        if (!eventUuid) {
          this.logger.debug(`Skipping RSVP - event ${directusRsvp.event_id} not found in mapping`)
          this.stats.rsvpsSkipped++
          continue
        }

        // Check if user exists
        const user = await User.find(directusRsvp.user_id)
        if (!user) {
          this.logger.debug(`Skipping RSVP - user ${directusRsvp.user_id} not found`)
          this.stats.rsvpsSkipped++
          continue
        }

        // Check if RSVP already exists
        const existingRsvp = await Rsvp.query()
          .where('userId', directusRsvp.user_id)
          .where('eventId', eventUuid)
          .first()

        if (existingRsvp) {
          this.logger.debug(
            `Skipping existing RSVP: user ${directusRsvp.user_id} -> event ${eventUuid}`
          )
          this.stats.rsvpsSkipped++
          continue
        }

        if (!this.dryRun) {
          await Rsvp.create({
            userId: directusRsvp.user_id,
            eventId: eventUuid,
            status: 'confirmed',
          })
        }

        this.stats.rsvpsCreated++
      } catch (error) {
        this.logger.error(`Failed to import RSVP: ${error}`)
        this.stats.rsvpsErrors++
      }
    }
  }

  private async buildEventMapping(directusEvents: DirectusEvent[]): Promise<Map<number, string>> {
    const mapping = new Map<number, string>()

    // Get all AdonisJS events
    const adonisEvents = await Event.all()

    for (const directusEvent of directusEvents) {
      // Parse Directus event date
      const directusDate = new Date(directusEvent.event_date)

      // Find matching AdonisJS event by title and date
      const matchingEvent = adonisEvents.find((adonisEvent) => {
        const adonisDate = adonisEvent.eventDate.toJSDate()

        // Match by date (same day)
        const sameDate =
          directusDate.getFullYear() === adonisDate.getFullYear() &&
          directusDate.getMonth() === adonisDate.getMonth() &&
          directusDate.getDate() === adonisDate.getDate()

        // Also try to match by title similarity
        const titleMatch =
          adonisEvent.title.toLowerCase().includes(directusEvent.title.toLowerCase()) ||
          directusEvent.title.toLowerCase().includes(adonisEvent.title.toLowerCase())

        // Fuzzy match: normalize titles by removing version numbers and comparing
        const normalizeTitle = (t: string) =>
          t
            .toLowerCase()
            .replace(/\d+\.\d+/g, '')
            .replace(/\s+/g, ' ')
            .trim()
        const fuzzyMatch = normalizeTitle(adonisEvent.title) === normalizeTitle(directusEvent.title)

        return sameDate || titleMatch || fuzzyMatch
      })

      if (matchingEvent) {
        mapping.set(directusEvent.id, matchingEvent.id)
        this.logger.debug(
          `Mapped event ${directusEvent.id} (${directusEvent.title}) -> ${matchingEvent.id}`
        )
      } else {
        this.logger.warning(
          `No mapping found for event ${directusEvent.id}: ${directusEvent.title}`
        )
      }
    }

    return mapping
  }

  private printSummary() {
    this.logger.info('')
    this.logger.info('═══════════════════════════════════════')
    this.logger.info('Import Summary')
    this.logger.info('═══════════════════════════════════════')
    this.logger.info('')
    this.logger.info('USERS:')
    this.logger.info(`  Total processed: ${this.stats.usersTotal}`)
    this.logger.success(`  Created: ${this.stats.usersCreated}`)
    this.logger.warning(`  Skipped: ${this.stats.usersSkipped}`)
    if (this.stats.usersErrors > 0) {
      this.logger.error(`  Errors: ${this.stats.usersErrors}`)
    }
    this.logger.info('')
    this.logger.info('RSVPs:')
    this.logger.info(`  Total processed: ${this.stats.rsvpsTotal}`)
    this.logger.success(`  Created: ${this.stats.rsvpsCreated}`)
    this.logger.warning(`  Skipped: ${this.stats.rsvpsSkipped}`)
    if (this.stats.rsvpsErrors > 0) {
      this.logger.error(`  Errors: ${this.stats.rsvpsErrors}`)
    }
    this.logger.info('═══════════════════════════════════════')

    if (this.dryRun) {
      this.logger.warning('')
      this.logger.warning('This was a DRY RUN - no changes were made.')
      this.logger.warning('Remove --dry-run flag to perform actual import.')
    }
  }
}
