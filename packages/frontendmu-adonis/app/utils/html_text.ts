/**
 * Convert a snippet of HTML (e.g. a richtext description from an event row)
 * into plain text suitable for a <meta name="description"> tag.
 *
 *  - Decodes common named entities and numeric entities.
 *  - Strips tags.
 *  - Collapses whitespace.
 *  - Truncates to a max length.
 *
 * Order matters: tags first (so entities inside a stripped <script> are not
 * decoded), then entities, then whitespace, then truncate.
 */

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  laquo: '«',
  raquo: '»',
  copy: '©',
  reg: '®',
  trade: '™',
}

function decodeEntities(input: string): string {
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, ref: string) => {
    if (ref[0] === '#') {
      const isHex = ref[1] === 'x' || ref[1] === 'X'
      const code = Number.parseInt(ref.slice(isHex ? 2 : 1), isHex ? 16 : 10)
      if (Number.isFinite(code)) {
        try {
          return String.fromCodePoint(code)
        } catch {
          return match
        }
      }
      return match
    }
    return NAMED_ENTITIES[ref.toLowerCase()] ?? match
  })
}

export function htmlToPlainText(input: string | null | undefined, maxLen = 200): string {
  if (!input) return ''
  const stripped = input.replace(/<[^>]+>/g, ' ')
  const decoded = decodeEntities(stripped)
  const collapsed = decoded.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= maxLen) return collapsed
  // Cut at a word boundary when possible, then trim and add an ellipsis.
  const cut = collapsed.slice(0, maxLen)
  const lastSpace = cut.lastIndexOf(' ')
  const head = lastSpace > maxLen - 30 ? cut.slice(0, lastSpace) : cut
  return `${head.trimEnd()}…`
}
