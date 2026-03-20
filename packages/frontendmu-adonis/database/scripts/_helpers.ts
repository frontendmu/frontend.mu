import pg from 'pg'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const { Client } = pg

export const scriptsDir = dirname(fileURLToPath(import.meta.url))
export const workspaceDir = join(scriptsDir, '..', '..')
export const repoRootDir = join(workspaceDir, '..', '..')

export function createPgClient() {
  return new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number.parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'frontendmu_dev',
  })
}

export function resolveFrontendmuDataPath(...segments: string[]) {
  return join(repoRootDir, 'frontendmu-data', 'data', ...segments)
}

export function readJsonFile<T>(filePath: string): T {
  return JSON.parse(readFileSync(filePath, 'utf-8')) as T
}

export async function importDataModule<T>(filePath: string): Promise<T> {
  const module = await import(pathToFileURL(filePath).href)
  return module.default ?? module
}

export function requireFile(filePath: string, message?: string) {
  if (!existsSync(filePath)) {
    throw new Error(message || `Missing required file: ${filePath}`)
  }
}

export function nowSql() {
  return new Date()
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '')
}

export function logSection(title: string) {
  console.log(`\n${title}`)
}
