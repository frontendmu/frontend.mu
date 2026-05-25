import app from '@adonisjs/core/services/app'
import { defineConfig, services } from '@adonisjs/drive'
import env from '#start/env'

const driveDisk = env.get('DRIVE_DISK')

// Fail fast at boot when DRIVE_DISK=r2 but the credentials are missing,
// instead of silently constructing a broken S3 client that fails on the first
// real call. The fs disk doesn't need any of these so dev keeps working.
if (driveDisk === 'r2') {
  const required = [
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_ENDPOINT',
    'CDN_BASE_URL',
  ] as const
  const missing = required.filter((k) => !env.get(k))
  if (missing.length > 0) {
    throw new Error(
      `DRIVE_DISK=r2 but the following env vars are missing: ${missing.join(', ')}. ` +
        `Set them in your environment or switch DRIVE_DISK=fs.`
    )
  }
}

const driveConfig = defineConfig({
  default: driveDisk,

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
