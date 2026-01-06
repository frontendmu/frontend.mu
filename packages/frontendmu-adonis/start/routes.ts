/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

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
