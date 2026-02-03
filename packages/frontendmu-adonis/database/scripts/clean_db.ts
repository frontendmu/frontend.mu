#!/usr/bin/env tsx

/**
 * Database Cleanup Script
 *
 * This script cleans all data from the database tables
 * Useful for resetting the database before re-running migrations
 */

import { Database } from '@adonisjs/lucid/database'
import { BaseModel } from '@adonisjs/lucid/orm'

// Initialize the database connection
const db = new Database({
  connection: 'postgres',
  connections: {
    postgres: {
      client: 'pg',
      connection: {
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'frontendmu_dev',
      },
    },
  },
})

// Set the database instance for models
BaseModel.useConnection(db.connection())

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')

  try {
    // Delete in order to respect foreign key constraints
    console.log('Deleting event photos...')
    await db.connection().table('event_photos').delete()

    console.log('Deleting session_speakers relationships...')
    await db.connection().table('session_speakers').delete()

    console.log('Deleting sessions...')
    await db.connection().table('sessions').delete()

    console.log('Deleting event_sponsors relationships...')
    await db.connection().table('event_sponsors').delete()

    console.log('Deleting events...')
    await db.connection().table('events').delete()

    console.log('Deleting sponsors...')
    await db.connection().table('sponsors').delete()

    console.log('Deleting pages...')
    await db.connection().table('pages').delete()

    console.log('Deleting users...')
    await db.connection().table('users').delete()

    console.log('✅ Database cleaned successfully!')
    console.log('All tables are now empty.')
  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    process.exit(1)
  } finally {
    await db.manager.closeAll()
  }
}

// Run cleanup
cleanDatabase()
