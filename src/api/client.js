// Shared HTTP client for the Go backend.
//
// Set VITE_API_URL in .env (e.g. https://api.socksavvy.co) to call the real API.
// Leave it empty and every api/* module falls back to its built-in mock,
// so the storefront works end-to-end before the backend exists.

export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const USE_MOCK = !API_URL

export class ApiError extends Error {
  constructor(message, status = 0, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ApiError('could not reach the server — check your connection', 0)
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    throw new ApiError(data?.error || data?.message || `request failed (${res.status})`, res.status, data)
  }
  return data
}

/** Build "?a=1&b=x,y" from an object, skipping empty values */
export function toQuery(params = {}) {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) continue
    qs.set(key, Array.isArray(value) ? value.join(',') : String(value))
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

/** Small artificial latency for mocks so loading states are visible in dev */
export const mockDelay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms))
