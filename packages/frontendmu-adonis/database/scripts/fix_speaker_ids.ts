import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import pg from 'pg'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const { Client } = pg

const client = new Client({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number.parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'frontendmu_dev',
})

async function runMigration() {
  console.log('Fixing speaker IDs to match Strapi IDs...\n')

  try {
    await client.connect()

    // Load speakers from raw data
    const speakersPath = join(__dirname, '../../../frontendmu-data/data/speakers-raw.json')
    const speakersRaw: any[] = JSON.parse(readFileSync(speakersPath, 'utf-8'))

    // Create map of github_username -> strapi_id
    const githubToStrapiId = new Map<string, string>()
    for (const speaker of speakersRaw) {
      if (speaker.github_account) {
        githubToStrapiId.set(speaker.github_account.toLowerCase(), speaker.id)
      }
    }

    console.log('Loaded ' + githubToStrapiId.size + ' speaker mappings from raw data')

    // Find speakers with mismatched IDs
    const result = await client.query(`
      SELECT id, name, github_username
      FROM users
      WHERE role = 'speaker' AND github_username IS NOT NULL
    `)

    let fixedCount = 0
    let alreadyCorrect = 0

    for (const row of result.rows) {
      const strapiId = githubToStrapiId.get(row.github_username.toLowerCase())

      if (!strapiId) {
        console.log('  No Strapi ID found for: ' + row.name + ' (@' + row.github_username + ')')
        continue
      }

      if (row.id !== strapiId) {
        // Check if there's already a speaker with the Strapi ID
        const existingStrapi = await client.query('SELECT id FROM users WHERE id = $1', [strapiId])

        if (existingStrapi.rows.length > 0) {
          // There's already a speaker with the Strapi ID, merge them
          console.log(
            '  Merging ' +
              row.name +
              ' (@' +
              row.github_username +
              ') from ' +
              row.id.substring(0, 8) +
              ' to ' +
              strapiId.substring(0, 8)
          )

          // First update session_speakers to use the Strapi ID
          await client.query('UPDATE session_speakers SET speaker_id = $1 WHERE speaker_id = $2', [
            strapiId,
            row.id,
          ])

          // Then delete the old speaker
          await client.query('DELETE FROM users WHERE id = $1', [row.id])
        } else {
          // Just update the ID - need to update foreign keys first
          console.log(
            '  Fixing ' +
              row.name +
              ' (@' +
              row.github_username +
              ') from ' +
              row.id.substring(0, 8) +
              ' to ' +
              strapiId.substring(0, 8)
          )

          // First update session_speakers
          await client.query('UPDATE session_speakers SET speaker_id = $1 WHERE speaker_id = $2', [
            strapiId,
            row.id,
          ])

          // Then update the user ID
          await client.query('UPDATE users SET id = $1 WHERE id = $2', [strapiId, row.id])
        }

        fixedCount++
      } else {
        alreadyCorrect++
      }
    }

    console.log('\nResults:')
    console.log('  Fixed: ' + fixedCount)
    console.log('  Already correct: ' + alreadyCorrect)

    // Final summary
    const speakerCount = await client.query("SELECT COUNT(*) FROM users WHERE role = 'speaker'")
    const sessionCount = await client.query('SELECT COUNT(*) FROM session_speakers')

    console.log('\nFinal:')
    console.log('  Total speakers: ' + speakerCount.rows[0].count)
    console.log('  Total session-speaker links: ' + sessionCount.rows[0].count)

    console.log('\nDone!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

runMigration()
