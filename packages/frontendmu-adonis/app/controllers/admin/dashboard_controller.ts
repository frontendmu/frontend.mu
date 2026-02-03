import type { HttpContext } from '@adonisjs/core/http'
import Event from '#models/event'
import User from '#models/user'
import Sponsor from '#models/sponsor'
import db from '@adonisjs/lucid/services/db'
import EventPolicy from '#policies/event_policy'

export default class DashboardController {
  /**
   * Show the admin dashboard
   */
  async index({ inertia, bouncer, response }: HttpContext) {
    // Only users with access-admin permission can access the dashboard (checked via viewAny policy)
    if (await bouncer.with(EventPolicy).denies('viewAny')) {
      return response.forbidden('You are not authorized to access the admin dashboard.')
    }

    // Get counts for dashboard stats
    const [eventCounts, userCount, speakerCount, sponsorCount] = await Promise.all([
      // Event counts by status
      Promise.all([
        Event.query().count('* as total').first(),
        Event.query().where('status', 'published').count('* as total').first(),
        Event.query().where('status', 'draft').count('* as total').first(),
        Event.query().where('status', 'cancelled').count('* as total').first(),
      ]),
      User.query().count('* as total').first(),
      // Count unique speakers from session_speakers pivot table
      db.from('session_speakers').countDistinct('speaker_id as total').first(),
      Sponsor.query().count('* as total').first(),
    ])

    const stats = {
      events: {
        total: Number(eventCounts[0]?.$extras.total || 0),
        published: Number(eventCounts[1]?.$extras.total || 0),
        draft: Number(eventCounts[2]?.$extras.total || 0),
        cancelled: Number(eventCounts[3]?.$extras.total || 0),
      },
      users: Number(userCount?.$extras.total || 0),
      speakers: Number(speakerCount?.total || 0),
      sponsors: Number(sponsorCount?.$extras.total || 0),
    }

    return inertia.render('admin/index', {
      stats,
    })
  }
}
