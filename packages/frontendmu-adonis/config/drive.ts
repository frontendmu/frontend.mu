import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'
import env from '#start/env'

const driveConfig = defineConfig({
  default: env.get('DRIVE_DISK'),

  services: {
    fs: services.fs({
      location: app.makePath('tmp/uploads'),
      serveFiles: true,
      routeBasePath: '/uploads',
      visibility: 'public',
    }),

    r2: services.s3({
      credentials: {
        accessKeyId: env.get('R2_ACCESS_KEY_ID', ''),
        secretAccessKey: env.get('R2_SECRET_ACCESS_KEY', ''),
      },
      region: 'auto',
      bucket: env.get('R2_BUCKET', ''),
      endpoint: env.get('R2_ENDPOINT', ''),
      supportsACL: false,
      cdnUrl: env.get('CDN_BASE_URL'),
      visibility: 'public',
    }),
  },
})

export default driveConfig

declare module '@adonisjs/drive/types' {
  export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
