import { test } from '@japa/runner'
import User from '#models/user'

/**
 * Smoke coverage for the routes that matter most: the Inertia pages the
 * public sees, the public JSON API, and the session login flow. These run
 * against a copy of the seeded dev database (see tests/bootstrap.ts).
 */

const SEEDED_ADMIN = { email: 'rajnikant@super.com', password: 'password1234' }
const SESSION_COOKIE = 'adonis-session'

test.group('Public pages', () => {
  for (const route of ['/', '/meetups', '/speakers', '/sponsors', '/team', '/about', '/login']) {
    test(`GET ${route} renders the Inertia shell`, async ({ client, assert }) => {
      const response = await client.get(route)

      response.assertStatus(200)
      assert.match(response.header('content-type') ?? '', /text\/html/)
      response.assertTextIncludes('id="app"')
    })
  }

  test('GET /meetup/:slug renders a published meetup', async ({ client }) => {
    const api = await client.get('/api/public/v1/meetups')
    const [first] = api.body() as Array<{ slug: string }>

    const response = await client.get(`/meetup/${first.slug}`)

    response.assertStatus(200)
    response.assertTextIncludes('id="app"')
  })

  test('GET /sitemap.xml lists the home page', async ({ client, assert }) => {
    const response = await client.get('/sitemap.xml')

    response.assertStatus(200)
    assert.match(response.header('content-type') ?? '', /xml/)
    response.assertTextIncludes('<urlset')
  })

  test('unknown routes return the 404 page', async ({ client }) => {
    const response = await client.get('/definitely-not-a-route')

    response.assertStatus(404)
  })
})

test.group('Public API', () => {
  test('GET /api/public/v1/meetups returns published meetups newest first', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/public/v1/meetups')

    response.assertStatus(200)
    response.assertHeader('cache-control', 'public, max-age=60, stale-while-revalidate=300')

    const meetups = response.body() as Array<{ id: string; slug: string; date: string }>
    assert.isArray(meetups)
    assert.isAbove(meetups.length, 10)
    assert.properties(meetups[0], ['id', 'slug', 'title', 'date'])

    const dates = meetups.map((meetup) => meetup.date)
    assert.deepEqual(dates, [...dates].sort().reverse())
  })

  test('GET /api/public/v1/meetups/:slug returns the detail variant', async ({
    client,
    assert,
  }) => {
    const list = await client.get('/api/public/v1/meetups')
    const [first] = list.body() as Array<{ id: string; slug: string }>

    const bySlug = await client.get(`/api/public/v1/meetups/${first.slug}`)
    bySlug.assertStatus(200)
    assert.equal(bySlug.body().slug, first.slug)
    assert.property(bySlug.body(), 'sessions')

    const byId = await client.get(`/api/public/v1/meetups/${first.id}`)
    byId.assertStatus(200)
    assert.equal(byId.body().id, first.id)
  })

  test('GET /api/public/v1/meetups/:slug 404s as JSON for unknown meetups', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/public/v1/meetups/no-such-meetup')

    response.assertStatus(404)
    assert.match(response.header('content-type') ?? '', /application\/json/)
  })

  test('GET /api/public/v1/meetups/next answers with a meetup or a JSON 404', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/api/public/v1/meetups/next')

    assert.oneOf(response.status(), [200, 404])
    assert.match(response.header('content-type') ?? '', /application\/json/)
  })
})

test.group('Authentication', () => {
  test('POST /login with the seeded admin starts a session and redirects home', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/login').redirects(0).withCsrfToken().form(SEEDED_ADMIN)

    response.assertStatus(302)
    response.assertHeader('location', '/')
    assert.property(response.cookies(), SESSION_COOKIE)
  })

  test('POST /login with a wrong password redirects back with an error', async ({ client }) => {
    const response = await client
      .post('/login')
      .redirects(0)
      .withCsrfToken()
      .header('referer', '/login')
      .form({ ...SEEDED_ADMIN, password: 'nope' })

    response.assertStatus(302)
    response.assertHeader('location', '/login')
  })

  test('GET /profile without a session redirects to login', async ({ client, assert }) => {
    const response = await client.get('/profile').redirects(0)

    response.assertStatus(302)
    assert.match(response.header('location') ?? '', /\/login/)
  })

  test('GET /profile and /admin are reachable for a logged-in admin', async ({ client }) => {
    const admin = await User.findByOrFail('email', SEEDED_ADMIN.email)

    const profile = await client.get('/profile').loginAs(admin)
    profile.assertStatus(200)

    const dashboard = await client.get('/admin').loginAs(admin)
    dashboard.assertStatus(200)
  })
})
