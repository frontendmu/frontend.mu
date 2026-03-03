import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import { execSync } from 'node:child_process'

export default class DbClear extends BaseCommand {
  static commandName = 'db:clear'
  static description = 'Drop and recreate the current database'

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

    this.logger.warning(`This will delete ALL data in ${dbConfig.database}!`)

    // Confirm
    const readline = require('node:readline')
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    const confirmed = await new Promise<boolean>((resolve) => {
      rl.question('Are you absolutely sure? Type "yes" to continue: ', (answer: string) => {
        rl.close()
        resolve(answer.toLowerCase() === 'yes')
      })
    })

    if (!confirmed) {
      this.logger.info('Operation cancelled')
      process.exit(0)
    }

    try {
      this.logger.info('Terminating active connections...')

      // Terminate connections
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbConfig.database}' AND pid <> pg_backend_pid();"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      this.logger.info('Dropping database...')

      // Drop database
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "DROP DATABASE IF EXISTS ${dbConfig.database};"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      this.logger.info('Creating database...')

      // Create database
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "CREATE DATABASE ${dbConfig.database};"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      this.logger.info('Creating UUID extension...')

      // Create UUID extension
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\";"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      this.logger.success(`Database ${dbConfig.database} has been cleared and recreated!`)
      this.logger.info('Run "node ace migration:run" to set up your schema')
    } catch (error) {
      this.logger.error(`Operation failed: ${error.message}`)
      process.exit(1)
    }
  }
}
