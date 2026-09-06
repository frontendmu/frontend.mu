# Build context is the monorepo root so the pnpm lockfile is available:
#   docker build -f packages/frontendmu-adonis/Dockerfile .
FROM node:24-slim AS base
RUN npm install -g pnpm@9.2.0

# --- Build stage ---
FROM base AS build
WORKDIR /repo

# better-sqlite3 compiles from source when no prebuilt binary matches.
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Workspace manifests first so the dependency layer is cached independently
# of application source changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/frontendmu-adonis/package.json packages/frontendmu-adonis/
COPY packages/frontendmu-astro/package.json packages/frontendmu-astro/
COPY packages/frontendmu-nuxt/package.json packages/frontendmu-nuxt/
COPY packages/frontendmu-data/package.json packages/frontendmu-data/
RUN pnpm install --frozen-lockfile --filter frontendmu-adonis

COPY packages/frontendmu-adonis packages/frontendmu-adonis
WORKDIR /repo/packages/frontendmu-adonis
# `node ace build` type-checks against the generated .adonisjs/ types but does
# not write them; codegen boots the app in warmup mode with .env.test values.
RUN NODE_ENV=test node ace codegen
RUN node ace build

# Production node_modules resolved from the same lockfile.
RUN pnpm --filter frontendmu-adonis deploy --prod /prod

# --- Production stage ---
FROM base
WORKDIR /app

COPY --from=build /repo/packages/frontendmu-adonis/build ./
COPY --from=build /prod/node_modules ./node_modules

RUN mkdir -p tmp

EXPOSE 3333
CMD ["node", "bin/server.js"]
