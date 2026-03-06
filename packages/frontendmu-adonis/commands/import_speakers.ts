import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import db from '@adonisjs/lucid/services/db'
import User from '#models/user'
import Session from '#models/session'

interface DirectusPerson {
  id: string
  name: string
  github_account: string | null
  featured: number | null
  status: string
}

interface DirectusSessionSpeaker {
  session_id: string
  title: string
  person_id: string
}

/**
 * Import speakers from Directus Person table and link them to sessions
 *
 * Usage:
 *   node ace import:speakers
 *   node ace import:speakers --dry-run
 */
export default class ImportSpeakers extends BaseCommand {
  static commandName = 'import:speakers'
  static description = 'Import speakers from Directus Person table and link to sessions'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Dry run - do not actually import' })
  declare dryRun: boolean

  private basePath = 'database/backups'

  private stats = {
    speakersTotal: 0,
    speakersCreated: 0,
    speakersLinked: 0,
    speakersSkipped: 0,
    speakersErrors: 0,
    relationsTotal: 0,
    relationsCreated: 0,
    relationsSkipped: 0,
    relationsErrors: 0,
  }

  // Map from Directus Person ID to AdonisJS User ID
  private personToUserMap = new Map<string, string>()

  async run() {
    this.logger.info('Starting speaker import...')

    if (this.dryRun) {
      this.logger.warning('DRY RUN - No changes will be made')
    }

    const personsFile = `${this.basePath}/directus_persons.json`
    const sessionSpeakersFile = `${this.basePath}/directus_session_speakers.json`

    if (!existsSync(personsFile)) {
      this.logger.error(`Persons file not found: ${personsFile}`)
      return
    }

    const persons: DirectusPerson[] = await this.loadJsonFile(personsFile)
    this.logger.info(`Loaded ${persons.length} persons (speakers) from Directus`)

    // Step 1: Import speakers as users
    await this.importSpeakers(persons)

    // Step 2: Create session-speaker relationships
    if (existsSync(sessionSpeakersFile)) {
      const sessionSpeakers: DirectusSessionSpeaker[] = await this.loadJsonFile(sessionSpeakersFile)
      this.logger.info(`Loaded ${sessionSpeakers.length} session-speaker relationships`)
      await this.importSessionSpeakers(sessionSpeakers)
    }

    this.printSummary()
  }

  private async loadJsonFile<T>(filePath: string): Promise<T[]> {
    const content = await readFile(filePath, 'utf-8')
    return JSON.parse(content)
  }

  private async importSpeakers(persons: DirectusPerson[]) {
    this.logger.info('Importing speakers...')

    for (const person of persons) {
      this.stats.speakersTotal++

      try {
        // Skip if no name
        if (!person.name || person.name.trim() === '') {
          this.logger.debug(`Skipping person without name: ${person.id}`)
          this.stats.speakersSkipped++
          continue
        }

        // Try to find existing user by:
        // 1. Same ID (Person ID was used as User ID in previous import)
        // 2. Same github username
        let existingUser = await User.find(person.id)

        if (!existingUser && person.github_account) {
          existingUser = await User.query()
            .whereRaw('LOWER(github_username) = ?', [person.github_account.toLowerCase()])
            .first()
        }

        if (existingUser) {
          // User exists - just map the ID and update speaker flag
          this.personToUserMap.set(person.id, existingUser.id)

          if (!this.dryRun) {
            // Mark as featured if person was featured
            if (person.featured === 1 && !existingUser.featured) {
              existingUser.featured = true
              await existingUser.save()
            }
          }

          this.logger.debug(`Linked existing user: ${existingUser.name} (${existingUser.id})`)
          this.stats.speakersLinked++
          continue
        }

        // Create new user for this speaker
        const userData = {
          id: person.id, // Keep the same ID for easier mapping
          name: person.name.trim(),
          email: null,
          password: null,
          role: 'member' as const,
          githubUsername: person.github_account || null,
          avatarUrl: null,
          googleId: null,
          isOrganizer: false,
          isCommunityMember: false,
          featured: person.featured === 1,
          bio: null,
          linkedinUrl: null,
          twitterUrl: null,
          websiteUrl: null,
        }

        if (!this.dryRun) {
          const newUser = await User.create(userData)
          this.personToUserMap.set(person.id, newUser.id)
        } else {
          this.personToUserMap.set(person.id, person.id)
        }

        this.logger.success(`Created speaker: ${person.name}`)
        this.stats.speakersCreated++
      } catch (error) {
        this.logger.error(`Failed to import speaker ${person.name}: ${error}`)
        this.stats.speakersErrors++
      }
    }
  }

  private async importSessionSpeakers(sessionSpeakers: DirectusSessionSpeaker[]) {
    this.logger.info('Creating session-speaker relationships...')

    // Build session title -> ID mapping for AdonisJS
    const sessionMapping = await this.buildSessionMapping()

    for (const rel of sessionSpeakers) {
      this.stats.relationsTotal++

      try {
        // Get the AdonisJS user ID for this person
        const userId = this.personToUserMap.get(rel.person_id)
        if (!userId) {
          this.logger.debug(`Skipping - no user found for person: ${rel.person_id}`)
          this.stats.relationsSkipped++
          continue
        }

        // Get the AdonisJS session ID by matching title
        const sessionId = sessionMapping.get(rel.title?.trim().toLowerCase() || '')
        if (!sessionId) {
          this.logger.debug(`Skipping - no session found for title: ${rel.title}`)
          this.stats.relationsSkipped++
          continue
        }

        // Check if relationship already exists
        const existing = await db
          .from('session_speakers')
          .where('session_id', sessionId)
          .where('speaker_id', userId)
          .first()

        if (existing) {
          this.logger.debug(
            `Skipping existing relationship: session ${sessionId} -> user ${userId}`
          )
          this.stats.relationsSkipped++
          continue
        }

        if (!this.dryRun) {
          await db.table('session_speakers').insert({
            session_id: sessionId,
            speaker_id: userId,
          })
        }

        this.stats.relationsCreated++
      } catch (error) {
        this.logger.error(`Failed to create session-speaker relationship: ${error}`)
        this.stats.relationsErrors++
      }
    }
  }

  private async buildSessionMapping(): Promise<Map<string, string>> {
    const mapping = new Map<string, string>()

    // Get all sessions from AdonisJS and map by normalized title
    const sessions = await Session.all()

    for (const session of sessions) {
      const normalizedTitle = session.title?.trim().toLowerCase() || ''
      if (normalizedTitle) {
        mapping.set(normalizedTitle, session.id)
      }
    }

    this.logger.info(`Found ${mapping.size} sessions in database`)
    return mapping
  }

  private printSummary() {
    this.logger.info('')
    this.logger.info('═══════════════════════════════════════')
    this.logger.info('Import Summary')
    this.logger.info('═══════════════════════════════════════')
    this.logger.info('')
    this.logger.info('SPEAKERS:')
    this.logger.info(`  Total processed: ${this.stats.speakersTotal}`)
    this.logger.success(`  Created: ${this.stats.speakersCreated}`)
    this.logger.info(`  Linked to existing: ${this.stats.speakersLinked}`)
    this.logger.warning(`  Skipped: ${this.stats.speakersSkipped}`)
    if (this.stats.speakersErrors > 0) {
      this.logger.error(`  Errors: ${this.stats.speakersErrors}`)
    }
    this.logger.info('')
    this.logger.info('SESSION-SPEAKER RELATIONSHIPS:')
    this.logger.info(`  Total processed: ${this.stats.relationsTotal}`)
    this.logger.success(`  Created: ${this.stats.relationsCreated}`)
    this.logger.warning(`  Skipped: ${this.stats.relationsSkipped}`)
    if (this.stats.relationsErrors > 0) {
      this.logger.error(`  Errors: ${this.stats.relationsErrors}`)
    }
    this.logger.info('═══════════════════════════════════════')

    if (this.dryRun) {
      this.logger.warning('')
      this.logger.warning('This was a DRY RUN - no changes were made.')
      this.logger.warning('Remove --dry-run flag to perform actual import.')
    }
  }
}
