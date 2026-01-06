import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default class TeamController {
  async index({ inertia }: HttpContext) {
    let organizers: any[] = []
    let communityMembers: any[] = []
    let speakers: any[] = []
    let contributors: any[] = []

    try {
      // Load organizers from JSON
      const organizersPath = join(
        __dirname,
        '../../../../packages/frontendmu-data/data/organizers.json'
      )
      organizers = JSON.parse(readFileSync(organizersPath, 'utf-8'))

      // Load community members from JSON
      const communityMembersPath = join(
        __dirname,
        '../../../../packages/frontendmu-data/data/community_members.json'
      )
      communityMembers = JSON.parse(readFileSync(communityMembersPath, 'utf-8'))

      // Load contributors from JSON
      const contributorsPath = join(
        __dirname,
        '../../../../packages/frontendmu-data/data/contributors.json'
      )
      contributors = JSON.parse(readFileSync(contributorsPath, 'utf-8'))

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
