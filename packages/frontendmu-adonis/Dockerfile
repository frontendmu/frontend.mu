FROM node:20-slim AS base
RUN corepack enable

# --- Build stage ---
FROM base AS build
WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN pnpm config set auto-install-peers true && pnpm install --config.confirmModulesPurge=false
RUN pnpm rebuild better-sqlite3

COPY . .
RUN node ace build --ignore-ts-errors

# --- Production stage ---
FROM base
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build ./
RUN pnpm config set auto-install-peers true && pnpm install --prod --config.confirmModulesPurge=false
RUN pnpm rebuild better-sqlite3

RUN mkdir -p tmp

EXPOSE 3333
CMD ["node", "bin/server.js"]
