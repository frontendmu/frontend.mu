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
    console.log('🚀 Starting database backup...')

    // Docker PostgreSQL configuration
    const dbConfig = {
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'postgres',
      database: 'frontendmu_docker_dev'
    }

    // Create backups directory
    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    fs.mkdirSync(backupsDir, { recursive: true })

    // Generate backup filename
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '')
    const backupFilename = `${dbConfig.database}_backup_${timestamp}.sql`
    const backupPath = path.join(backupsDir, backupFilename)

    try {
      console.log(`📊 Database: ${dbConfig.database}`)
      console.log(`📂 Backup location: ${backupPath}`)

      const startTime = Date.now()

      // Execute pg_dump
      execSync(
        `PGPASSWORD="${dbConfig.password}" pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} > "${backupPath}"`,
        {
          stdio: 'inherit',
          shell: '/bin/bash'
        }
      )

      // Check backup file
      const stats = fs.statSync(backupPath)
      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      console.log(`✅ Backup completed successfully!`)
      console.log(`📦 Size: ${(stats.size / 1024).toFixed(2)} KB`)
      console.log(`⏱️  Duration: ${duration}s`)
    } catch (error) {
      console.error('❌ Backup failed:', error.message)
      
      // Clean up incomplete backup
      if (fs.existsSync(backupPath)) {
        fs.unlinkSync(backupPath)
      }
      
      process.exit(1)
    }
  }
}