import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class LoginController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/login')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])

    console.log('[Login] Attempting login for:', email)
    console.log('[Login] Password provided:', password ? 'yes' : 'no')

    try {
      // Check if user exists first
      const userCheck = await User.findBy('email', email)
      console.log('[Login] User found in DB:', userCheck ? 'yes' : 'no')
      if (userCheck) {
        console.log('[Login] User ID:', userCheck.id)
        console.log('[Login] User password hash preview:', userCheck.password?.substring(0, 50))
      }

      console.log('[Login] Calling User.verifyCredentials...')
      const user = await User.verifyCredentials(email, password)
      console.log('[Login] Credentials verified successfully for user:', user.id)

      console.log('[Login] Logging in user...')
      await auth.use('web').login(user)
      console.log('[Login] Login successful, redirecting to /')

      return response.redirect('/')
    } catch (error) {
      console.log('[Login] Login failed with error:', error.message)
      console.log('[Login] Error stack:', error.stack)
      session.flash('errors', { login: 'Invalid credentials' })
      return response.redirect().back()
    }
  }
}
