const defaultApiBase = 'http://localhost:3001'

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

export async function apiGet<T>(path: string) {
  const base = getApiBase()
  const token = getAuthToken()

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
}

export async function apiPost<T>(path: string, body: unknown) {
  const base = getApiBase()
  const token = getAuthToken()

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
}

export async function apiPut<T>(path: string, body: unknown) {
  const base = getApiBase()
  const token = getAuthToken()

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
}

export async function apiDelete<T>(path: string) {
  const base = getApiBase()
  const token = getAuthToken()

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
}

