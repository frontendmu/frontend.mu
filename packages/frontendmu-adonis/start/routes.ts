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
router.on('/').renderInertia('home')

// Meetups pages
router.on('/meetups').renderInertia('meetups/index', {
  meetups: [], // TODO: Fetch from controller/database
})

router.on('/meetup/:id').renderInertia('meetups/show', {
  meetup: null, // TODO: Fetch from controller/database
})

// Speakers pages
router.on('/speakers').renderInertia('speakers/index', {
  speakers: [], // TODO: Fetch from controller/database
})

router.on('/speaker/:id').renderInertia('speakers/show', {
  speaker: null, // TODO: Fetch from controller/database
})

// Static pages
router.on('/sponsors').renderInertia('sponsors')
router.on('/sponsor-us').renderInertia('sponsor-us')
router.on('/team').renderInertia('team')
router.on('/about').renderInertia('about')
router.on('/community').renderInertia('community')
router.on('/branding').renderInertia('branding')
