FROM node:20-slim AS base
RUN corepack enable && \
    pnpm config set manage-package-manager-versions false

# --- Build stage ---
FROM base AS build
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN pnpm install --ignore-scripts && pnpm rebuild better-sqlite3

COPY . .
RUN node ace build --ignore-ts-errors

# --- Production stage ---
FROM base
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build ./
RUN pnpm install --prod --ignore-scripts && pnpm rebuild better-sqlite3

RUN mkdir -p tmp

EXPOSE 3333
CMD ["node", "bin/server.js"]
