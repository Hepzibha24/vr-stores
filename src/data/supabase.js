/**
 * Supabase access for the React app.
 *
 * The sample project used @supabase/supabase-js. This talks to the same
 * PostgREST endpoints with plain fetch instead — the SDK's real value is auth
 * and realtime subscriptions, neither of which this app uses, and bundling it
 * added ~217 KB that every public visitor would download just to read the
 * services list. (The invoice generator still uses the SDK, loaded from a CDN
 * inside its own page, because it genuinely does need auth.)
 *
 * Credentials come from .env; without them `remoteConfigured` is false and the
 * whole cloud layer is skipped.
 */
const URL_ = import.meta.env.VITE_SUPABASE_URL
const KEY_ = import.meta.env.VITE_SUPABASE_KEY

export const remoteConfigured = Boolean(URL_ && KEY_)

if (!remoteConfigured) {
  console.warn('[VR Store] Supabase credentials not found. Using localStorage only.')
}

function headers(prefer) {
  const h = {
    apikey: KEY_,
    Authorization: `Bearer ${KEY_}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (prefer) h.Prefer = prefer
  return h
}

/**
 * One PostgREST call. Resolves to { ok, data } or { ok: false, error } and
 * never throws — every caller treats the cloud as best-effort.
 */
export async function rest(path, { method = 'GET', body, prefer } = {}) {
  if (!remoteConfigured) return { ok: false, error: 'Supabase not configured' }
  try {
    const res = await fetch(`${URL_}/rest/v1/${path}`, {
      method,
      headers: headers(prefer),
      body: body === undefined ? undefined : JSON.stringify(body),
    })
    const text = await res.text()
    let parsed = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }
    if (!res.ok) {
      return { ok: false, error: parsed?.message || `Supabase returned ${res.status}` }
    }
    return { ok: true, data: parsed }
  } catch (err) {
    return { ok: false, error: err?.message || 'Network request failed' }
  }
}
