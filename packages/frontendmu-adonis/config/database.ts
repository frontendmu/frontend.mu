import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: env.get('DB_HOST', 'localhost'),
        port: env.get('DB_PORT', 5432),
        user: env.get('DB_USER', 'postgres'),
        password: env.get('DB_PASSWORD', 'postgres'),
        database: env.get('DB_DATABASE', 'frontendmu_dev'),
        // Add explicit connection settings
        ssl: env.get('DB_SSL', false),
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10, // connection pool
      },
      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
