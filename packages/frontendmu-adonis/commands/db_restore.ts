import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbRestore extends BaseCommand {
  static commandName = 'db:restore'
  static description = 'Restore a database and uploads backup'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Timestamp of backup to restore (optional, uses latest)' })
  declare backupTimestamp?: string

  async run() {
    const dbPath = process.env.DB_DATABASE || 'tmp/db.production.sqlite3'
    const fullDbPath = path.resolve(process.cwd(), dbPath)
    const backupsDir = path.join(process.cwd(), 'database', 'backups')

    if (!fs.existsSync(backupsDir)) {
      this.logger.error('No backups directory found')
      process.exit(1)
    }

    // Find the backup timestamp to restore
    let timestamp: string

    if (this.backupTimestamp) {
      timestamp = this.backupTimestamp
    } else {
      const backups = fs
        .readdirSync(backupsDir)
        .filter((f) => f.startsWith('db_backup_') && f.endsWith('.sqlite3'))
        .sort()
        .reverse()

      if (backups.length === 0) {
        this.logger.error('No backup files found')
        process.exit(1)
      }

      timestamp = backups[0].replace('db_backup_', '').replace('.sqlite3', '')
    }

    const dbBackup = path.join(backupsDir, `db_backup_${timestamp}.sqlite3`)
    const uploadsBackup = path.join(backupsDir, `uploads_backup_${timestamp}.tar.gz`)

    if (!fs.existsSync(dbBackup)) {
      this.logger.error(`Database backup not found: ${dbBackup}`)
      process.exit(1)
    }

    this.logger.info(`Timestamp: ${timestamp}`)
    this.logger.info(`Database: ${path.basename(dbBackup)}`)
    this.logger.info(`Uploads: ${fs.existsSync(uploadsBackup) ? path.basename(uploadsBackup) : 'not found, skipping'}`)
    this.logger.warning(`This will replace: ${dbPath} and public/uploads/`)

    const confirmed = await this.prompt.confirm('Continue?')
    if (!confirmed) {
      this.logger.info('Restore cancelled')
      return
    }

    try {
      const startTime = Date.now()

      fs.copyFileSync(dbBackup, fullDbPath)
      this.logger.success('Database restored')

      if (fs.existsSync(uploadsBackup)) {
        execSync(`tar -xzf "${uploadsBackup}" -C public`)
        this.logger.success('Uploads restored')
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      this.logger.success(`Restore completed in ${duration}s`)
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`)
      process.exit(1)
    }
  }
}
