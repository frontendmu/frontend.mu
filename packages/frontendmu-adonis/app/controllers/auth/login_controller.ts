import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import User from '#models/user'
import { loginValidator } from '#validators/login_validator'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, response, session, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.redirect().toPath(urlFor('home'))
    } catch {
      session.flash('inputErrorsBag', { login: 'Invalid credentials' })
      return response.redirect().back()
    }
  }
}
