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

const EMAILJS_SERVICE = import.meta.env.VITE_EMAILJS_SERVICE_ID || ''
const EMAILJS_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || ''
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || ''
const CALLMEBOT_KEY = import.meta.env.VITE_CALLMEBOT_APIKEY || ''
const CALLMEBOT_PHONE = import.meta.env.VITE_CALLMEBOT_PHONE || '+919940291467'

const EMAILJS_ENDPOINT = 'https://api.emailjs.com/api/v1.0/email/send'
const CALLMEBOT_ENDPOINT = 'https://api.callmebot.com/whatsapp.php'
const STORE_EMAIL = 'vrstores.airconditioner@gmail.com'

// All three EmailJS values are needed; a partial config would fail on every send.
export const emailConfigured = Boolean(EMAILJS_SERVICE && EMAILJS_TEMPLATE && EMAILJS_PUBLIC_KEY)
export const whatsappConfigured = Boolean(CALLMEBOT_KEY)

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
  if (!emailConfigured) {
    return {
      ok: false,
      error:
        'EmailJS is not fully configured (needs VITE_EMAILJS_SERVICE_ID, ' +
        'VITE_EMAILJS_TEMPLATE_ID and VITE_EMAILJS_PUBLIC_KEY).',
    }
  }
  try {
    const res = await fetch(EMAILJS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: EMAILJS_SERVICE,
        template_id: EMAILJS_TEMPLATE,
        user_id: EMAILJS_PUBLIC_KEY,
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
  if (!whatsappConfigured) {
    return { ok: false, error: 'No CallMeBot API key configured (VITE_CALLMEBOT_APIKEY).' }
  }
  const url =
    `${CALLMEBOT_ENDPOINT}?phone=${encodeURIComponent(CALLMEBOT_PHONE)}` +
    `&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(CALLMEBOT_KEY)}`
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
