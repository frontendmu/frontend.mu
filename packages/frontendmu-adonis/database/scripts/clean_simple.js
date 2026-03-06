#!/usr/bin/env node

/**
 * Database cleanup script
 * Removes all data from tables to allow re-running migration
 */

import pkg from 'pg'
const { Client } = pkg

// Database connection
const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

async function cleanDatabase() {
  console.log('🧹 Cleaning database...')

  try {
    await client.connect()

    // Delete in order to respect foreign key constraints
    console.log('Deleting event photos...')
    await client.query('DELETE FROM event_photos')

    console.log('Deleting session_speakers relationships...')
    await client.query('DELETE FROM session_speakers')

    console.log('Deleting sessions...')
    await client.query('DELETE FROM sessions')

    console.log('Deleting event_sponsors relationships...')
    await client.query('DELETE FROM event_sponsors')

    console.log('Deleting events...')
    await client.query('DELETE FROM events')

    console.log('Deleting sponsors...')
    await client.query('DELETE FROM sponsors')

    console.log('Deleting pages...')
    await client.query('DELETE FROM pages')

    console.log('Deleting users...')
    await client.query('DELETE FROM users')

    console.log('✅ Database cleaned successfully!')
    console.log('All tables are now empty.')

  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

// Run cleanup
cleanDatabase()
