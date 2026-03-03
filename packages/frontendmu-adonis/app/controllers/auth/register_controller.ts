import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import { registerValidator } from '#validators/register_validator'
import logger from '@adonisjs/core/services/logger'

export default class RegisterController {
  async show({ inertia }: HttpContext) {
    return inertia.render('auth/register')
  }

  async store({ request, response, session, auth }: HttpContext) {
    const data = await request.validateUsing(registerValidator)

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      session.flashErrors({ email: 'Unable to create account. Please try a different email or log in.' })
      return response.redirect().back()
    }

    try {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'member',
      })

      // Assign RBAC member role
      const memberRole = await Role.findBy('name', 'member')
      if (memberRole) {
        await user.related('roles').attach([memberRole.id])
      }

      await auth.use('web').login(user)

      session.flash('success', 'Account created successfully!')
    } catch (error) {
      logger.error({ err: error }, 'Registration failed')
      session.flashErrors({ form: 'Registration failed. Please try again later.' })
      return response.redirect().back()
    }

    return response.redirect('/')
  }
}
