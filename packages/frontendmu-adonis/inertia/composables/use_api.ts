function getCsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row: string) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

function textToMessage(text: string, fallback: string) {
  const message = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return message || fallback
}

async function readResponseData<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  const text = await response.text()
  return {
    message: textToMessage(text, response.statusText),
  } as T
}

export function useApi() {
  async function apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; data: T; response: Response }> {
    const headers = new Headers(options.headers)
    headers.set('Accept', 'application/json')
    headers.set('X-XSRF-TOKEN', getCsrfToken())

    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await readResponseData<T>(response)
    return { ok: response.ok, data, response }
  }

  return { apiFetch }
}
