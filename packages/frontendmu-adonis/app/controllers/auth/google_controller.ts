import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class GoogleController {
  /**
   * Redirect the user to Google for authentication
   */
  async redirect({ ally }: HttpContext) {
    return ally.use('google').redirect()
  }

  /**
   * Handle the callback from Google
   */
  async callback({ ally, auth, response, session }: HttpContext) {
    const google = ally.use('google')

    /**
     * User has denied access by canceling the login flow
     */
    if (google.accessDenied()) {
      session.flash('error', 'You cancelled the Google login')
      return response.redirect('/login')
    }

    /**
     * OAuth state verification failed. This happens when the
     * CSRF cookie gets expired.
     */
    if (google.stateMisMatch()) {
      session.flash('error', 'Request expired. Please try again.')
      return response.redirect('/login')
    }

    /**
     * Google responded with an error
     */
    if (google.hasError()) {
      session.flash('error', google.getError() || 'Unable to authenticate with Google')
      return response.redirect('/login')
    }

    /**
     * Get user info from Google
     */
    const googleUser = await google.user()

    /**
     * Find or create user based on Google ID or email
     */
    let user = await User.query().where('google_id', googleUser.id).first()

    if (!user) {
      // Try to find by email (for existing users migrated from Directus)
      user = await User.query().where('email', googleUser.email!).first()

      if (user) {
        // Link the Google account to the existing user
        user.googleId = googleUser.id
        if (!user.avatarUrl && googleUser.avatarUrl) {
          user.avatarUrl = googleUser.avatarUrl
        }
        await user.save()
      }
    }

    if (!user) {
      // Create a new user
      user = await User.create({
        email: googleUser.email!,
        name: googleUser.name || googleUser.email!.split('@')[0],
        googleId: googleUser.id,
        avatarUrl: googleUser.avatarUrl,
        role: 'member', // New users get 'member' role
      })
    }

    /**
     * Login the user
     */
    await auth.use('web').login(user)

    session.flash('success', `Welcome back, ${user.name}!`)
    return response.redirect('/')
  }
}
