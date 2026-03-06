import { BaseCommand, args } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import hash from '@adonisjs/core/services/hash'

export default class UpdatePassword extends BaseCommand {
  static commandName = 'update:password'
  static description = 'Update user password'

  static options: CommandOptions = {}

  @args.string({ description: 'User email' })
  declare email: string

  @args.string({ description: 'New password' })
  declare password: string

  async run() {
    const user = await User.findBy('email', this.email)

    if (!user) {
      this.logger.error(`User with email ${this.email} not found`)
      return
    }

    user.password = await hash.use('scrypt').make(this.password)
    await user.save()

    this.logger.success(`Password updated for ${user.email}`)
  }
}
