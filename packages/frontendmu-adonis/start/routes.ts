import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Home page
router.get('/', [() => import('#controllers/home_controller'), 'index'])

// Meetups pages
router.get('/meetups', [() => import('#controllers/events_controller'), 'index'])
router.get('/meetup/:id', [() => import('#controllers/events_controller'), 'show'])

// Speakers pages
router.get('/speakers', [() => import('#controllers/speakers_controller'), 'index'])
router.get('/speaker/:id', [() => import('#controllers/speakers_controller'), 'show'])

// Sponsors pages
router.get('/sponsors', [() => import('#controllers/sponsors_controller'), 'index'])
router.get('/sponsor/:id', [() => import('#controllers/sponsors_controller'), 'show'])

// Team page
router.get('/team', [() => import('#controllers/team_controller'), 'index'])

// Static pages
router.get('/sponsor-us', [() => import('#controllers/pages_controller'), 'sponsorUs'])
router.get('/about', [() => import('#controllers/pages_controller'), 'about'])
router.get('/community', [() => import('#controllers/pages_controller'), 'community'])
router.get('/branding', [() => import('#controllers/pages_controller'), 'branding'])
router.get('/history', [() => import('#controllers/pages_controller'), 'history'])
router.get('/contribute', [() => import('#controllers/pages_controller'), 'contribute'])
router.get('/code-of-conduct', [() => import('#controllers/pages_controller'), 'codeOfConduct'])
router.get('/coding-guidelines', [
  () => import('#controllers/pages_controller'),
  'codingGuidelines',
])

// Auth routes
router.get('/login', [() => import('#controllers/auth/login_controller'), 'show'])
router.post('/login', [() => import('#controllers/auth/login_controller'), 'store'])
router.get('/register', [() => import('#controllers/auth/register_controller'), 'show'])
router.post('/register', [() => import('#controllers/auth/register_controller'), 'store'])
router.post('/logout', [() => import('#controllers/auth/logout_controller'), 'handle'])

// Google OAuth routes
router.get('/auth/google', [() => import('#controllers/auth/google_controller'), 'redirect'])
router.get('/auth/google/callback', [() => import('#controllers/auth/google_controller'), 'callback'])

// Profile route
router.get('/profile', [() => import('#controllers/profile_controller'), 'show'])
router.put('/profile', [() => import('#controllers/profile_controller'), 'update'])

// RSVP routes
// Get RSVP status (public - returns null if not authenticated)
router.get('/api/events/:eventId/rsvp/status', [
  () => import('#controllers/rsvps_controller'),
  'status',
])

// RSVP actions (requires authentication)
router
  .group(() => {
    router.post('/api/events/:eventId/rsvp', [
      () => import('#controllers/rsvps_controller'),
      'store',
    ])
    router.delete('/api/events/:eventId/rsvp', [
      () => import('#controllers/rsvps_controller'),
      'destroy',
    ])
  })
  .use(middleware.auth())

// Admin routes (requires authentication - authorization handled by policies)
router
  .group(() => {
    // Admin dashboard
    router
      .get('/admin', [() => import('#controllers/admin/dashboard_controller'), 'index'])
      .as('admin.dashboard')

    // Event management
    router
      .get('/admin/events', [() => import('#controllers/admin/events_controller'), 'index'])
      .as('admin.events.index')
    router
      .get('/admin/events/create', [() => import('#controllers/admin/events_controller'), 'create'])
      .as('admin.events.create')
    router
      .post('/admin/events', [() => import('#controllers/admin/events_controller'), 'store'])
      .as('admin.events.store')
    router
      .get('/admin/events/:id/edit', [() => import('#controllers/admin/events_controller'), 'edit'])
      .as('admin.events.edit')
    router
      .put('/admin/events/:id', [() => import('#controllers/admin/events_controller'), 'update'])
      .as('admin.events.update')
    router
      .delete('/admin/events/:id', [() => import('#controllers/admin/events_controller'), 'destroy'])
      .as('admin.events.destroy')

    // Session management (nested under events)
    router
      .get('/admin/events/:eventId/sessions', [
        () => import('#controllers/admin/sessions_controller'),
        'index',
      ])
      .as('admin.sessions.index')
    router
      .post('/admin/events/:eventId/sessions', [
        () => import('#controllers/admin/sessions_controller'),
        'store',
      ])
      .as('admin.sessions.store')
    router
      .get('/admin/sessions/:id', [() => import('#controllers/admin/sessions_controller'), 'show'])
      .as('admin.sessions.show')
    router
      .put('/admin/sessions/:id', [
        () => import('#controllers/admin/sessions_controller'),
        'update',
      ])
      .as('admin.sessions.update')
    router
      .delete('/admin/sessions/:id', [
        () => import('#controllers/admin/sessions_controller'),
        'destroy',
      ])
      .as('admin.sessions.destroy')

    // Speaker management for sessions
    router
      .post('/admin/sessions/:id/speakers/:speakerId', [
        () => import('#controllers/admin/sessions_controller'),
        'addSpeaker',
      ])
      .as('admin.sessions.addSpeaker')
    router
      .delete('/admin/sessions/:id/speakers/:speakerId', [
        () => import('#controllers/admin/sessions_controller'),
        'removeSpeaker',
      ])
      .as('admin.sessions.removeSpeaker')

    // Get available speakers for assignment
    router
      .get('/admin/speakers/available', [
        () => import('#controllers/admin/sessions_controller'),
        'availableSpeakers',
      ])
      .as('admin.speakers.available')

    // Speaker management
    router
      .get('/admin/speakers', [() => import('#controllers/admin/speakers_controller'), 'index'])
      .as('admin.speakers.index')
    router
      .get('/admin/speakers/create', [() => import('#controllers/admin/speakers_controller'), 'create'])
      .as('admin.speakers.create')
    router
      .post('/admin/speakers', [() => import('#controllers/admin/speakers_controller'), 'store'])
      .as('admin.speakers.store')
    router
      .get('/admin/speakers/:id/edit', [() => import('#controllers/admin/speakers_controller'), 'edit'])
      .as('admin.speakers.edit')
    router
      .put('/admin/speakers/:id', [() => import('#controllers/admin/speakers_controller'), 'update'])
      .as('admin.speakers.update')
    router
      .delete('/admin/speakers/:id', [() => import('#controllers/admin/speakers_controller'), 'destroy'])
      .as('admin.speakers.destroy')

    // Sponsor management
    router
      .get('/admin/sponsors', [() => import('#controllers/admin/sponsors_controller'), 'index'])
      .as('admin.sponsors.index')
    router
      .get('/admin/sponsors/create', [() => import('#controllers/admin/sponsors_controller'), 'create'])
      .as('admin.sponsors.create')
    router
      .post('/admin/sponsors', [() => import('#controllers/admin/sponsors_controller'), 'store'])
      .as('admin.sponsors.store')
    router
      .get('/admin/sponsors/:id/edit', [() => import('#controllers/admin/sponsors_controller'), 'edit'])
      .as('admin.sponsors.edit')
    router
      .put('/admin/sponsors/:id', [() => import('#controllers/admin/sponsors_controller'), 'update'])
      .as('admin.sponsors.update')
    router
      .delete('/admin/sponsors/:id', [() => import('#controllers/admin/sponsors_controller'), 'destroy'])
      .as('admin.sponsors.destroy')

    // User management
    router
      .get('/admin/users', [() => import('#controllers/admin/users_controller'), 'index'])
      .as('admin.users.index')
    router
      .get('/admin/users/:id/edit', [() => import('#controllers/admin/users_controller'), 'edit'])
      .as('admin.users.edit')
    router
      .put('/admin/users/:id', [() => import('#controllers/admin/users_controller'), 'update'])
      .as('admin.users.update')
    router
      .delete('/admin/users/:id', [() => import('#controllers/admin/users_controller'), 'destroy'])
      .as('admin.users.destroy')
  })
  .use(middleware.auth())
