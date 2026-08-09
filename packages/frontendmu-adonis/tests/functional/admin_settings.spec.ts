import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import User from '#models/user'
import Role from '#models/role'
import SiteSetting from '#models/site_setting'

async function makeUser(roleName: 'superadmin' | 'member') {
  const user = await User.create({
    name: `Test ${roleName}`,
    email: `${roleName}-${Date.now()}-${Math.random()}@example.test`,
    password: 'password123',
  })
  const role = await Role.findByOrFail('name', roleName)
  await user.related('roles').sync([role.id])
  return user
}

test.group('Admin settings controller', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('redirects unauthenticated visitors to login', async ({ client, assert }) => {
    const response = await client.get('/admin/settings').redirects(0)
    response.assertStatus(302)
    assert.equal(response.header('location'), '/login')
  })

  test('denies users without manage-settings permission', async ({ client }) => {
    const member = await makeUser('member')
    const response = await client.get('/admin/settings').loginAs(member)
    response.assertStatus(403)
  })

  test('allows a superadmin to view and update settings', async ({ client, assert }) => {
    const admin = await makeUser('superadmin')

    const editResponse = await client.get('/admin/settings').loginAs(admin)
    editResponse.assertStatus(200)

    const updateResponse = await client.put('/admin/settings').loginAs(admin).redirects(0).json({
      calendarFeedEnabled: false,
      calendarAutoIncludeNewEvents: false,
      calendarIncludePastEvents: true,
    })

    updateResponse.assertStatus(302)

    const settings = await SiteSetting.current()
    assert.isFalse(settings.calendarFeedEnabled)
    assert.isFalse(settings.calendarAutoIncludeNewEvents)
    assert.isTrue(settings.calendarIncludePastEvents)
  })
})
