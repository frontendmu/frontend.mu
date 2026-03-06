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

  /**
   * Display history page
   */
  async history({ inertia }: HttpContext) {
    return inertia.render('history')
  }

  /**
   * Display contribute page
   */
  async contribute({ inertia }: HttpContext) {
    return inertia.render('contribute')
  }

  /**
   * Display coding guidelines page
   */
  async codingGuidelines({ inertia }: HttpContext) {
    return inertia.render('coding-guidelines')
  }

  /**
   * Display code of conduct page
   */
  async codeOfConduct({ inertia }: HttpContext) {
    return inertia.render('code-of-conduct')
  }
}
