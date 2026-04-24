import type { HttpContext } from '@adonisjs/core/http'
import { urlFor } from '@adonisjs/core/services/url_builder'
import User from '#models/user'
import { loginValidator } from '#validators/login_validator'
import { safeReturnUrl } from '../../lib/safe_return_url.js'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, response, session, auth }: HttpContext) {
    const { email, password } = await request.validateUsing(loginValidator)
    const next = safeReturnUrl(request.input('next'))

    try {
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      if (next) {
        return response.redirect().toPath(next)
      }
      return response.redirect().toPath(urlFor('home'))
    } catch {
      session.flash('inputErrorsBag', { login: 'Invalid credentials' })
      return response.redirect().back()
    }
  }
}
