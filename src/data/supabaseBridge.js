/**
 * The invoice generator is a standalone HTML app in public/, so Vite never
 * processes it and it cannot read import.meta.env. It does, however, read its
 * Supabase credentials from localStorage under 'vr_supabase_config' — and it is
 * served from our own origin, so we can write that key for it.
 *
 * This keeps the credentials in .env rather than committed inside the HTML.
 */
const CONFIG_KEY = 'vr_supabase_config'

import { remoteConfigured } from './supabase'

const URL_ = import.meta.env.VITE_SUPABASE_URL || ''
const KEY_ = import.meta.env.VITE_SUPABASE_KEY || ''

// Credentials entered by the admin are written straight to the invoice app's
// own key, so this only has to handle the build-time pair.
export const supabaseConfigured = remoteConfigured

/**
 * Must run before the invoice iframe loads, since the app reads the config once
 * on startup. Returns whether credentials were handed over.
 */
export function syncInvoiceSupabaseConfig() {
  if (!supabaseConfigured) return false
  try {
    const existing = localStorage.getItem(CONFIG_KEY)
    const next = JSON.stringify({ url: URL_, key: KEY_ })
    // Only write when it actually changed, so a config the user edited inside
    // the invoice app's own dialog is not clobbered on every visit.
    if (existing !== next) {
      const parsed = existing ? JSON.parse(existing) : null
      if (!parsed || parsed.url !== URL_ || parsed.key !== KEY_) {
        localStorage.setItem(CONFIG_KEY, next)
      }
    }
    return true
  } catch {
    return false
  }
}
