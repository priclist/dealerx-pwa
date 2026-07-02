import { useAuthStore } from '../store/authStore'

const API_URL = import.meta.env.VITE_API_URL || ''

function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout after ' + ms + 'ms')), ms)
    ),
  ])
}

async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {}),
  }

  const res = await withTimeout(
    fetch(url, {
      ...options,
      headers,
    }),
    20000
  )

  if (res.status === 401) {
    throw new Error('Session expired')
  }

  const contentType = res.headers.get('content-type') || ''
  const isHtml = contentType.includes('text/html')

  if (!res.ok) {
    if (isHtml) {
      console.warn(
        'Server returned HTML instead of JSON. VITE_API_URL is probably wrong:\n',
        API_URL
      )
    }
    const text = await res.text()
    let errorMessage = text
    try {
      const parsed = JSON.parse(text)
      errorMessage = parsed.error || parsed.message || text
    } catch {
      // not JSON
    }
    throw new Error(errorMessage || `HTTP ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  if (!text) return undefined as T

  try {
    return JSON.parse(text) as T
  } catch {
    if (isHtml) {
      console.warn(
        'Server returned HTML instead of JSON. VITE_API_URL is probably wrong:\n',
        API_URL
      )
    }
    throw new Error('Invalid JSON response')
  }
}

export const api = {
  get: <T = unknown>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T = unknown>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  del: <T = unknown>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
  upload: <T = unknown>(endpoint: string, formData: FormData, timeoutMs = 60000) => {
    const url = `${API_URL}${endpoint}`
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)

    console.log('[upload] POST', url, 'formData entries:', [...(formData as any).entries()].map(([k, v]: [string, any]) => [k, v instanceof File ? `File(${v.name}, ${v.size}b, ${v.type})` : v]))

    return fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      body: formData,
      signal: controller.signal,
    })
      .finally(() => clearTimeout(timeout))
      .then(async (res) => {
        console.log('[upload] response status:', res.status, res.statusText)
        if (!res.ok) {
          const text = await res.text()
          console.error('[upload] error response:', text)
          let msg = text
          try { msg = JSON.parse(text).error || text } catch {}
          throw new Error(msg || `HTTP ${res.status}`)
        }
        const text = await res.text()
        console.log('[upload] success response:', text.substring(0, 200))
        return text ? JSON.parse(text) as T : undefined as T
      })
      .catch((err) => {
        if (err.name === 'AbortError') {
          console.error('[upload] request timed out after', timeoutMs, 'ms')
          throw new Error('Upload timed out')
        }
        console.error('[upload] fetch error:', err)
        throw err
      })
  },
}

export default api

