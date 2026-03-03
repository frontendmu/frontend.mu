import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'

export default class DbRestore extends BaseCommand {
  static commandName = 'db:restore'
  static description = 'Restore a database backup'

  static options: CommandOptions = {
    startApp: false,
  }

  @args.string({ description: 'Path to backup file (optional, uses latest if not specified)' })
  declare backupFile?: string

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

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    let selectedBackup: string

    if (this.backupFile) {
      selectedBackup = this.backupFile
      if (!fs.existsSync(selectedBackup)) {
        this.logger.error(`Backup file not found: ${selectedBackup}`)
        process.exit(1)
      }
    } else {
      // Find most recent backup
      const backups = fs
        .readdirSync(backupsDir)
        .filter((f) => f.endsWith('.sql'))
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

    this.logger.info(`Backup file: ${path.basename(selectedBackup)}`)
    this.logger.warning(`This will replace all data in ${dbConfig.database}`)

    // Confirm
    const readline = require('node:readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const confirmed = await new Promise<boolean>((resolve) => {
      rl.question('Continue? (y/N) ', (answer: string) => {
        rl.close()
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes')
      })
    })

    if (!confirmed) {
      this.logger.info('Restore cancelled')
      process.exit(0)
    }

    try {
      const startTime = Date.now()

      // Execute psql restore
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} < "${selectedBackup}"`,
        {
          stdio: 'inherit',
          shell: '/bin/bash',
        }
      )

      const duration = ((Date.now() - startTime) / 1000).toFixed(2)

      this.logger.success('Restore completed successfully!')
      this.logger.info(`Duration: ${duration}s`)
    } catch (error) {
      this.logger.error(`Restore failed: ${error.message}`)
      process.exit(1)
    }
  }
}
