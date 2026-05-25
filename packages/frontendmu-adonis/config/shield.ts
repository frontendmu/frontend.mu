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
      scriptSrc: [`'self'`, `@nonce`],
      styleSrc: [`'self'`, `'unsafe-inline'`, 'https://fonts.googleapis.com'],
      imgSrc: [
        `'self'`,
        'data:',
        'blob:',
        'https://avatars.githubusercontent.com',
        'https://github.com',
        'https://lh3.googleusercontent.com',
        'https://cdn.jsdelivr.net',
        'https://images.weserv.nl',
        'https://cdn.coders.mu',
      ],
      fontSrc: [`'self'`, 'https://fonts.gstatic.com'],
      connectSrc: [
        `'self'`,
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        // Presigned PUTs go directly to the R2 endpoint; cdn.coders.mu only
        // serves <img> reads which use img-src, not connect-src.
        'https://*.r2.cloudflarestorage.com',
      ],
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
    // Local dev upload receiver is authenticated by a signed URL (HMAC over
    // key + exp), mirroring the trust model of an R2 presigned PUT. Skipping
    // CSRF here is correct — the auth lives in the URL, not the session.
    exceptRoutes: ['/admin/media/upload-local'],
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
