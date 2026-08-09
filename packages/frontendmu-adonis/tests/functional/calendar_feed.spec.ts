import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import testUtils from '@adonisjs/core/services/test_utils'
import Event from '#models/event'
import SiteSetting from '#models/site_setting'

test.group('Calendar feed (/api/public/meetups.ics)', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('serves a valid ICS payload with the correct content type', async ({ client, assert }) => {
    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.equal(response.header('content-type'), 'text/calendar; charset=utf-8')
    assert.include(response.text(), 'BEGIN:VCALENDAR')
    assert.include(response.text(), 'END:VCALENDAR')
  })

  test('includes an upcoming published event by default', async ({ client, assert }) => {
    await SiteSetting.current()
    const event = await Event.create({
      title: 'Calendar Feed Test Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), `UID:${event.id}`)
    assert.include(response.text(), 'SUMMARY:Calendar Feed Test Meetup')
  })

  test('excludes an event explicitly hidden via includeInCalendar', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Explicitly Hidden Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
      includeInCalendar: false,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.notInclude(response.text(), `UID:${event.id}`)
  })

  test('excludes draft events', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Draft Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'draft',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.notInclude(response.text(), `UID:${event.id}`)
  })

  test('keeps cancelled events in the feed, marked as cancelled', async ({ client, assert }) => {
    const event = await Event.create({
      title: 'Cancelled Meetup',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'cancelled',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), `UID:${event.id}`)
    assert.include(response.text(), 'STATUS:CANCELLED')
  })

  test('serves an empty (but valid) calendar when the feed is disabled', async ({
    client,
    assert,
  }) => {
    const settings = await SiteSetting.current()
    settings.merge({ calendarFeedEnabled: false })
    await settings.save()

    await Event.create({
      title: 'Should Not Appear',
      eventDate: DateTime.now().plus({ days: 10 }),
      status: 'published',
      attendeeCount: 0,
    })

    const response = await client.get('/api/public/meetups.ics')

    response.assertStatus(200)
    assert.include(response.text(), 'BEGIN:VCALENDAR')
    assert.notInclude(response.text(), 'BEGIN:VEVENT')
  })
})
