import type { HttpContext } from '@adonisjs/core/http'

export default class PagesController {
  /**
   * Display sponsor-us page
   */
  async sponsorUs({ inertia }: HttpContext) {
    return inertia.render('sponsor-us')
  }

  /**
   * Display about page
   */
  async about({ inertia }: HttpContext) {
    return inertia.render('about')
  }

  /**
   * Display community page
   */
  async community({ inertia }: HttpContext) {
    return inertia.render('community')
  }

  /**
   * Display branding page
   */
  async branding({ inertia }: HttpContext) {
    return inertia.render('branding')
  }
}
