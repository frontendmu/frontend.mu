/**
 * Returns the value only if it's a safe same-origin pathname.
 * Rejects non-strings, absolute URLs, protocol-relative URLs (`//…`),
 * backslash bypasses, and control characters (guards against
 * response-splitting if this is ever written to a header).
 */
export function safeReturnUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  if (value.length === 0 || value.length > 2048) return null
  if (/[\x00-\x1f\x7f]/.test(value)) return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//') || value.startsWith('/\\')) return null
  return value
}
