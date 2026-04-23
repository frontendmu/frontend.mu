function getCsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row: string) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

async function getFallbackMessage(response: Response, contentType: string) {
  const fallback = response.statusText || `HTTP ${response.status}`

  if (contentType.includes('text/html')) {
    return fallback
  }

  const body = await response.text()
  const text = body.replace(/\s+/g, ' ').trim()

  if (!text) {
    return fallback
  }

  return text.length > 200 ? `${text.slice(0, 200)}...` : text
}

async function readResponseData<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') || ''

  if (contentType.includes('application/json')) {
    return (await response.json()) as T
  }

  return {
    message: await getFallbackMessage(response, contentType),
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
