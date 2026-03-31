import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbBackup extends BaseCommand {
  static commandName = 'db:backup'
  static description = 'Backup the SQLite database and uploaded files'

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

    try {
      const startTime = Date.now()

      // Backup database
      const dbBackupPath = path.join(backupsDir, `db_backup_${timestamp}.sqlite3`)
      execSync(`sqlite3 "${fullDbPath}" ".backup '${dbBackupPath}'"`)
      const dbSize = (fs.statSync(dbBackupPath).size / 1024).toFixed(2)
      this.logger.success(`Database: ${dbSize} KB → ${dbBackupPath}`)

      // Backup uploads
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
      if (fs.existsSync(uploadsDir)) {
        const uploadsBackupPath = path.join(backupsDir, `uploads_backup_${timestamp}.tar.gz`)
        execSync(`tar -czf "${uploadsBackupPath}" -C public uploads`)
        const uploadsSize = (fs.statSync(uploadsBackupPath).size / 1024).toFixed(2)
        this.logger.success(`Uploads: ${uploadsSize} KB → ${uploadsBackupPath}`)
      } else {
        this.logger.info('No uploads directory found, skipping')
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)
      this.logger.success(`Backup completed in ${duration}s`)
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`)
      process.exit(1)
    }
  }
}
