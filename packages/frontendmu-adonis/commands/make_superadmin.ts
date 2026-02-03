import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/ace'
import User from '#models/user'

export default class MakeSuperadmin extends BaseCommand {
  static commandName = 'make:superadmin'
  static description = 'Set a user as superadmin by their email'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of the user to make superadmin' })
  email!: string

  async run() {
    const user = await User.findBy('email', this.email)

    if (!user) {
      this.logger.error(`User with email "${this.email}" not found`)
      return
    }

    user.role = 'superadmin'
    await user.save()

    this.logger.success(`User "${user.name}" (${user.email}) is now a superadmin`)
  }
}
