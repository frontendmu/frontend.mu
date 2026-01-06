import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class TeamController {
  /**
   * Display team page with organizers and speakers
   */
  async index({ inertia }: HttpContext) {
    let organizers: any[] = []
    let speakers: any[] = []

    try {
      const dbOrganizers = await User.query()
        .where('role', 'organizer')
        .orWhere('role', 'admin')
        .orderBy('name', 'asc')

      organizers = dbOrganizers.map((user) => this.serializeUser(user))

      const dbSpeakers = await User.query()
        .where('role', 'speaker')
        .orderBy('featured', 'desc')
        .orderBy('name', 'asc')
        .limit(20)

      speakers = dbSpeakers.map((user) => this.serializeUser(user))
    } catch (error) {
      console.log('Database not available, using empty data')
    }

    return inertia.render('team', {
      organizers,
      speakers,
    })
  }

  /**
   * Serialize user for frontend
   */
  private serializeUser(user: User) {
    return {
      id: user.id,
      name: user.name,
      github_account: user.githubUsername,
      avatarUrl:
        user.avatarUrl ||
        (user.githubUsername
          ? `https://avatars.githubusercontent.com/${user.githubUsername}`
          : null),
      linkedinUrl: user.linkedinUrl,
      twitterUrl: user.twitterUrl,
      websiteUrl: user.websiteUrl,
      role: user.role,
    }
  }
}
