FROM node:20-slim AS base

# --- Build stage ---
FROM base AS build
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json ./
RUN npm install

COPY . .
RUN node ace build --ignore-ts-errors

# --- Production stage ---
FROM base
WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/build ./
RUN npm install --omit=dev

RUN mkdir -p tmp

EXPOSE 3333
CMD ["node", "bin/server.js"]
