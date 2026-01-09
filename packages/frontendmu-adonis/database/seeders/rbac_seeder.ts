import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Role from '#models/role'
import Permission from '#models/permission'
import db from '@adonisjs/lucid/services/db'

/**
 * RBAC Seeder
 * 
 * Creates the default roles and permissions for the application.
 * Also migrates existing users from the legacy single-role column to the new system.
 */
export default class RbacSeeder extends BaseSeeder {
  public async run() {
    console.log('🔐 Setting up RBAC system...')

    // ==========================================
    // 1. Create Permissions
    // ==========================================
    console.log('📝 Creating permissions...')

    const permissionsData = [
      // Event permissions
      { name: 'view-events', description: 'View published events' },
      { name: 'create-event', description: 'Create new events' },
      { name: 'edit-event', description: 'Edit existing events' },
      { name: 'delete-event', description: 'Delete events' },
      { name: 'publish-event', description: 'Publish/unpublish events' },

      // RSVP permissions
      { name: 'create-rsvp', description: 'RSVP to events' },
      { name: 'cancel-rsvp', description: 'Cancel own RSVP' },
      { name: 'view-rsvps', description: 'View event RSVP list' },
      { name: 'manage-rsvps', description: 'Manage RSVPs (confirm, waitlist, etc.)' },

      // User permissions
      { name: 'view-users', description: 'View user list' },
      { name: 'edit-user', description: 'Edit user profiles' },
      { name: 'delete-user', description: 'Delete users' },
      { name: 'assign-roles', description: 'Assign roles to users' },

      // Speaker permissions
      { name: 'view-speakers', description: 'View speaker profiles' },
      { name: 'create-speaker', description: 'Create speaker profiles' },
      { name: 'edit-speaker', description: 'Edit speaker profiles' },
      { name: 'delete-speaker', description: 'Delete speaker profiles' },

      // Session permissions
      { name: 'view-sessions', description: 'View sessions' },
      { name: 'create-session', description: 'Create sessions' },
      { name: 'edit-session', description: 'Edit sessions' },
      { name: 'delete-session', description: 'Delete sessions' },

      // Sponsor permissions
      { name: 'view-sponsors', description: 'View sponsors' },
      { name: 'create-sponsor', description: 'Create sponsors' },
      { name: 'edit-sponsor', description: 'Edit sponsors' },
      { name: 'delete-sponsor', description: 'Delete sponsors' },

      // Admin permissions
      { name: 'access-admin', description: 'Access admin dashboard' },
      { name: 'view-analytics', description: 'View analytics and reports' },
      { name: 'manage-settings', description: 'Manage application settings' },
    ]

    const permissions: Record<string, Permission> = {}

    for (const perm of permissionsData) {
      const permission = await Permission.updateOrCreate(
        { name: perm.name },
        { name: perm.name, description: perm.description }
      )
      permissions[perm.name] = permission
    }

    console.log(`   ✅ Created ${Object.keys(permissions).length} permissions`)

    // ==========================================
    // 2. Create Roles
    // ==========================================
    console.log('👥 Creating roles...')

    const rolesData = [
      {
        name: 'superadmin',
        description: 'Full system access',
        permissions: Object.keys(permissions), // All permissions
      },
      {
        name: 'organizer',
        description: 'Can manage events, speakers, sponsors, and RSVPs',
        permissions: [
          'view-events', 'create-event', 'edit-event', 'publish-event',
          'create-rsvp', 'cancel-rsvp', 'view-rsvps', 'manage-rsvps',
          'view-users', 'edit-user',
          'view-speakers', 'create-speaker', 'edit-speaker',
          'view-sessions', 'create-session', 'edit-session',
          'view-sponsors', 'create-sponsor', 'edit-sponsor',
          'access-admin', 'view-analytics',
        ],
      },
      {
        name: 'member',
        description: 'Regular community member who can RSVP to events',
        permissions: [
          'view-events',
          'create-rsvp', 'cancel-rsvp',
          'view-speakers',
          'view-sessions',
          'view-sponsors',
        ],
      },
      {
        name: 'viewer',
        description: 'Can only view public content',
        permissions: [
          'view-events',
          'view-speakers',
          'view-sessions',
          'view-sponsors',
        ],
      },
    ]

    const roles: Record<string, Role> = {}

    for (const roleData of rolesData) {
      const role = await Role.updateOrCreate(
        { name: roleData.name },
        { name: roleData.name, description: roleData.description }
      )
      roles[roleData.name] = role

      // Assign permissions to role
      const permissionIds = roleData.permissions
        .map((permName) => permissions[permName]?.id)
        .filter((id): id is number => id !== undefined)

      // Clear existing and set new permissions
      await role.related('permissions').sync(permissionIds)
    }

    console.log(`   ✅ Created ${Object.keys(roles).length} roles`)

    // ==========================================
    // 3. Migrate existing users
    // ==========================================
    console.log('🔄 Migrating existing users to new role system...')

    // Map old role names to new role names
    const roleMapping: Record<string, string> = {
      'superadmin': 'superadmin',
      'admin': 'superadmin',        // Legacy admin -> superadmin
      'organizer': 'organizer',
      'speaker': 'member',          // Speakers are members with speaker sessions
      'member': 'member',
      'community_member': 'member', // Legacy community_member -> member
      'viewer': 'viewer',
    }

    // Get all users with their current legacy role
    const users = await db.from('users').select('id', 'role')

    let migratedCount = 0
    let skippedCount = 0

    for (const user of users) {
      const oldRole = user.role as string
      const newRoleName = roleMapping[oldRole] || 'member'
      const newRole = roles[newRoleName]

      if (!newRole) {
        console.log(`   ⚠️  No mapping for role "${oldRole}", assigning member role`)
        continue
      }

      // Check if user already has this role
      const existingAssignment = await db
        .from('user_roles')
        .where('user_id', user.id)
        .where('role_id', newRole.id)
        .first()

      if (existingAssignment) {
        skippedCount++
        continue
      }

      // Assign the role to the user
      await db.table('user_roles').insert({
        user_id: user.id,
        role_id: newRole.id,
        created_at: new Date(),
      })

      migratedCount++
    }

    console.log(`   ✅ Migrated ${migratedCount} users (${skippedCount} already had roles)`)

    // ==========================================
    // Summary
    // ==========================================
    console.log('')
    console.log('🎉 RBAC setup complete!')
    console.log('')
    console.log('📊 Summary:')
    console.log(`   - Permissions: ${Object.keys(permissions).length}`)
    console.log(`   - Roles: ${Object.keys(roles).length}`)
    console.log(`   - Users migrated: ${migratedCount}`)
    console.log('')
    console.log('💡 Usage examples:')
    console.log('   await user.hasRole("organizer")  // Check role')
    console.log('   await user.can("create-event")   // Check permission')
    console.log('   await user.canAny(["edit-event", "delete-event"])')
  }
}
