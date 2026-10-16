export class ApiError extends Error {
  status: number
  fieldErrors?: Record<string, string>

  constructor(message: string, status = 500, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

const BASE_URL = (import.meta.env.VITE_SERVER_URL as string | undefined) ?? ''
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL === 'true'

const LATENCY = 250

function getToken(): string | null {
  return localStorage.getItem('ks.token')
}

async function localRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const { handleLocalRequest } = await import('./local/handlers')
  await new Promise((resolve) => setTimeout(resolve, LATENCY))
  return handleLocalRequest<T>(method, path, body)
}

async function realRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Please check your connection.', 0)
  }

  if (response.status === 401) {
    localStorage.removeItem('ks.token')
    localStorage.removeItem('ks.admin')
    window.location.href = '/login'
    throw new ApiError('Your session has expired. Please sign in again.', 401)
  }

  if (response.status === 204) return undefined as T

  const text = await response.text()
  let payload: unknown = null
  if (text) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    const err = payload as { message?: string; fieldErrors?: Record<string, string> } | null
    throw new ApiError(
      err?.message ?? `Request failed with status ${response.status}`,
      response.status,
      err?.fieldErrors,
    )
  }

  return payload as T
}

export function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  return USE_LOCAL ? localRequest<T>(method, path, body) : realRequest<T>(method, path, body)
}
