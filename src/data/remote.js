/**
 * Translation layer between this app's shapes and the Supabase tables from the
 * sample project's schema.
 *
 *   enquiries → public.messages   (+ service / status / notes columns)
 *   bookings  → public.bookings   (+ technician / scheduled_date columns)
 *   content   → public.settings   (one JSONB row per collection)
 *   analytics → stays local; it is high-volume, low-value page-view noise.
 *
 * The extra columns come from supabase/migration-app-tables.sql.
 *
 * Every function resolves to { ok } or { ok: false, error } and never throws,
 * because the caller treats the cloud as best-effort: localStorage is always
 * written first so a lead cannot be lost to a network failure.
 */
import { remoteConfigured, rest } from './supabase'

export const remoteEnabled = remoteConfigured

const CONTENT_KEYS = {
  services: 'site_services',
  brands: 'site_brands',
  amcPlans: 'site_amc_plans',
  reviews: 'site_reviews',
}

// PostgREST: upsert on primary-key conflict, and do not echo the row back.
const UPSERT = 'resolution=merge-duplicates,return=minimal'
const MINIMAL = 'return=minimal'

/* ── row ⇄ record mapping ─────────────────────────────────────────────── */

const enquiryToRow = (e) => ({
  id: e.id,
  name: e.name,
  phone: e.phone,
  email: e.email || '',
  message: e.message || '',
  service: e.service || '',
  status: e.status || 'New',
  notes: e.notes || '',
  created_at: e.createdAt,
})

const rowToEnquiry = (r) => ({
  id: r.id,
  name: r.name || '',
  phone: r.phone || '',
  email: r.email || '',
  message: r.message || '',
  service: r.service || '',
  status: r.status || 'New',
  notes: r.notes || '',
  createdAt: r.created_at || new Date().toISOString(),
  // Alert delivery is a property of the browser that sent it, not of the row.
  emailStatus: 'sent',
  emailError: '',
  waStatus: 'unconfirmed',
  waError: '',
})

const bookingToRow = (b) => ({
  id: b.id,
  name: b.name,
  phone: b.phone,
  email: '',
  service_type: b.plan || '',
  ac_type: [b.brand, b.model].filter(Boolean).join(' '),
  preferred_date: b.requestedDate || '',
  address: '',
  status: b.status || 'Pending',
  notes: b.notes || '',
  technician: b.technician || '',
  scheduled_date: b.scheduledDate || '',
  created_at: b.createdAt,
})

const rowToBooking = (r) => {
  const ac = (r.ac_type || '').trim()
  const [brand, ...rest_] = ac.split(' ')
  return {
    id: r.id,
    name: r.name || '',
    phone: r.phone || '',
    brand: brand || '',
    model: rest_.join(' '),
    plan: r.service_type || '',
    requestedDate: r.preferred_date || '',
    status: r.status || 'Pending',
    technician: r.technician || '',
    scheduledDate: r.scheduled_date || '',
    notes: r.notes || '',
    createdAt: r.created_at || new Date().toISOString(),
    emailStatus: 'sent',
    emailError: '',
    waStatus: 'unconfirmed',
    waError: '',
  }
}

/* ── reads ────────────────────────────────────────────────────────────── */

/** Pulls everything the cloud knows about. Partial failures are reported per key. */
export async function pullAll() {
  const out = { ok: true, enquiries: null, bookings: null, content: {}, errors: [] }
  if (!remoteConfigured) return { ...out, ok: false, error: 'Supabase not configured' }

  const [msgs, bks, settings] = await Promise.all([
    rest('messages?select=*&order=created_at.desc'),
    rest('bookings?select=*&order=created_at.desc'),
    rest(`settings?select=key,value&key=in.(${Object.values(CONTENT_KEYS).join(',')})`),
  ])

  if (msgs.ok) out.enquiries = (msgs.data || []).map(rowToEnquiry)
  else {
    out.errors.push(`enquiries: ${msgs.error}`)
    if (msgs.authRequired) out.authRequired = true
  }

  if (bks.ok) out.bookings = (bks.data || []).map(rowToBooking)
  else {
    out.errors.push(`bookings: ${bks.error}`)
    if (bks.authRequired) out.authRequired = true
  }

  if (settings.ok) {
    for (const [field, key] of Object.entries(CONTENT_KEYS)) {
      const row = (settings.data || []).find((r) => r.key === key)
      if (row && Array.isArray(row.value)) out.content[field] = row.value
    }
  } else {
    out.errors.push(`content: ${settings.error}`)
  }

  out.ok = out.errors.length === 0
  return out
}

/* ── writes ───────────────────────────────────────────────────────────── */

export function pushEnquiry(enquiry) {
  return rest('messages', { method: 'POST', body: enquiryToRow(enquiry), prefer: UPSERT })
}

export function pushBooking(booking) {
  return rest('bookings', { method: 'POST', body: bookingToRow(booking), prefer: UPSERT })
}

export function patchEnquiry(enquiry) {
  return rest(`messages?id=eq.${encodeURIComponent(enquiry.id)}`, {
    method: 'PATCH',
    body: enquiryToRow(enquiry),
    prefer: MINIMAL,
  })
}

export function patchBooking(booking) {
  return rest(`bookings?id=eq.${encodeURIComponent(booking.id)}`, {
    method: 'PATCH',
    body: bookingToRow(booking),
    prefer: MINIMAL,
  })
}

export function removeRow(collection, id) {
  const table = collection === 'enquiries' ? 'messages' : 'bookings'
  return rest(`${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: MINIMAL })
}

/** Site content lives as one JSONB row per collection in public.settings. */
export function pushContent(field, rows) {
  const key = CONTENT_KEYS[field]
  if (!key) return Promise.resolve({ ok: false, error: `Unknown content field ${field}` })
  return rest('settings', {
    method: 'POST',
    body: { key, value: rows, updated_at: new Date().toISOString() },
    prefer: UPSERT,
  })
}

/* ── Products & AMC pricing ───────────────────────────────────────────── */

const productToRow = (p) => ({
  id: p.id,
  name: p.name,
  brand: p.brand || '',
  capacity: p.capacity || '',
  type: p.type || '',
  price: Number(p.price) || 0,
  description: p.description || '',
  featured: Boolean(p.featured),
  image: p.image || '',
})

const rowToProduct = (r) => ({
  id: r.id,
  name: r.name || '',
  brand: r.brand || '',
  capacity: r.capacity || '',
  type: r.type || '',
  price: Number(r.price) || 0,
  description: r.description || '',
  featured: Boolean(r.featured),
  image: r.image || '',
})

export function pushProduct(product) {
  return rest('products', { method: 'POST', body: productToRow(product), prefer: UPSERT })
}

export function removeProduct(id) {
  return rest(`products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', prefer: MINIMAL })
}

export function pushPricing(pricing) {
  return rest('settings', {
    method: 'POST',
    body: { key: 'amc_pricing', value: pricing, updated_at: new Date().toISOString() },
    prefer: UPSERT,
  })
}

/** Products and pricing are pulled separately from pullAll so a missing
 *  products table never blocks enquiries and bookings from syncing. */
export async function pullCatalogue() {
  if (!remoteConfigured) return { ok: false, error: 'Supabase not configured' }
  const [prods, pricing] = await Promise.all([
    rest('products?select=*&order=id'),
    rest('settings?select=key,value&key=eq.amc_pricing'),
  ])
  const out = { ok: true, products: null, amcPricing: null, errors: [] }
  if (prods.ok) out.products = (prods.data || []).map(rowToProduct)
  else out.errors.push(`products: ${prods.error}`)
  if (pricing.ok) {
    const row = (pricing.data || [])[0]
    if (row && row.value && typeof row.value === 'object') out.amcPricing = row.value
  } else out.errors.push(`amc pricing: ${pricing.error}`)
  out.ok = out.errors.length === 0
  return out
}
