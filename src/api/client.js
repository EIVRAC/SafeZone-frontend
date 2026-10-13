import { API_BASE_URL } from './config'

const TOKEN_KEY = 'safezone_token'
const USER_KEY = 'safezone_user'

/** Whichever storage currently holds the token — set at login based on "Remember me". */
function activeStorage() {
  return localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

/** Persist a fresh login: token + user, in localStorage (remembered) or sessionStorage (this tab only). */
export function setSession(token, user, remember = true) {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  store.setItem(TOKEN_KEY, token)
  store.setItem(USER_KEY, JSON.stringify(user))
}

/** Read the cached user object (if any) without hitting the network. */
export function getCachedUser() {
  const raw = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY)
  if (!raw) return null
  try { return JSON.parse(raw) } catch { return null }
}

/** Patch the cached user object in place (e.g. after a profile edit). */
export function updateCachedUser(patch) {
  const store = activeStorage()
  const current = getCachedUser() || {}
  const next = { ...current, ...patch }
  store.setItem(USER_KEY, JSON.stringify(next))
  return next
}

/** Clear all auth state from both storages. */
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

/**
 * Thin wrapper around fetch() that talks to the PHP/MySQL backend.
 * - Sends/receives JSON
 * - Attaches the bearer token (if any) so the PHP API can identify the user
 * - Normalizes errors so callers can `catch (err) { err.message }`
 */
async function request(path, { method = 'GET', body, params, isForm = false } = {}) {
  let url = `${API_BASE_URL}${path}`

  if (params) {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString()
    if (qs) url += (url.includes('?') ? '&' : '?') + qs
  }

  const options = {
    method,
    headers: {
      // Ensures the Laravel backend always returns JSON error bodies
      // (validation errors, 404s, 500s) instead of an HTML error page.
      'Accept': 'application/json',
    },
  }

  const token = getToken()
  if (token) options.headers['Authorization'] = `Bearer ${token}`

  if (body !== undefined) {
    if (isForm) {
      options.body = body
    } else {
      options.headers['Content-Type'] = 'application/json'
      options.body = JSON.stringify(body)
    }
  }

  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error(
      'Cannot reach the SafeZone API. Make sure MySQL is running in XAMPP and the Laravel backend is running (php artisan serve).'
    )
  }

  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok || (payload && payload.success === false)) {
    const message = (payload && (payload.message || payload.error)) || `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload
}

export const api = {
  get: (path, params) => request(path, { method: 'GET', params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path, body) => request(path, { method: 'DELETE', body }),
  upload: (path, formData) => request(path, { method: 'POST', body: formData, isForm: true }),
}
