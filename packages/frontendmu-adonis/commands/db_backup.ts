import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbBackup extends BaseCommand {
  static commandName = 'db:backup'
  static description = 'Create a backup of the current database'

  static options: CommandOptions = {
    startApp: false,
  }

  async run() {
    const dbConfig = {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    }

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      this.logger.error('Missing required DB environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE)')
      process.exit(1)
    }

    // Create backups directory
    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    fs.mkdirSync(backupsDir, { recursive: true })

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const backupFilename = `${dbConfig.database}_backup_${timestamp}.sql`
    const backupPath = path.join(backupsDir, backupFilename)

    try {
      this.logger.info(`Database: ${dbConfig.database}`)
      this.logger.info(`Backup location: ${backupPath}`)

      const startTime = Date.now()

      // Execute pg_dump
      execSync(
        `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} > "${backupPath}"`,
        {
          stdio: 'inherit',
          shell: '/bin/bash',
        }
      )

      // Check backup file
      const stats = fs.statSync(backupPath)
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      this.logger.success('Backup completed successfully!')
      this.logger.info(`Size: ${(stats.size / 1024).toFixed(2)} KB`)
      this.logger.info(`Duration: ${duration}s`)
    } catch (error) {
      this.logger.error(`Backup failed: ${error.message}`)

      // Clean up incomplete backup
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }

      process.exit(1)
    }
  }
}
