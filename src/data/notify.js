/**
 * Outbound alerts when an enquiry or booking arrives. Two independent channels:
 *
 *   email    — EmailJS    → vrstores.airconditioner@gmail.com  (confirmable)
 *   whatsapp — CallMeBot  → the store's number                 (NOT confirmable)
 *
 * The store saves every record locally first and *then* calls in here, so a
 * failed alert can never lose a lead — it only leaves the record marked, and
 * the admin can retry either channel independently.
 *
 * Configure both in a `.env` file at the project root; see .env.example.
 */

import {
  CALLMEBOT_APIKEY as CALLMEBOT_KEY,
  CALLMEBOT_PHONE,
  EMAILJS_PUBLIC_KEY,
  EMAILJS_SERVICE_ID as EMAILJS_SERVICE,
  EMAILJS_TEMPLATE_ID as EMAILJS_TEMPLATE,
} from './config'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'
const CALLMEBOT_ENDPOINT = 'https://api.callmebot.com/whatsapp.php'
const STORE_EMAIL = 'vrstores.airconditioner@gmail.com'

/* ── Where the credentials come from ───────────────────────────────────────
 *
 * Build-time environment variables were the original plan and they are still
 * honoured, but they cannot be the only route. Setting them on the host
 * dashboard produces a build that looks fine and silently sends nothing, which
 * is exactly how the Supabase credentials went missing for a fortnight. They
 * also mean the shop owner cannot change a template without a developer.
 *
 * So the values are resolved at call time, newest source first:
 *
 *   1. whatever the admin saved (kept in the `site_alerts` settings row, which
 *      every visitor's browser already reads, and mirrored into localStorage so
 *      a send works before the first fetch returns)
 *   2. VITE_* / config.js
 *
 * None of this is secret. The email is sent from the customer's own browser, so
 * all four values reach the page whichever route they take — EmailJS's public
 * key is named "public" for that reason. What stops a stranger spending the
 * quota is the allowed-origins list in the EmailJS dashboard, not secrecy.
 */

export const ALERT_CONFIG_KEY = 'vrstore:alert-config'

const FIELDS = ['serviceId', 'templateId', 'publicKey', 'callmebotKey', 'phone']

function stored() {
  try {
    // Also throws under SSR, where there is no localStorage at all.
    const raw = localStorage.getItem(ALERT_CONFIG_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

let runtime = stored()

/** Replaces the saved credentials. Called by the admin screen and by each pull. */
export function setAlertConfig(next, { persist = true } = {}) {
  runtime = {}
  FIELDS.forEach((f) => {
    const v = (next && next[f]) || ''
    if (typeof v === 'string' && v.trim()) runtime[f] = v.trim()
  })
  if (!persist) return runtime
  try {
    localStorage.setItem(ALERT_CONFIG_KEY, JSON.stringify(runtime))
  } catch {
    /* private mode — the values still apply for this page view */
  }
  return runtime
}

/** The credentials actually in force, after the fallback chain. */
export function alertConfig() {
  return {
    serviceId: runtime.serviceId || EMAILJS_SERVICE,
    templateId: runtime.templateId || EMAILJS_TEMPLATE,
    publicKey: runtime.publicKey || EMAILJS_PUBLIC_KEY,
    callmebotKey: runtime.callmebotKey || CALLMEBOT_KEY,
    phone: runtime.phone || CALLMEBOT_PHONE,
  }
}

/** Only what the admin saved, for populating the settings form. */
export function savedAlertConfig() {
  return { ...runtime }
}

// Functions, not constants: the values can now arrive after the module loads.
// All three EmailJS values are needed; a partial config fails on every send.
export function emailConfigured() {
  const c = alertConfig()
  return Boolean(c.serviceId && c.templateId && c.publicKey)
}

export function whatsappConfigured() {
  return Boolean(alertConfig().callmebotKey)
}

/* ── Email (EmailJS) ───────────────────────────────────────────────────── */

/**
 * Uses the REST endpoint rather than the @emailjs/browser SDK — it is one fetch,
 * keeps the bundle dependency-free, and returns a readable error body (EmailJS
 * does send CORS headers), so failures stay confirmable.
 *
 * `params` become the {{variables}} available in the EmailJS template. Keep the
 * names here in sync with the template in the EmailJS dashboard — see README.
 */
async function postEmail(params) {
  const cfg = alertConfig()
  if (!emailConfigured()) {
    const missing = [
      !cfg.serviceId && 'Service ID',
      !cfg.templateId && 'Template ID',
      !cfg.publicKey && 'Public Key',
    ].filter(Boolean)
    return {
      ok: false,
      error: `EmailJS is not set up yet — missing ${missing.join(', ')}. Add it under Email & WhatsApp Alerts in the admin.`,
    }
  }
  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: cfg.serviceId,
        template_id: cfg.templateId,
        user_id: cfg.publicKey,
        template_params: params,
      }),
    })
    if (res.ok) return { ok: true }
    // EmailJS returns a plain-text reason, e.g. "The Public Key is invalid".
    const reason = await res.text().catch(() => '')
    return { ok: false, error: reason || `EmailJS returned ${res.status}` }
  } catch (err) {
    return { ok: false, error: err?.message || 'Network request failed' }
  }
}

export function sendEnquiryEmail(enquiry) {
  return postEmail({
    to_email: STORE_EMAIL,
    subject: `New website enquiry — ${enquiry.name}${enquiry.service ? ` (${enquiry.service})` : ''}`,
    enquiry_type: 'Contact form',
    name: enquiry.name,
    phone: enquiry.phone,
    email: enquiry.email || '—',
    // Lets you hit Reply in Gmail and reach the customer when they left an address.
    reply_to: enquiry.email || STORE_EMAIL,
    service: enquiry.service || '—',
    message: enquiry.message || '—',
    received: new Date(enquiry.createdAt).toLocaleString('en-IN'),
  })
}

export function sendBookingEmail(booking) {
  return postEmail({
    to_email: STORE_EMAIL,
    subject: `New booking request — ${booking.name}${booking.plan ? ` (${booking.plan})` : ''}`,
    enquiry_type: 'AMC / service booking',
    name: booking.name,
    phone: booking.phone,
    email: '—',
    reply_to: STORE_EMAIL,
    service: `${booking.plan || '—'} · ${[booking.brand, booking.model].filter(Boolean).join(' ') || 'brand not given'}`,
    message: `Preferred date: ${booking.requestedDate || 'not specified'}`,
    received: new Date(booking.createdAt).toLocaleString('en-IN'),
  })
}

/* ── WhatsApp (CallMeBot) ──────────────────────────────────────────────── */

/**
 * CallMeBot sends no CORS headers, so the browser refuses to let us read the
 * response. `mode: 'no-cors'` still delivers the request — we simply get an
 * opaque result back. That means:
 *
 *   resolves → the request left the browser. WhatsApp *probably* arrived, but a
 *              bad key or a rate-limit would look identical to success.
 *   rejects  → it never got out at all (offline, DNS, blocked by an extension).
 *
 * Hence `unconfirmed` rather than `sent`. Email stays the channel of record;
 * WhatsApp is the nudge.
 */
async function postWhatsApp(text) {
  const cfg = alertConfig()
  if (!whatsappConfigured()) {
    return {
      ok: false,
      error: 'No CallMeBot API key yet — add it under Email & WhatsApp Alerts in the admin.',
    }
  }
  const url =
    `${CALLMEBOT_ENDPOINT}?phone=${encodeURIComponent(cfg.phone)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(cfg.callmebotKey)}`
  try {
    await fetch(url, { mode: 'no-cors' })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err?.message || 'Request never left the browser' }
  }
}

/** CallMeBot is rate-limited and the URL is capped, so keep messages compact. */
function clip(value, max) {
  const s = (value || '').trim()
  if (!s) return '—'
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

export function sendEnquiryWhatsApp(enquiry) {
  const lines = [
    '🔔 New enquiry — VR Store',
    `Name: ${clip(enquiry.name, 40)}`,
    `Phone: ${clip(enquiry.phone, 20)}`,
    `Service: ${clip(enquiry.service, 40)}`,
    `Message: ${clip(enquiry.message, 220)}`,
  ]
  return postWhatsApp(lines.join('\n'))
}

export function sendBookingWhatsApp(booking) {
  const lines = [
    '🗓️ New booking request — VR Store',
    `Name: ${clip(booking.name, 40)}`,
    `Phone: ${clip(booking.phone, 20)}`,
    `AC: ${clip([booking.brand, booking.model].filter(Boolean).join(' '), 50)}`,
    `Plan: ${clip(booking.plan, 40)}`,
    `Preferred date: ${clip(booking.requestedDate, 20)}`,
  ]
  return postWhatsApp(lines.join('\n'))
}

/* ── Test sends ────────────────────────────────────────────────────────────
 *
 * The whole point of the setup screen: prove the credentials work before a real
 * customer depends on them. These go through the same code path as a genuine
 * enquiry, so a pass here means a real enquiry will arrive too.
 */

export function sendTestEmail() {
  return postEmail({
    to_email: STORE_EMAIL,
    subject: 'Test alert — VR Store website',
    enquiry_type: 'Test',
    name: 'Test message',
    phone: '9940291467',
    email: STORE_EMAIL,
    reply_to: STORE_EMAIL,
    service: 'Setup check',
    message:
      'If this reached your inbox, enquiry alerts are working. ' +
      'Sent from the admin portal to confirm the EmailJS settings.',
    received: new Date().toLocaleString('en-IN'),
  })
}

export function sendTestWhatsApp() {
  return postWhatsApp(
    '✅ Test alert — VR Store\nIf you got this, WhatsApp alerts for new enquiries are working.',
  )
}
