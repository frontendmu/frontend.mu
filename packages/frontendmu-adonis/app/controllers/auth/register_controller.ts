import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const name = request.input('name')
    const email = request.input('email')
    const password = request.input('password')
    const confirmPassword = request.input('confirm_password')

    const errors: Record<string, string> = {}

    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email || !email.includes('@')) {
      errors.email = 'Please enter a valid email'
    }

    if (!password || password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      session.flashErrors(errors)
      return response.redirect().back()
    }

    const existingUser = await User.findBy('email', email)
    if (existingUser) {
      session.flashErrors({ email: 'An account with this email already exists' })
      return response.redirect().back()
    }

    try {
      // Don't manually hash - the User model will handle this automatically
      const user = await User.create({
        name,
        email,
        password,
        role: 'member',
      })

      await auth.use('web').login(user)

      session.flash('success', 'Account created successfully!')
    } catch (error) {
      console.error('Registration error:', error)
      session.flashErrors({ form: `Registration failed: ${error.message}` })
      return response.redirect().back()
    }

    return response.redirect('/')
  }
}
