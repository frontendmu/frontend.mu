# Build context is the monorepo root so the pnpm lockfile is available:
#   docker build -f packages/frontendmu-adonis/Dockerfile .
FROM node:24-slim AS base
RUN npm install -g pnpm@9.2.0

# --- Build stage ---
FROM base AS build
WORKDIR /repo

# Only the root manifests and this package's manifest are needed: a filtered
# install reads the sibling workspace entries from the lockfile itself. Copying
# them first keeps the dependency layer cached independently of app source.
# No compiler toolchain: better-sqlite3 publishes prebuilds for this Node ABI,
# so an install that cannot find one should fail loudly rather than compile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/frontendmu-adonis/package.json packages/frontendmu-adonis/
RUN pnpm install --frozen-lockfile --filter frontendmu-adonis

COPY packages/frontendmu-adonis packages/frontendmu-adonis
WORKDIR /repo/packages/frontendmu-adonis
# `node ace build` type-checks against the generated .adonisjs/ types but does
# not write them; codegen boots the app in warmup mode with .env.test values.
RUN NODE_ENV=test node ace codegen
RUN node ace build

# Self-contained production node_modules for the runtime stage. pnpm 9's
# `deploy` re-runs resolution and forces frozen-lockfile=false internally, so
# this tree treats the lockfile as a hint rather than a pin. The application
# above is compiled against the frozen install. pnpm 10 generates a dedicated
# lockfile for `deploy` and would close the gap.
RUN pnpm --filter frontendmu-adonis deploy --prod /prod

# --- Production stage ---
FROM base
WORKDIR /app

COPY --from=build /repo/packages/frontendmu-adonis/build ./
COPY --from=build /prod/node_modules ./node_modules

RUN mkdir -p tmp

EXPOSE 3333
CMD ["node", "bin/server.js"]
