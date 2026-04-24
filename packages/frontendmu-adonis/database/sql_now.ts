export function sqlNow() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
}
