import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { toSpeaker } from '#dtos/factories'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/frontendmu/frontend.mu/main/packages/frontendmu-data/data'

async function loadJson<T>(url: string, localPath: string): Promise<T> {
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV

  if (isProduction) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return (await response.json()) as T
      }
    } catch {
      // Failed to fetch from GitHub, fall back to local file
    }
  }

  return JSON.parse(readFileSync(localPath, 'utf-8')) as T
}

export default class TeamController {
  async index({ inertia }: HttpContext) {
    const organizersUrl = `${GITHUB_RAW_BASE}/organizers.json`
    const organizersPath = join(
      __dirname,
      '../../../../packages/frontendmu-data/data/organizers.json'
    )
    const organizers = await loadJson<any[]>(organizersUrl, organizersPath)

    const communityMembersUrl = `${GITHUB_RAW_BASE}/community_members.json`
    const communityMembersPath = join(
      __dirname,
      '../../../../packages/frontendmu-data/data/community_members.json'
    )
    const communityMembers = await loadJson<any[]>(communityMembersUrl, communityMembersPath)

    const contributorsUrl = `${GITHUB_RAW_BASE}/contributors.json`
    const contributorsPath = join(
      __dirname,
      '../../../../packages/frontendmu-data/data/contributors.json'
    )
    const contributors = await loadJson<any[]>(contributorsUrl, contributorsPath)

    const dbSpeakers = await User.query()
      .whereHas('sessions', () => {})
      .orderBy('featured', 'desc')
      .orderBy('name', 'asc')

    const speakers = dbSpeakers.map(toSpeaker)

    return inertia.render('team', {
      organizers,
      communityMembers,
      speakers,
      contributors,
    })
  }
}
