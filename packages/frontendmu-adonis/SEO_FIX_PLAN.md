# SEO Fix Plan — coders.mu

Plan derived from the Google Search Console "Page indexing" report for `sc-domain:coders.mu` (snapshot taken 2026-05-26, GSC last update 2026-05-22).

GSC currently reports **421 not-indexed pages** and **161 indexed pages**, split across the seven reasons below.

| # | Reason (GSC) | Pages | Source | Severity |
|---|---|---|---|---|
| 1 | Server error (5xx) | 91 | Website | Misclassified — actually 404 today (high) |
| 2 | Not found (404) | 38 | Website | High |
| 3 | Duplicate without user-selected canonical | 33 | Website | High |
| 4 | Page with redirect | 12 | Website | Medium |
| 5 | Excluded by `noindex` tag | 1 | Website | Low |
| 6 | Blocked by robots.txt | 1 | Website | Low (dead host) |
| 7 | Crawled — currently not indexed | 245 | Google | High (root cause = thin HTML / no SSR) |

The fixes are grouped by root cause, not by GSC bucket, because most buckets share the same underlying problems. The whole plan is intended to land in one PR on a single branch.

---

## Root-cause summary (read this first)

After probing the live site (see `curl` evidence under each section):

1. **No `sitemap.xml`.** `https://coders.mu/sitemap.xml` returns `Cannot GET:/sitemap.xml`. Google has nothing authoritative to crawl, so it falls back to legacy URLs it saw from the old Directus/Nuxt site.
2. **`robots.txt` is bare.** Just `User-agent: * / Allow: /`. No `Sitemap:` line, no disallow for auth/admin paths.
3. **Inertia SSR is disabled** (`config/inertia.ts` → `ssr: { enabled: false }`). The initial HTML response contains only `<title>frontend.mu</title>` and no `<meta name="description">`, no `<link rel="canonical">`, no Open Graph tags. Even when `.vue` pages set `<Head title="...">`, that only patches the head client-side after the JS bundle boots. This explains "Crawled — currently not indexed" (Google sees identical shell HTML for every URL).
4. **Trailing-slash variants serve identical HTML.** `https://coders.mu/team` and `https://coders.mu/team/` both 200 with the same body. With no canonical tag, Google has no way to pick one and files them under "Duplicate without user-selected canonical".
5. **`frontend.coders.mu` subdomain is alive at Cloudflare** and 301-redirects every path to `https://coders.mu/<same-path>`. For most of the legacy paths (numeric meetup IDs, legacy speaker UUIDs, `/code_of_conduct`, `/coding_guidelines`) the apex 404s, so Google sees `301 → 404`. This is the source of the 91 "Server error (5xx)" and 38 "Not found (404)" entries that overlap with `frontend.coders.mu/*` paths.
6. **Legacy URL slugs don't match new routes.** The new routes are `/code-of-conduct` and `/coding-guidelines` (kebab); Google indexed `/code_of_conduct` and `/coding_guidelines` (snake). And `/meetup/<numeric-id>` (e.g., `/meetup/17`) is no longer a valid route — new format is `/meetup/<yyyy-month-slug>` or `/meetup/<uuid>`.
7. **`/privacy` and `/terms` 404.** GSC has them in the 404 bucket — they're missing entirely.
8. **Sensitive routes are crawlable.** `/admin/*`, `/user/me`, `/profile`, `/auth/google`, `/auth/google/callback`, `/login`, `/register`, `/redirect` are all reachable and not flagged `noindex`. They show up in GSC under various buckets.

Most "Server error (5xx)" entries are **GSC reporting historical state** — every URL I re-fetched in the 5xx list now returns 404 (e.g., `coders.mu/meetup/17`, `coders.mu/user/me`, `coders.mu/admin/verify`, `coders.mu/redirect`). So once we fix the 404 picture, the 5xx number will reconcile via validation.

---

## Fix 1 — Add an XML sitemap

**Bucket(s) targeted:** Crawled — currently not indexed (245), and indirectly all others.

**Why this matters:** Without a sitemap, Google relies on whatever it saw in the past — which is largely the dead frontend.coders.mu URLs from the previous Nuxt site.

**Implementation:**
- Add `GET /sitemap.xml` to `start/routes.ts` and a `SitemapController` under `app/controllers/sitemap_controller.ts`.
- Include in the sitemap:
  - Static pages: `/`, `/meetups`, `/sponsors`, `/sponsor-us`, `/team`, `/about`, `/community`, `/contribute`, `/branding`, `/history`, `/code-of-conduct`, `/coding-guidelines`, `/api-docs`, `/speakers` (new — see Fix 3), `/privacy` (new — see Fix 8), `/terms` (new — see Fix 8).
  - All `Event` rows with `status = 'published'` → `/meetup/<slug>` (use `slug`, never the numeric/UUID alternates — keep one canonical path per meetup).
  - All speakers that have at least one published session → `/speaker/<uuid>`.
- `lastmod` from `updatedAt`, no `priority`/`changefreq` (Google ignores them).
- Always emit the canonical form: trailing-slash-free, lowercase, `https://coders.mu`.
- Add `Sitemap: https://coders.mu/sitemap.xml` to `public/robots.txt`.

**Verification:**
```bash
# Sitemap returns 200 and is valid XML
curl -sI https://coders.mu/sitemap.xml | head -1   # → HTTP/2 200
curl -s https://coders.mu/sitemap.xml | xmllint --noout -
# Count URLs in the sitemap
curl -s https://coders.mu/sitemap.xml | grep -c "<loc>"
# robots.txt advertises the sitemap
curl -s https://coders.mu/robots.txt | grep -i sitemap
# Every URL in the sitemap returns 200 (no redirects, no 404s)
for url in $(curl -s https://coders.mu/sitemap.xml | grep -oP '(?<=<loc>)[^<]+'); do
  code=$(curl -s -o /dev/null -w '%{http_code}' -L --max-redirs 0 "$url")
  [ "$code" != "200" ] && echo "BROKEN: $code $url"
done
# Expected output: empty (or a clear short list to investigate)
```

After deploy: in GSC → Sitemaps, submit `https://coders.mu/sitemap.xml`. Google should report "Success" within 24h. High-confidence local verification doesn't need GSC.

---

## Fix 2 — Enable Inertia SSR (or pre-render head metadata server-side)

**Bucket(s) targeted:** Crawled — currently not indexed (245), Duplicate without user-selected canonical (33).

**Why this matters:** The HTML response Google currently sees is the same shell for every URL: hardcoded `<title>frontend.mu</title>`, no meta description, no canonical, no OG tags, no `<h1>` in the body. JS-rendered crawling is a second-tier path; pages get queued for "render later" and often never finish.

**Implementation (preferred — full SSR):**
1. Install Inertia SSR: `pnpm --filter frontendmu-adonis add @inertiajs/vue3` is already there. Add `@vue/server-renderer` if missing.
2. Create `inertia/ssr.ts` that mirrors `inertia/app.ts` but uses `createSSRApp` and `renderToString` from `@vue/server-renderer`. Use the `@inertiajs/vue3` SSR docs verbatim.
3. Flip `config/inertia.ts` → `ssr: { enabled: true, entrypoint: 'inertia/ssr.ts' }`.
4. Update build pipeline (`vite.config.ts`) to emit an SSR bundle alongside the client bundle. Adonis Inertia docs: `node ace inertia:build:ssr` plus `vite build --ssr`.
5. Update `Dockerfile` to run the SSR build and ensure the SSR bundle is in the production image.
6. In **every** page component, wrap the existing `<Head>` calls to also emit:
   - `<title>` (already done in most pages, missing in `speakers/show.vue`)
   - `<meta name="description" content="...">` per page (currently only `home.vue` does this)
   - `<link rel="canonical" :href="canonicalUrl">` — see Fix 4
   - OG basics: `og:title`, `og:description`, `og:type`, `og:image`, `og:url`

**Implementation (fallback if SSR is too risky for one PR — partial fix):**
- Move the title/description/canonical/OG tags out of Vue `<Head>` and into the Edge layout `resources/views/inertia_layout.edge`, populated by a shared inertia prop (`metaTags`) that every controller sets. Example: each controller calls a `setMeta(ctx, { title, description, path })` helper before `inertia.render(...)`. Edge then prints `<title>{{ meta.title }}</title>` etc.
- This is uglier but doesn't require an SSR build pipeline.

Recommendation: do the proper SSR option. It also unblocks shareable previews on Slack/Twitter/LinkedIn.

**Verification:**
```bash
# Per-page <title> in initial HTML (no JS executed)
for path in / /meetups /meetup/2024-august /speakers /team /sponsors /about; do
  title=$(curl -s "https://coders.mu$path" | grep -oP '(?<=<title>)[^<]+')
  printf '%-40s %s\n' "$path" "$title"
done
# Expected: each path has a distinct, descriptive title (NOT just "frontend.mu")

# Meta description present and distinct per page
for path in / /meetups /meetup/2024-august /team; do
  desc=$(curl -s "https://coders.mu$path" | grep -oP 'name="description"\s+content="[^"]+' | head -1)
  printf '%-30s %s\n' "$path" "$desc"
done

# Body actually contains the meetup/speaker content rendered server-side
curl -s https://coders.mu/meetup/2024-august | grep -c '<h1'   # → ≥ 1

# OG tags
curl -s https://coders.mu/meetup/2024-august | grep -oE 'property="og:[a-z]+"' | sort -u
# Expected: og:title, og:description, og:image, og:type, og:url
```

For the manual check, use Google's Rich Results Test (`https://search.google.com/test/rich-results?url=...`) on a meetup page; it must see a populated title/description without JS execution.

---

## Fix 3 — Per-page canonical URLs and trailing-slash normalisation

**Bucket(s) targeted:** Duplicate without user-selected canonical (33).

**Why this matters:** Today `/team` and `/team/` are both 200 with identical content. Same for every static page. Google flips a coin.

**Implementation:**
1. Decide the canonical shape: **no trailing slash** (matches the existing route definitions in `start/routes.ts`).
2. Add a middleware at `app/middleware/canonical_url_middleware.ts` that runs on `GET` requests and:
   - If the path ends with `/` and is not `/`, issue a `301` to the same path without the slash.
   - If the URL has any query string param matching `^(ref|trk|utm_.*|fbclid|gclid)$`, strip those and `301` to the cleaned URL. (GSC has `?ref=sysadmin-journal.com`, `?trk=public_post_main-feed-card-text` instances.)
3. Wire the middleware into the global router stack (after `forceJsonResponse` skip).
4. Emit `<link rel="canonical" href="https://coders.mu<canonical-path>">` from the layout (or SSR head) — driven by the same canonical computation as the middleware.

**Verification:**
```bash
# Trailing slash 301s to no-slash
for p in /team/ /about/ /sponsors/ /meetup/2024-august/; do
  curl -s -o /dev/null -w "$p -> %{http_code} %{redirect_url}\n" "https://coders.mu$p"
done
# Expected: 301 https://coders.mu<no-slash>

# Tracking params stripped
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" "https://coders.mu/meetup/2024-august?ref=foo&utm_source=x"
# Expected: 301 https://coders.mu/meetup/2024-august

# Canonical tag points at the canonical URL
curl -s https://coders.mu/team/ -L | grep -oE '<link rel="canonical"[^>]+>'
curl -s "https://coders.mu/team?ref=x" -L | grep -oE '<link rel="canonical"[^>]+>'
# Expected: both → href="https://coders.mu/team"
```

**Gotcha:** Don't 301 on inertia XHR (`X-Inertia: true`) — bypass the middleware in that case so SPA navigation doesn't break.

---

## Fix 4 — Restore legacy slugs (snake_case static pages) with 301s

**Bucket(s) targeted:** Not found (404) — partial. Plus "Crawled — currently not indexed" pages on `frontend.coders.mu/code_of_conduct/`, `/coding_guidelines/`.

**Why this matters:** Google indexed `https://coders.mu/code_of_conduct` and `https://coders.mu/coding_guidelines`. Today both 404. They should 301 to the new kebab versions.

**Implementation:**
- Add explicit redirect routes at the top of `start/routes.ts`:
  ```ts
  router.get('/code_of_conduct', ({ response }) => response.redirect('/code-of-conduct', false, 301))
  router.get('/coding_guidelines', ({ response }) => response.redirect('/coding-guidelines', false, 301))
  ```
- While we're there, also handle the few oddities: `/contribute/`, `/sponsors/`, `/team/` etc. are already handled by the trailing-slash middleware from Fix 3.

**Verification:**
```bash
for u in /code_of_conduct /coding_guidelines /code_of_conduct/ /coding_guidelines/; do
  curl -s -o /dev/null -w "$u -> %{http_code} %{redirect_url}\n" "https://coders.mu$u"
done
# Expected: each 301 → the kebab equivalent
```

---

## Fix 5 — Legacy numeric meetup IDs → new slug-based URLs (or clean 410)

**Bucket(s) targeted:** Server error (5xx) — most of the 91 (now actually 404). Not found (404). "Crawled — currently not indexed" `frontend.coders.mu/meetup/<id>` entries.

**Why this matters:** Google has indexed `/meetup/17` through `/meetup/70` (and frontend.coders.mu variants) from the old Directus-backed site. The new app uses date-slugs (`2024-august`) or UUIDs.

**Implementation:**
1. **Investigate** whether the `events` table still carries a `legacyId` / `directus_id` integer column. The migration history (commits `019bd47`, `f7eb5be`, etc.) suggests imports — confirm with:
   ```bash
   pnpm --filter frontendmu-adonis exec node ace make:script check-legacy-id   # or grep schema
   grep -rn "legacy_id\|directusId\|legacyId" packages/frontendmu-adonis/app/models packages/frontendmu-adonis/database/migrations
   ```
2. **If a legacy-id column exists**, add a route:
   ```ts
   router.get('/meetup/:legacyId', async ({ params, response }) => {
     const id = Number(params.legacyId)
     if (!Number.isInteger(id) || id <= 0) return response.notFound()
     const event = await Event.query().where('legacyId', id).first()
     if (!event?.slug) return response.notFound()  // or .status(410)
     return response.redirect(`/meetup/${event.slug}`, false, 301)
   }).where('legacyId', /^\d+$/)
   ```
   Place this **before** the existing `/meetup/:idOrSlug` route to avoid shadow conflicts.
3. **If the legacy IDs were never preserved**, build a static mapping file (`app/data/legacy_meetup_ids.ts`) by mapping the 60-odd IDs to slugs (some can be reconstructed from event dates the team remembers). For any ID we can't map, **respond `410 Gone`** so Google removes them from the index promptly (faster than 404).

**Verification:**
```bash
# Sample mapped IDs (replace with whichever you confirm map to real meetups)
for n in 17 24 30 45 60 68; do
  curl -s -o /dev/null -w "/meetup/$n -> %{http_code} %{redirect_url}\n" "https://coders.mu/meetup/$n"
done
# Expected: 301 → /meetup/<slug>  (or 410 if unmapped)

# Cross-check the redirect target resolves 200
curl -sL -o /dev/null -w "%{http_code}\n" "https://coders.mu/meetup/17"
# Expected: 200
```

---

## Fix 6 — Speaker UUID 404s

**Bucket(s) targeted:** Not found (404) — speaker entries. "Crawled — currently not indexed" — frontend.coders.mu speaker variants.

**Why this matters:** GSC has ~25 `coders.mu/speaker/<uuid>` URLs that 404. `app/controllers/speakers_controller.ts` does `firstOrFail()`, so they 404 cleanly — but Google still has them indexed/queued.

**Implementation:**
1. Run a one-off check: `select id, full_name from users where id in (<uuids from GSC list>)` to figure out which legacy speaker UUIDs are present in the new DB. Some likely just don't exist (test users in old system) and some may have been re-created with new IDs.
2. For UUIDs that **don't exist** in the new DB: return `410 Gone` instead of `404`. Update the catch in `speakers_controller.show()` to map the `E_ROW_NOT_FOUND` to a 410 response (or add a precheck).
3. For UUIDs that **do** exist but the page itself looks thin (no sessions): keep 200 but emit `<meta name="robots" content="noindex">` on speakers with zero sessions, so they stop diluting the crawl budget.
4. Ensure there's no internal link from any current page to legacy 404 speaker URLs (`grep -rn 'speaker/' inertia/`).

**Verification:**
```bash
# UUIDs we believe are gone
for uuid in 3166bf91-55ac-4702-a868-845b97bd9c29 60c638fd-2676-4a3b-a697-0c002752349e; do
  curl -s -o /dev/null -w "%{http_code} $uuid\n" "https://coders.mu/speaker/$uuid"
done
# Expected: 410 (gone) for all

# UUID that exists, low quality: noindex robots tag
curl -s "https://coders.mu/speaker/<known-zero-sessions-uuid>" | grep -i 'name="robots"'
# Expected: <meta name="robots" content="noindex">
```

---

## Fix 7 — Stop `frontend.coders.mu` from preserving paths

**Bucket(s) targeted:** Page with redirect (12), and the ~60 `frontend.coders.mu/*` entries in "Crawled — currently not indexed".

**Why this matters:** Cloudflare currently rewrites `https://frontend.coders.mu/<anything>` to `https://coders.mu/<anything>` with a 301. For most paths the apex 404s, so Google sees `301 → 404` and keeps trying. We don't want to keep nudging it.

**Implementation:**
1. In Cloudflare → coders.mu zone → Rules → Redirect Rules: change the `frontend.coders.mu` rule from "preserve URI" to **"static destination `https://coders.mu/` 301"** (drop the path). This collapses the subdomain into a single redirect to the homepage.
2. After the apex 404→410 work in Fix 5 and Fix 6, Google will drop the legacy paths within a few weeks.
3. Optional: serve a tiny `robots.txt` from the subdomain that disallows everything. (Not strictly required since the redirect itself prevents crawling beyond `/`.)

**Verification:**
```bash
for p in /  /team /meetup/49/ /speaker/2af3f3bb-0de2-45a2-bd31-a452c85db2da/ /code_of_conduct; do
  curl -s -o /dev/null -w "$p -> %{http_code} %{redirect_url}\n" "https://frontend.coders.mu$p"
done
# Expected: every path -> 301 https://coders.mu/   (NOT preserving the path)
```

This step is the only one that doesn't go through the PR — it's a Cloudflare dashboard change. Call it out in the PR description so it gets done at deploy time.

---

## Fix 8 — Build the missing `/privacy` and `/terms` pages

**Bucket(s) targeted:** Not found (404).

**Why this matters:** Both URLs are in the 404 bucket, and they're table-stakes for a community site. Footer probably links to them.

**Implementation:**
- Add `/privacy` and `/terms` routes to `start/routes.ts` (mirror the existing `pages_controller.ts` pattern).
- Add `inertia/pages/privacy.vue` and `inertia/pages/terms.vue` with placeholder copy (community policy + minimal terms boilerplate).
- Add `<Head title="Privacy">` / `<Head title="Terms">` + meta description.
- Include in sitemap (Fix 1).
- If footer links currently point to `/privacy-policy` or some other slug, update them or add an alias route.

**Verification:**
```bash
curl -sI https://coders.mu/privacy | head -1   # → HTTP/2 200
curl -sI https://coders.mu/terms   | head -1   # → HTTP/2 200
curl -s  https://coders.mu/privacy | grep -oE '<title>[^<]+</title>'
# Expected: <title>Privacy — coders.mu</title> (or similar, distinct from /terms)
```

---

## Fix 9 — `noindex` and `robots.txt` for non-public pages

**Bucket(s) targeted:** Excluded by `noindex` tag (1), Blocked by robots.txt (1), and prevention for the future.

**Why this matters:** The single existing `noindex` page is `/auth/google` and the single `robots.txt`-blocked URL is on the dead `directus.coders.mu` subdomain — both are fine as-is. The issue is what's **missing**: `/admin/*`, `/profile`, `/user/me`, `/login`, `/register`, `/redirect`, `/auth/google/callback` are all reachable and not flagged.

**Implementation:**
1. Update `public/robots.txt`:
   ```
   User-agent: *
   Disallow: /admin/
   Disallow: /profile
   Disallow: /login
   Disallow: /register
   Disallow: /redirect
   Disallow: /auth/
   Disallow: /api/
   Disallow: /user/

   Sitemap: https://coders.mu/sitemap.xml
   ```
2. Emit `<meta name="robots" content="noindex,follow">` from the layout for any route that matches `/admin`, `/profile`, `/login`, `/register`, `/auth/*`. Easiest: a `noindexPaths` array consulted by the layout/SSR head builder.
3. Make `/redirect` and `/user/me` either 410 or noindex — they exist in the GSC backlog and we don't want them in the future either.

**Verification:**
```bash
curl -s https://coders.mu/robots.txt
# Confirm all Disallow lines and the Sitemap: line are present

# Sensitive routes carry noindex
for u in /admin /profile /login /register /auth/google /redirect /user/me; do
  echo "== $u =="
  curl -s "https://coders.mu$u" | grep -i 'name="robots"' || echo '(no robots meta found)'
done
# Expected: noindex on each (or a 404/410 if the route was deleted)
```

---

## Fix 10 — Replace the JSON 404 with the Inertia 404 page

**Bucket(s) targeted:** indirectly all (the 404 page is what crawlers see for every dead URL).

**Why this matters:** Today `curl -H 'Accept: text/html' https://coders.mu/whatever` returns `Cannot GET:/whatever` with `Content-Type: application/json`. That's the AdonisJS router default. It's not an SEO crisis (Google understands status code, not body) but it's an embarrassing 404 and we're rendering an Inertia `errors/not_found` page everywhere else.

**Implementation:**
- In `app/exceptions/handler.ts`, ensure the `404` status page also catches the "no route matched" case. AdonisJS has `Route.any('*', ...)` as the official approach. Add a wildcard fallback to `start/routes.ts` (last route in the file):
  ```ts
  router.any('*', ({ inertia, response }) => {
    response.status(404)
    return inertia.render('errors/not_found', {})
  })
  ```

**Verification:**
```bash
code_ct=$(curl -s -o /dev/null -w '%{http_code} %{content_type}' -H 'Accept: text/html' https://coders.mu/this-does-not-exist)
echo "$code_ct"
# Expected: 404 text/html; charset=utf-8

curl -s -H 'Accept: text/html' https://coders.mu/this-does-not-exist | grep -oE '<title>[^<]+</title>'
# Expected: distinct 404 title (NOT "frontend.mu" default)
```

---

## Cross-cutting verification: per-URL sweep against the GSC export

For each fix above we have local `curl` checks. The final pre-merge sweep re-runs every URL from the GSC report through `curl` and asserts the expected new status:

```bash
# scripts/verify-seo.sh
set -e

declare -A EXPECT
# from GSC "Not found" — should now 301 to apex equivalent (or 200 / 410 where appropriate)
EXPECT[https://coders.mu/code_of_conduct]=301
EXPECT[https://coders.mu/coding_guidelines]=301
EXPECT[https://coders.mu/privacy]=200
EXPECT[https://coders.mu/terms]=200
# from "Page with redirect" — should now 301 to homepage cleanly
EXPECT[https://frontend.coders.mu/team]=301
# from "Server error" / "Not found" — legacy meetup numeric ids: 301 if mapped, 410 otherwise
EXPECT[https://coders.mu/meetup/17]=301   # adjust if 410
# from "Duplicate" — should now canonicalise
EXPECT[https://coders.mu/team/]=301
# from "Excluded by noindex" — should stay 200 with noindex (don't regress)
EXPECT[https://coders.mu/auth/google]=302
# from "Blocked by robots.txt" — dead directus host, leave as 000/dead
# (skip — not under our control)

fail=0
for url in "${!EXPECT[@]}"; do
  want=${EXPECT[$url]}
  got=$(curl -s -o /dev/null -w '%{http_code}' --max-redirs 0 "$url")
  if [ "$got" != "$want" ]; then
    echo "FAIL $url  expected=$want got=$got"; fail=1
  else
    echo "ok   $url  $got"
  fi
done
exit $fail
```

Drop a fuller version (~100 lines) in `scripts/verify-seo.sh` covering one URL per GSC bucket plus a representative sample from the 245-strong "Crawled" bucket. Make it CI-runnable post-deploy.

---

## What we still can't prove without GSC

After this PR ships:
- "Crawled — currently not indexed" recovery requires Google to re-crawl. Expect 2–6 weeks. The signal we *can* observe locally is that the HTML now contains real titles/descriptions and the sitemap is being fetched.
- Use GSC's "Request indexing" on 10–20 high-value pages (homepage, /meetups, top 5 recent meetups, /sponsors, /team) to accelerate.
- After 2 weeks, re-pull the GSC indexing report and diff against the snapshot in this PR description. Expected movement:
  - 5xx (91) → near zero (most resolve to 410/301).
  - 404 (38) → near zero (legacy slugs redirected, /privacy /terms shipped, speakers 410'd).
  - Duplicate canonical (33) → drop sharply once canonical tags + slash-normaliser are live.
  - Page with redirect (12) → drop once Cloudflare rule changes.
  - Crawled — not indexed (245) → drop gradually as SSR-rendered HTML re-passes the content-quality bar.

---

## Suggested PR structure (one branch, logically grouped commits)

1. `feat(adonis): add sitemap.xml route and link from robots.txt` — Fix 1, Fix 9.
2. `feat(adonis): enable Inertia SSR and per-page meta tags` — Fix 2.
3. `feat(adonis): canonical url middleware and tracking-param stripper` — Fix 3.
4. `feat(adonis): legacy slug redirects (code_of_conduct, coding_guidelines)` — Fix 4.
5. `feat(adonis): redirect legacy numeric meetup ids to slug urls` — Fix 5.
6. `chore(adonis): 410 dead speaker uuids and noindex empty profiles` — Fix 6.
7. `feat(adonis): add /privacy and /terms pages` — Fix 8.
8. `fix(adonis): inertia 404 page for unmatched routes` — Fix 10.
9. `chore: scripts/verify-seo.sh for post-deploy sweep` — Cross-cutting verification.

(Fix 7 is a Cloudflare dashboard change, not in the PR — mention in PR description and do at deploy time.)
