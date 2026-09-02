/**
 * Supabase sign-in for the React admin, against the GoTrue REST API.
 *
 * Needed because supabase/policies.sql restricts enquiries, bookings and site
 * content to the `authenticated` role. The public site still writes leads with
 * the anon key (anon holds INSERT on those tables), but the admin has to read
 * them back, and that now requires a real session.
 *
 * Implemented with fetch for the same reason as supabase.js: the SDK's bulk is
 * not worth carrying for two endpoints.
 */
import { SUPABASE_KEY as KEY_, SUPABASE_URL as URL_ } from './config'

const SESSION_KEY = 'vrstore:supabase-session'

// Refresh a little early rather than letting a request fail on a stale token.
const REFRESH_MARGIN_MS = 60_000

let session = null
let loaded = false
const listeners = new Set()

function load() {
  if (loaded) return session
  loaded = true
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    session = raw ? JSON.parse(raw) : null
  } catch {
    session = null
  }
  return session
}

function persist(next) {
  session = next
  try {
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    // Session simply will not survive a reload.
  }
  listeners.forEach((fn) => fn())
}

export function subscribeAuth(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function currentSession() {
  return load()
}

export function signedInAs() {
  const s = load()
  return s?.user?.email || null
}

function shapeSession(body) {
  return {
    access_token: body.access_token,
    refresh_token: body.refresh_token,
    // expires_in is seconds from now.
    expires_at: Date.now() + (Number(body.expires_in) || 3600) * 1000,
    user: { id: body.user?.id, email: body.user?.email },
  }
}

async function token(grant, payload) {
  const res = await fetch(`${URL_}/auth/v1/token?grant_type=${grant}`, {
    method: 'POST',
    headers: { apikey: KEY_, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, error: body.error_description || body.msg || `Sign-in failed (${res.status})` }
  }
  persist(shapeSession(body))
  return { ok: true }
}

export function signIn(email, password) {
  if (!URL_ || !KEY_) return Promise.resolve({ ok: false, error: 'Supabase is not configured.' })
  return token('password', { email: email.trim(), password }).catch((err) => ({
    ok: false,
    error: err?.message || 'Network request failed',
  }))
}

export async function signOut() {
  const s = load()
  if (s?.access_token) {
    // Best-effort revoke; the local session is cleared either way.
    try {
      await fetch(`${URL_}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: KEY_, Authorization: `Bearer ${s.access_token}` },
      })
    } catch {
      // ignore
    }
  }
  persist(null)
}

let refreshing = null

/**
 * The bearer token for data requests: a live user token when signed in,
 * otherwise the anon key (which is all the public site needs).
 */
export async function getAccessToken() {
  const s = load()
  if (!s) return KEY_
  if (Date.now() < s.expires_at - REFRESH_MARGIN_MS) return s.access_token

  // Collapse concurrent refreshes into one request.
  if (!refreshing) {
    refreshing = token('refresh_token', { refresh_token: s.refresh_token })
      .catch(() => ({ ok: false }))
      .finally(() => {
        refreshing = null
      })
  }
  const result = await refreshing
  if (!result.ok) {
    // Refresh token is spent or revoked — force a fresh sign-in.
    persist(null)
    return KEY_
  }
  return load().access_token
}
