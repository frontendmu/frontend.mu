import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { readFile } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'
import { resolveAvatarUrl } from '../lib/avatar_url.js'
import SpeakerTransformer from '#transformers/speaker_transformer'

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

function toTeamMember(user: User, defaultRole: string) {
  return {
    id: user.id,
    name: user.name,
    role: user.title || defaultRole,
    imageUrl: resolveAvatarUrl(user),
    linkedin: user.linkedinUrl,
  }
}

export default class TeamController {
  async index({ inertia }: HttpContext) {
    const dbOrganizers = await User.query().where('isOrganizer', true).orderBy('name', 'asc')

    const organizers = dbOrganizers.map((u) => toTeamMember(u, 'Organizer'))

    const dbCommunityMembers = await User.query()
      .where('isCommunityMember', true)
      .orderBy('name', 'asc')

    const communityMembers = dbCommunityMembers.map((u) => toTeamMember(u, 'Community Member'))

    const contributorsUrl = `${GITHUB_RAW_BASE}/contributors.json`
    const contributorsPath = app.makePath('database/data/contributors.json')
    const contributors = await loadJson<any[]>(contributorsUrl, contributorsPath)

    const dbSpeakers = await User.query()
      .whereHas('sessions', () => {})
      .orderBy('featured', 'desc')
      .orderBy('name', 'asc')

    const speakers = SpeakerTransformer.transform(dbSpeakers)

    return inertia.render('team', {
      organizers,
      communityMembers,
      speakers,
      contributors,
    })
  }
}
