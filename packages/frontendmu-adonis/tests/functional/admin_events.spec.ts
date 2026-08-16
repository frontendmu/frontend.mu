import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Event from '#models/event'
import User from '#models/user'
import Role from '#models/role'

async function makeSuperadmin() {
  const user = await User.create({
    name: 'Test superadmin',
    email: `superadmin-${Date.now()}-${Math.random()}@example.test`,
    password: 'password123',
  })
  const role = await Role.findByOrFail('name', 'superadmin')
  await user.related('roles').sync([role.id])
  return user
}

async function makeEvent(includeInCalendar: boolean | null) {
  return Event.create({
    title: 'Override Test Meetup',
    eventDate: DateTime.now().plus({ days: 10 }),
    status: 'published',
    attendeeCount: 0,
    includeInCalendar,
  })
}

test.group('Admin events controller — calendar override', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('keeps an existing override when the update omits it', async ({ client, assert }) => {
    const admin = await makeSuperadmin()
    const event = await makeEvent(true)

    const response = await client
      .put(`/admin/events/${event.id}`)
      .loginAs(admin)
      .redirects(0)
      .json({ title: 'Renamed, calendar untouched' })

    response.assertStatus(302)

    await event.refresh()
    assert.equal(event.title, 'Renamed, calendar untouched')
    assert.isTrue(event.includeInCalendar)
  })

  test('keeps an existing "hide" override when the update omits it', async ({ client, assert }) => {
    const admin = await makeSuperadmin()
    const event = await makeEvent(false)

    await client
      .put(`/admin/events/${event.id}`)
      .loginAs(admin)
      .redirects(0)
      .json({ title: 'Still hidden from the calendar' })

    await event.refresh()
    assert.isFalse(event.includeInCalendar)
  })

  test('clears the override when null is sent explicitly', async ({ client, assert }) => {
    const admin = await makeSuperadmin()
    const event = await makeEvent(true)

    await client
      .put(`/admin/events/${event.id}`)
      .loginAs(admin)
      .redirects(0)
      .json({ title: 'Back to the global default', includeInCalendar: null })

    await event.refresh()
    assert.isNull(event.includeInCalendar)
  })
})
