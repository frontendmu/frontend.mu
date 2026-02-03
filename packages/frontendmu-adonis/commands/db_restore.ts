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
    console.log('🔄 Starting database restore...')

    // Docker PostgreSQL configuration
    const dbConfig = {
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'postgres',
      database: 'frontendmu_docker_dev',
    }

    const backupsDir = path.join(process.cwd(), 'database', 'backups')
    let selectedBackup: string

    if (this.backupFile) {
      selectedBackup = this.backupFile
      if (!fs.existsSync(selectedBackup)) {
        console.error(`❌ Backup file not found: ${selectedBackup}`)
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
        console.error('❌ No backup files found')
        process.exit(1)
      }

      selectedBackup = backups[0].path
    }

    console.log(`📂 Backup file: ${path.basename(selectedBackup)}`)
    console.log(`⚠️  This will replace all data in ${dbConfig.database}`)

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
      console.log('❌ Restore cancelled')
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

      console.log(`✅ Restore completed successfully!`)
      console.log(`⏱️  Duration: ${duration}s`)
    } catch (error) {
      console.error('❌ Restore failed:', error.message)
      process.exit(1)
    }
  }
}
