import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbBackup extends BaseCommand {
  static commandName = 'db:backup'
  static description = 'Create a backup of the SQLite database'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    const dbPath = process.env.DB_DATABASE || 'tmp/db.production.sqlite3'
    const fullDbPath = path.resolve(process.cwd(), dbPath)

    if (!fs.existsSync(fullDbPath)) {
      this.logger.error(`Database not found: ${fullDbPath}`)
      process.exit(1)
    }

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    fs.mkdirSync(backupsDir, { recursive: true })

    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const backupFilename = `db_backup_${timestamp}.sqlite3`
    const backupPath = path.join(backupsDir, backupFilename)

    try {
      this.logger.info(`Database: ${dbPath}`)
      this.logger.info(`Backup location: ${backupPath}`)

      const startTime = Date.now()

      execSync(`sqlite3 "${fullDbPath}" ".backup '${backupPath}'"`)

      const stats = fs.statSync(backupPath)
      const sizeKb = (stats.size / 1024).toFixed(2)
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      this.logger.success(`Backup completed! (${sizeKb} KB, ${duration}s)`)
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`)
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
      process.exit(1)
    }
  }
}
