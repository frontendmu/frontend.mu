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
    console.log('🗑️  Database Clear')

    // Docker PostgreSQL configuration
    const dbConfig = {
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: 'postgres',
      database: 'frontendmu_docker_dev',
    }

    console.log(`⚠️  WARNING: This will delete ALL data in ${dbConfig.database}!`)

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
      console.log('❌ Operation cancelled')
      process.exit(0)
    }

    try {
      console.log('📋 Terminating active connections...')

      // Terminate connections
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${dbConfig.database}' AND pid <> pg_backend_pid();"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      console.log('🗑️  Dropping database...')

      // Drop database
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "DROP DATABASE IF EXISTS ${dbConfig.database};"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      console.log('🆕 Creating database...')

      // Create database
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d postgres -c "CREATE DATABASE ${dbConfig.database};"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      console.log('🔌 Creating UUID extension...')

      // Create UUID extension
      execSync(
        `PGPASSWORD="${dbConfig.password}" psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -c "CREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\";"`,
        { stdio: 'inherit', shell: '/bin/bash' }
      )

      console.log(`✅ Database ${dbConfig.database} has been cleared and recreated!`)
      console.log('💡 Run "node ace migration:run" to set up your schema')
    } catch (error) {
      console.error('❌ Operation failed:', error.message)
      process.exit(1)
    }
  }
}
