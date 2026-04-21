import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.defer(async (db) => {
      const memberRole = await db.from('roles').where('name', 'member').first()
      if (!memberRole) return

      const roleless = await db
        .from('users')
        .leftJoin('user_roles', 'users.id', 'user_roles.user_id')
        .whereNull('user_roles.user_id')
        .select('users.id')

      if (roleless.length === 0) return

      const now = new Date()
      await db.table('user_roles').insert(
        roleless.map((u) => ({
          user_id: u.id,
          role_id: memberRole.id,
          created_at: now,
        }))
      )
    })
  }

  async down() {
    // No-op: backfilled assignments are indistinguishable from pre-existing ones.
  }
}
