/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  APP_KEY: Env.schema.string(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),
  APP_URL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring session package
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.enum(['cookie'] as const),

  DB_DATABASE: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Feature flags
  |----------------------------------------------------------
  */
  FEATURE_RSVP_PAST_EVENTS: Env.schema.boolean.optional(),
  ENABLE_REGISTRATION: Env.schema.boolean.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring ally package
  |----------------------------------------------------------
  */
  GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Variables for configuring drive (R2 in prod, local fs in dev)
  |----------------------------------------------------------
  */
  DRIVE_DISK: Env.schema.enum(['fs', 'r2'] as const),
  R2_ACCOUNT_ID: Env.schema.string.optional(),
  R2_ACCESS_KEY_ID: Env.schema.string.optional(),
  R2_SECRET_ACCESS_KEY: Env.schema.string.optional(),
  R2_BUCKET: Env.schema.string.optional(),
  R2_ENDPOINT: Env.schema.string.optional({ format: 'url', tld: false, protocol: true }),
  CDN_BASE_URL: Env.schema.string.optional({ format: 'url', tld: false, protocol: true }),
})
