import { defineConfig } from '@adonisjs/cors'
import env from '#start/env'

const appUrl = env.get('APP_URL', 'http://localhost:3333')

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: (requestOrigin, ctx) => {
    // Public API is open to all origins (read-only, no credentials needed)
    if (ctx.request.url().startsWith('/api/public/')) {
      return true
    }
    return requestOrigin === appUrl
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
