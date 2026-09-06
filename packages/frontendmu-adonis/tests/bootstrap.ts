import { copyFile, mkdir } from 'node:fs/promises'
import { relative, isAbsolute } from 'node:path'
import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'
import { sessionApiClient } from '@adonisjs/session/plugins/api_client'
import { shieldApiClient } from '@adonisjs/shield/plugins/api_client'
import testUtils from '@adonisjs/core/services/test_utils'
import env from '#start/env'

/**
 * This file is imported by the "bin/test.ts" entrypoint file
 */

/**
 * Configure Japa plugins in the plugins array.
 * Learn more - https://japa.dev/docs/runner-config#plugins-optional
 */
export const plugins: Config['plugins'] = [
  assert(),
  apiClient(),
  sessionApiClient(app),
  shieldApiClient(),
  authApiClient(app),
  pluginAdonisJS(app),
]

/**
 * Tests run against a throwaway copy of the committed seed database so
 * writes never touch database/db.local.sqlite3. Pending migrations are
 * applied to the copy, which also exercises the migration path itself.
 */
async function prepareTestDatabase() {
  const target = env.get('DB_DATABASE') ?? ''
  const targetPath = app.makePath(target)
  const insideTmp = relative(app.makePath('tmp'), targetPath)
  if (!target || !insideTmp || insideTmp.startsWith('..') || isAbsolute(insideTmp)) {
    throw new Error(
      `Refusing to run tests against DB_DATABASE="${target}". Set it to a path under tmp/ in .env.test.`
    )
  }

  await mkdir(app.makePath('tmp'), { recursive: true })
  await copyFile(app.makePath('database/db.local.sqlite3'), targetPath)
  await testUtils.db().migrate()
}

/**
 * Configure lifecycle function to run before and after all the
 * tests.
 *
 * The setup functions are executed before all the tests
 * The teardown functions are executed after all the tests
 */
export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
  setup: [prepareTestDatabase],
  teardown: [],
}

/**
 * Configure suites by tapping into the test suite instance.
 * Learn more - https://japa.dev/docs/test-suites#lifecycle-hooks
 */
export const configureSuite: Config['configureSuite'] = (suite) => {
  if (['browser', 'functional', 'e2e'].includes(suite.name)) {
    return suite.setup(() => testUtils.httpServer().start())
  }
}
