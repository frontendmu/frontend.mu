import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbRestore extends BaseCommand {
  static commandName = 'db:restore'
  static description = 'Restore a SQLite database backup'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Path to backup file (optional, uses latest if not specified)' })
  declare backupFile?: string

  async run() {
    const dbPath = process.env.DB_DATABASE || 'tmp/db.production.sqlite3'
    const fullDbPath = path.resolve(process.cwd(), dbPath)

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    let selectedBackup: string

    if (this.backupFile) {
      selectedBackup = path.resolve(this.backupFile)
      if (!fs.existsSync(selectedBackup)) {
        this.logger.error(`Backup file not found: ${selectedBackup}`)
        process.exit(1)
      }
    } else {
      if (!fs.existsSync(backupsDir)) {
        this.logger.error('No backups directory found')
        process.exit(1)
      }

      const backups = fs
        .readdirSync(backupsDir)
        .filter((f) => f.endsWith('.sqlite3'))
        .map((f) => ({
          file: f,
          path: path.join(backupsDir, f),
          mtime: fs.statSync(path.join(backupsDir, f)).mtime,
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())

      if (backups.length === 0) {
        this.logger.error('No backup files found')
        process.exit(1)
      }

      selectedBackup = backups[0].path
    }

    this.logger.info(`Backup: ${path.basename(selectedBackup)}`)
    this.logger.warning(`This will replace: ${dbPath}`)

    const confirmed = await this.prompt.confirm('Continue?')
    if (!confirmed) {
      this.logger.info('Restore cancelled')
      return
    }

    try {
      const startTime = Date.now()
      fs.copyFileSync(selectedBackup, fullDbPath)
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      this.logger.success(`Restore completed! (${duration}s)`)
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`)
      process.exit(1)
    }
  }
}
