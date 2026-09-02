/**
 * Public configuration for the site.
 *
 * Everything here is public by design and already ends up in the shipped
 * bundle, so it is committed rather than depending on build-time environment
 * variables. That dependency was the problem: a value set for the wrong
 * environment on a hosting dashboard produces a build that looks fine and
 * quietly has no database, with nothing on the page to say so.
 *
 * `VITE_*` still wins where set, so a different Supabase project can be
 * pointed at without editing code.
 *
 * What protects the data is not the secrecy of this key — it cannot be secret —
 * but the row-level security policies in supabase/policies.sql: the anonymous
 * role may insert a lead and read the public catalogue, and nothing else.
 * Reading customer data back requires signing in.
 */

const env = import.meta.env

export const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://mjdftntxhshgxfxtinyl.supabase.co'
export const SUPABASE_KEY =
  env.VITE_SUPABASE_KEY || 'sb_publishable_hHoEMdBb726pruR64_F4Qw_DikZUr1W'

// These have no default: unlike the Supabase key they are per-account, and a
// wrong value fails silently rather than obviously. Set them in .env or in the
// host's environment variables — see .env.example.
export const EMAILJS_SERVICE_ID = env.VITE_EMAILJS_SERVICE_ID || ''
export const EMAILJS_TEMPLATE_ID = env.VITE_EMAILJS_TEMPLATE_ID || ''
export const EMAILJS_PUBLIC_KEY = env.VITE_EMAILJS_PUBLIC_KEY || ''
export const CALLMEBOT_APIKEY = env.VITE_CALLMEBOT_APIKEY || ''
export const CALLMEBOT_PHONE = env.VITE_CALLMEBOT_PHONE || '+919940291467'
