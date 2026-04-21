import { defineConfig, devices } from '@playwright/test'

const appPort = 34123
const baseURL = process.env.A11Y_BASE_URL || `http://127.0.0.1:${appPort}`
const isLocalScan = new URL(baseURL).hostname === '127.0.0.1'
const reportSlug = new URL(baseURL).hostname.replace(/[^a-z0-9.-]+/gi, '-')
const serverEnv = [
  'APP_KEY=codex-a11y-test-app-key',
  'HOST=127.0.0.1',
  `PORT=${appPort}`,
  `APP_URL=http://127.0.0.1:${appPort}`,
  'DB_DATABASE=database/db.local.sqlite3',
  'SESSION_DRIVER=cookie',
  'NODE_ENV=development',
  'LOG_LEVEL=info',
  'DEBUGBAR_ENABLED=false',
  'GOOGLE_CLIENT_ID=dummy-client-id',
  'GOOGLE_CLIENT_SECRET=dummy-client-secret',
].join(' ')

export default defineConfig({
  testDir: './tests/a11y',
  fullyParallel: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: `playwright-report/a11y-${reportSlug}` }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  timeout: 60000,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(isLocalScan
    ? {
        webServer: {
          command: `${serverEnv} node ace serve --watch --no-clear`,
          url: baseURL,
          reuseExistingServer: false,
          timeout: 120000,
        },
      }
    : {}),
})
