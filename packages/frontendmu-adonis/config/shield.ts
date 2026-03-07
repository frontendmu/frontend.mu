import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      defaultSrc: [`'self'`],
      scriptSrc: [`'self'`, `'nonce-@nonce'`],
      styleSrc: [`'self'`, `'unsafe-inline'`, 'https://fonts.googleapis.com'],
      imgSrc: [`'self'`, 'data:', 'blob:', 'https://avatars.githubusercontent.com', 'https://github.com', 'https://lh3.googleusercontent.com'],
      fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
      connectSrc: [`'self'`, 'https://fonts.googleapis.com', 'https://fonts.gstatic.com'],
      frameSrc: [`'none'`],
      objectSrc: [`'none'`],
      baseUri: [`'self'`],
      formAction: [`'self'`],
    },
    reportOnly: false,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: [],
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '180 days',
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
