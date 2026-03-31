import { BaseCommand, args, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'
import Role from '#models/role'
import hash from '@adonisjs/core/services/hash'

export default class MakeSuperadmin extends BaseCommand {
  static commandName = 'make:superadmin'
  static description = 'Create or promote a user to superadmin with login credentials'

  static options: CommandOptions = {
    startApp: true,
  }

  @args.string({ description: 'Email of the superadmin user' })
  declare email: string

  @flags.string({ description: 'Password for the user (will be prompted if not provided)' })
  declare password: string

  @flags.string({ description: 'Name of the user (used when creating a new user)' })
  declare name: string

  async run() {
    let user = await User.findBy('email', this.email)

    const password =
      this.password ||
      (await this.prompt.secure('Enter password for superadmin', {
        validate: (value) => (value.length >= 8 ? true : 'Password must be at least 8 characters'),
      }))

    if (!user) {
      // No user with this email - check if we should create one
      const name =
        this.name ||
        (await this.prompt.ask('No user found with this email. Enter a name to create one'))

      user = await User.create({
        email: this.email,
        name,
        password,
        role: 'superadmin',
      })

      this.logger.success(`Created new superadmin user "${user.name}" (${user.email})`)
    } else {
      // Existing user - update role and set password
      user.role = 'superadmin'
      user.password = await hash.make(password)
      await user.save()

      this.logger.success(`Updated user "${user.name}" (${user.email}) to superadmin`)
    }

    // Assign RBAC superadmin role
    const superadminRole = await Role.findBy('name', 'superadmin')
    if (superadminRole) {
      const existingRoles = await user.related('roles').query().where('roles.id', superadminRole.id)
      if (existingRoles.length === 0) {
        await user.related('roles').attach([superadminRole.id])
        this.logger.success('Assigned RBAC superadmin role')
      } else {
        this.logger.info('RBAC superadmin role already assigned')
      }
    } else {
      this.logger.warning('RBAC superadmin role not found - run the rbac_seeder first')
    }
  }
}
