import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { readFile } from 'node:fs/promises'
import { toSpeaker } from '#dtos/factories'
import app from '@adonisjs/core/services/app'

const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/frontendmu/frontend.mu/main/packages/frontendmu-data/data'

async function loadJson<T>(url: string, localPath: string): Promise<T> {
  if (app.inProduction) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return (await response.json()) as T
      }
    } catch {
      // Failed to fetch from GitHub, fall back to local file
    }
  }

  return JSON.parse(await readFile(localPath, 'utf-8')) as T
}

export default class TeamController {
  async index({ inertia }: HttpContext) {
    const organizersUrl = `${GITHUB_RAW_BASE}/organizers.json`
    const organizersPath = app.makePath('database/data/organizers.json')
    const organizers = await loadJson<any[]>(organizersUrl, organizersPath)

    const communityMembersUrl = `${GITHUB_RAW_BASE}/community_members.json`
    const communityMembersPath = app.makePath('database/data/community_members.json')
    const communityMembers = await loadJson<any[]>(communityMembersUrl, communityMembersPath)

    const contributorsUrl = `${GITHUB_RAW_BASE}/contributors.json`
    const contributorsPath = app.makePath('database/data/contributors.json')
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
