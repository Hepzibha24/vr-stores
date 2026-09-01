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
import { getAccessToken } from './supabaseAuth'

const URL_ = import.meta.env.VITE_SUPABASE_URL
const KEY_ = import.meta.env.VITE_SUPABASE_KEY

export const remoteConfigured = Boolean(URL_ && KEY_)

/**
 * Which VITE_* names the build was missing. Vite inlines these at build time,
 * so a value added to a host's dashboard does nothing until the site is
 * rebuilt — a distinction that is invisible from the outside and worth naming
 * precisely rather than saying "not configured".
 */
export const missingEnvVars = [
  !URL_ && 'VITE_SUPABASE_URL',
  !KEY_ && 'VITE_SUPABASE_KEY',
  !import.meta.env.VITE_EMAILJS_SERVICE_ID && 'VITE_EMAILJS_SERVICE_ID',
  !import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 'VITE_EMAILJS_TEMPLATE_ID',
  !import.meta.env.VITE_EMAILJS_PUBLIC_KEY && 'VITE_EMAILJS_PUBLIC_KEY',
  !import.meta.env.VITE_CALLMEBOT_APIKEY && 'VITE_CALLMEBOT_APIKEY',
].filter(Boolean)

if (!remoteConfigured) {
  console.warn('[VR Store] Supabase credentials not found. Using localStorage only.')
}

// The bearer is the signed-in user's token when there is one, and the anon key
// otherwise. RLS then decides what the request may touch: the public site gets
// anon's narrow insert/select rights, the signed-in admin gets full access.
async function headers(prefer) {
  const h = {
    apikey: KEY_,
    Authorization: `Bearer ${await getAccessToken()}`,
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
      headers: await headers(prefer),
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
      // 401/403 on a table the anon key cannot reach is the lockdown working,
      // not a bug — the admin just has not signed in to the database yet.
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: parsed?.message || 'Sign in to the database to access this', authRequired: true }
      }
      return { ok: false, error: parsed?.message || `Supabase returned ${res.status}` }
    }
    return { ok: true, data: parsed }
  } catch (err) {
    return { ok: false, error: err?.message || 'Network request failed' }
  }
}
