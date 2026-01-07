import type { HttpContext } from '@adonisjs/core/http'

export default class LogoutController {
  async handle({ auth, response, session }: HttpContext) {
    await auth.use('web').logout()

    session.flash('success', 'You have been logged out.')

    return response.redirect('/')
  }
}
