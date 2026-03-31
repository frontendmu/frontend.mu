function getCsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split('; ')
      .find((row: string) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

export function useApi() {
  async function apiFetch<T = unknown>(
    url: string,
    options: RequestInit = {}
  ): Promise<{ ok: boolean; data: T }> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-XSRF-TOKEN': getCsrfToken(),
        ...options.headers,
      },
    })

    const data = (await response.json()) as T
    return { ok: response.ok, data }
  }

  return { apiFetch }
}
