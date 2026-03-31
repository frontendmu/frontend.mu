import DOMPurify from 'dompurify'

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'em',
      'b',
      'i',
      'a',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  })
}
