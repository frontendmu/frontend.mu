/**
 * Asserts that `node ace build` produced a browser bundle for the Inertia
 * entrypoint.
 *
 * Vite 8 builds every environment it knows about, and both the client and ssr
 * environments write to public/assets. When the ssr pass runs it overwrites
 * the browser bundle and the manifest with externalised output: bare "vue"
 * imports the browser cannot resolve, and no stylesheet. The page still
 * returns 200, so an HTTP check does not notice; the app simply never mounts.
 *
 * Run after a build. Exits non-zero with the reason when the output is wrong.
 */
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const assetsDir = join(packageRoot, 'build', 'public', 'assets')
const entryName = 'inertia/app.ts'

const failures = []

const manifest = JSON.parse(await readFile(join(assetsDir, '.vite', 'manifest.json'), 'utf8'))
const entry = manifest[entryName]

if (!entry) {
  failures.push(`manifest has no "${entryName}" entry`)
} else {
  const bundle = await readFile(join(assetsDir, entry.file), 'utf8')

  // A browser bundle inlines these; an ssr bundle externalises them and the
  // browser then fails on "Failed to resolve module specifier".
  const mustBeBundled = ['vue', '@inertiajs/vue3', '@inertiajs/core']
  const externalised = mustBeBundled.filter((name) =>
    new RegExp(`from\\s*["']${name.replace('/', '\\/')}["']`).test(bundle)
  )
  if (externalised.length > 0) {
    failures.push(
      `${entry.file} imports ${externalised.join(', ')} as bare specifiers — this looks like ssr output`
    )
  }

  if (bundle.includes('useSSRContext')) {
    failures.push(`${entry.file} imports useSSRContext — this is an ssr bundle, not a browser bundle`)
  }

  if (!entry.css?.length) {
    failures.push(`manifest entry "${entryName}" lists no css`)
  }
}

if (failures.length > 0) {
  console.error('Build output check failed:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}

console.log(`Build output OK: ${entry.file} + ${entry.css.length} stylesheet(s)`)
