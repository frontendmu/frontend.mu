import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/frontendmu/frontend.mu/main/packages/frontendmu-data/data'

async function loadJson<T>(url: string, localPath: string): Promise<T> {
  const isProduction = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV

  if (isProduction) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return await response.json() as T
      }
    } catch (error) {
      console.log('Failed to fetch from GitHub, falling back to local file:', url)
    }
  }

  // Fall back to local file
  return JSON.parse(readFileSync(localPath, 'utf-8')) as T
}

export default class TeamController {
  async index({ inertia }: HttpContext) {
    let organizers: any[] = []
    let communityMembers: any[] = []
    let speakers: any[] = []
    let contributors: any[] = []

    try {
      // Load organizers
      const organizersUrl = `${GITHUB_RAW_BASE}/organizers.json`
      const organizersPath = join(__dirname, '../../../../packages/frontendmu-data/data/organizers.json')
      organizers = await loadJson<any[]>(organizersUrl, organizersPath)

      // Load community members
      const communityMembersUrl = `${GITHUB_RAW_BASE}/community_members.json`
      const communityMembersPath = join(__dirname, '../../../../packages/frontendmu-data/data/community_members.json')
      communityMembers = await loadJson<any[]>(communityMembersUrl, communityMembersPath)

      // Load contributors
      const contributorsUrl = `${GITHUB_RAW_BASE}/contributors.json`
      const contributorsPath = join(__dirname, '../../../../packages/frontendmu-data/data/contributors.json')
      contributors = await loadJson<any[]>(contributorsUrl, contributorsPath)

      // Get speakers from database
      const dbSpeakers = await User.query()
        .where('role', 'speaker')
        .orderBy('featured', 'desc')
        .orderBy('name', 'asc')

      speakers = dbSpeakers.map((user) => this.serializeUser(user))
    } catch (error) {
      console.log('Error loading team data:', error.message || error)
    }

    return inertia.render('team', {
      organizers,
      communityMembers,
      speakers,
      contributors,
    })
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      github_account: user.githubUsername,
      avatar_url:
        user.avatarUrl ||
        (user.githubUsername ? `https://github.com/${user.githubUsername}.png` : null),
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      websiteUrl: user.websiteUrl,
      role: user.role,
    }
  }
}
