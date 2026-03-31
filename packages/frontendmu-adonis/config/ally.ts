import env from '#start/env'
import type { InferSocialProviders } from '@adonisjs/ally/types'
import { defineConfig, services } from '@adonisjs/ally'

const googleClientId = env.get('GOOGLE_CLIENT_ID')
const googleClientSecret = env.get('GOOGLE_CLIENT_SECRET')

export const googleOauthEnabled = Boolean(googleClientId && googleClientSecret)

const allyConfig = defineConfig({
  google: services.google({
    clientId: googleClientId ?? 'google-oauth-disabled',
    clientSecret: googleClientSecret ?? 'google-oauth-disabled',
    callbackUrl: `${env.get('APP_URL', 'http://localhost:3333')}/auth/google/callback`,
  }),
})

export default allyConfig

declare module '@adonisjs/ally/types' {
  interface SocialProviders extends InferSocialProviders<typeof allyConfig> {}
}
