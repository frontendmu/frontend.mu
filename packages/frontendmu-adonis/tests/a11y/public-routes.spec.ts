import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { test, expect, type Page } from '@playwright/test'
import AxeBuilderImport from '@axe-core/playwright'
import type { AxeResults } from 'axe-core'

type AxeBuilderLike = new (params: { page: Page; axeSource?: string }) => {
  analyze(): Promise<AxeResults>
}

const AxeBuilder = AxeBuilderImport as unknown as AxeBuilderLike
type AxeViolation = AxeResults['violations'][number]
type AxeNode = AxeViolation['nodes'][number]

type RouteScan = {
  route: string
  title: string
  violations: {
    id: string
    impact: string | null
    description: string
    help: string
    helpUrl: string
    nodes: {
      target: unknown[]
      html: string
      failureSummary: string | undefined
    }[]
  }[]
}

async function waitForInertiaApp(page: Page) {
  await page.locator('#app > *').first().waitFor({ state: 'attached' })
}

function getReportSlug(baseURL: string) {
  const { hostname } = new URL(baseURL)
  return hostname.replace(/[^a-z0-9.-]+/gi, '-')
}

const staticRoutes = [
  '/',
  '/meetups',
  '/speakers',
  '/sponsors',
  '/team',
  '/about',
  '/community',
  '/branding',
  '/history',
  '/contribute',
  '/code-of-conduct',
  '/coding-guidelines',
  '/api-docs',
  '/login',
  '/register',
]

const enforcedRoutes = [
  '/team',
]

async function discoverRoute(
  page: Page,
  seedRoute: string,
  selector: string
) {
  await page.goto(seedRoute, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('load')
  await waitForInertiaApp(page)
  const links = page.locator(selector)
  if ((await links.count()) === 0) {
    return null
  }

  const href = await links.first().getAttribute('href')
  if (!href || !href.startsWith('/')) {
    return null
  }

  return href
}

test('public routes do not have detectable axe violations', async ({ page }, testInfo) => {
  const routes = [...staticRoutes]
  const discoveredRoutes = [
    await discoverRoute(page, '/meetups', 'a[href^="/meetup/"]'),
    await discoverRoute(page, '/speakers', 'a[href^="/speaker/"]'),
    await discoverRoute(page, '/sponsors', 'a[href^="/sponsor/"]'),
  ]

  for (const route of discoveredRoutes) {
    if (route && !routes.includes(route)) {
      routes.push(route)
    }
  }

  const report: RouteScan[] = []

  for (const route of routes) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('load')
    await waitForInertiaApp(page)

    const results: AxeResults = await new AxeBuilder({ page }).analyze()
    report.push({
      route,
      title: await page.title(),
      violations: results.violations.map((violation: AxeViolation) => ({
        id: violation.id,
        impact: violation.impact ?? null,
        description: violation.description,
        help: violation.help,
        helpUrl: violation.helpUrl,
        nodes: violation.nodes.map((node: AxeNode) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      })),
    })
  }

  const outputDir = path.join(testInfo.config.rootDir, 'test-results')
  const reportSlug = getReportSlug(String(testInfo.project.use.baseURL))
  await mkdir(outputDir, { recursive: true })
  await writeFile(
    path.join(outputDir, `a11y-report.${reportSlug}.json`),
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        baseURL: testInfo.project.use.baseURL,
        routes: report,
      },
      null,
      2
    )}\n`
  )

  const violations = report.flatMap((entry) =>
    enforcedRoutes.includes(entry.route)
      ? entry.violations.map(
          (violation) => `${entry.route}: ${violation.id} (${violation.impact ?? 'unknown'})`
        )
      : []
  )

  expect(
    violations,
    violations.length
      ? `Axe violations found on enforced routes:\n${violations.join('\n')}`
      : 'No axe violations were detected on the enforced routes.'
  ).toEqual([])
})
