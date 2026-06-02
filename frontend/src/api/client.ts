const defaultApiBase = 'http://localhost:3001'

type ApiResult<T> = {
  ok: boolean
  status: number
  data: T | null
  error?: string
}

function apiFailure<T>(error: unknown): ApiResult<T> {
  const message = error instanceof Error ? error.message : 'Unknown network error'

  return {
    ok: false,
    status: 0,
    data: null,
    error: `Cannot connect to the backend API. Make sure it is running on ${getApiBase()}. ${message}`,
  }
}

export function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL ?? defaultApiBase
}

export function getAuthToken() {
  return localStorage.getItem('flofi_token')
}

export function setAuthToken(token: string) {
  localStorage.setItem('flofi_token', token)
}

export function clearAuthToken() {
  localStorage.removeItem('flofi_token')
}

export async function apiGet<T>(path: string): Promise<ApiResult<T>> {
  const base = getApiBase()
  const token = getAuthToken()

  try {
    const response = await fetch(`${base}${path}`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    return {
      ok: response.ok,
      status: response.status,
      data: data as T | null,
    }
  } catch (error) {
    return apiFailure<T>(error)
  }
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const base = getApiBase()
  const token = getAuthToken()

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    return {
      ok: response.ok,
      status: response.status,
      data: data as T | null,
    }
  } catch (error) {
    return apiFailure<T>(error)
  }
}

export async function apiPut<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  const base = getApiBase()
  const token = getAuthToken()

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : null),
      },
      body: JSON.stringify(body),
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    return {
      ok: response.ok,
      status: response.status,
      data: data as T | null,
    }
  } catch (error) {
    return apiFailure<T>(error)
  }
}

export async function apiDelete<T>(path: string): Promise<ApiResult<T>> {
  const base = getApiBase()
  const token = getAuthToken()

  try {
    const response = await fetch(`${base}${path}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })

    const contentType = response.headers.get('content-type') ?? ''
    const isJson = contentType.includes('application/json')
    const data = isJson ? await response.json() : null

    return {
      ok: response.ok,
      status: response.status,
      data: data as T | null,
    }
  } catch (error) {
    return apiFailure<T>(error)
  }
}

