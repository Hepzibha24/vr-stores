/**
 * Single source of truth for the whole app — public site and admin portal both
 * read and write through here.
 *
 * Storage is two-tier, following the sample project's Supabase-first approach
 * but adapted to this store's synchronous snapshot:
 *   · localStorage is the synchronous copy components render from. It is
 *     written first, always, so a lead survives an offline moment.
 *   · Supabase is the shared copy across devices — pulled once on boot and
 *     written through on every mutation. Absent credentials, it is skipped
 *     entirely and the app behaves exactly as it did before.
 *
 * Shape of the persisted document:
 * {
 *   version:   number,
 *   enquiries: [{ id, name, phone, email, service, message, status, notes, createdAt,
 *                 emailStatus, emailError }],
 *   bookings:  [{ id, name, phone, brand, model, plan, requestedDate,
 *                 status, technician, scheduledDate, notes, createdAt,
 *                 emailStatus, emailError }],
 *   services:  [{ id, name, icon, description }],
 *   brands:    [{ id, name, featured }],
 *   amcPlans:  [{ id, title, icon, price, description, features[], featured }],
 *   analytics: [{ id, type: 'visit'|'enquiry'|'booking', day: 'YYYY-MM-DD', ts, service? }]
 * }
 *
 * Components should not import this directly for reads — use the hooks in
 * StoreContext.jsx so they re-render when the document changes.
 */
import {
  emailConfigured,
  sendBookingEmail,
  sendBookingWhatsApp,
  sendEnquiryEmail,
  sendEnquiryWhatsApp,
  whatsappConfigured,
} from './notify'
import {
  SEED_SERVICES,
  SEED_BRANDS,
  SEED_AMC_PLANS,
  SEED_ENQUIRIES,
  SEED_BOOKINGS,
  SEED_ANALYTICS,
  SEED_PRODUCTS,
  SEED_AMC_PRICING,
  SEED_REVIEWS,
} from './seed'
import {
  patchBooking,
  patchEnquiry,
  pullAll,
  pushBooking,
  pullCatalogue,
  pushContent,
  pushEnquiry,
  pushPricing,
  pushProduct,
  removeProduct,
  remoteEnabled,
  removeRow,
} from './remote'

const STORAGE_KEY = 'vrstore:data:v1'
const VERSION = 1

export const ENQUIRY_STATUSES = ['New', 'Contacted', 'Closed']
export const BOOKING_STATUSES = ['Pending', 'Scheduled', 'Completed']

// Delivery state per alert channel on a record:
//   'disabled'    — no key configured, nothing was attempted
//   'sending'     — request in flight
//   'sent'        — the provider confirmed it (email only)
//   'unconfirmed' — dispatched, but CallMeBot's CORS policy hides the result,
//                   so we cannot tell delivery from a silent rejection
//   'failed'      — see the record's *Error field; resendNotification() retries
export { emailConfigured, whatsappConfigured, remoteEnabled }

// The demo rows predate the site going live, so they are shown as already
// dealt with rather than as mail that failed to send.
const asHandled = (rows) =>
  rows.map((r) => ({
    emailStatus: 'sent',
    emailError: '',
    waStatus: 'unconfirmed',
    waError: '',
    ...r,
  }))

function freshDocument() {
  return {
    version: VERSION,
    enquiries: asHandled(SEED_ENQUIRIES),
    bookings: asHandled(SEED_BOOKINGS),
    services: SEED_SERVICES,
    brands: SEED_BRANDS,
    amcPlans: SEED_AMC_PLANS,
    analytics: SEED_ANALYTICS,
    products: SEED_PRODUCTS,
    amcPricing: SEED_AMC_PRICING,
    reviews: SEED_REVIEWS,
  }
}

/** Live cloud-connection state, exposed through the store but never persisted. */
const INITIAL_SYNC = {
  enabled: remoteEnabled,
  status: remoteEnabled ? 'idle' : 'disabled', // idle | syncing | synced | error | disabled
  lastSyncedAt: null,
  error: '',
  pendingWrites: 0,
}

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || parsed.version !== VERSION) return null
    // Guard against a partially written document from an older build.
    for (const key of ['enquiries', 'bookings', 'services', 'brands', 'amcPlans', 'analytics']) {
      if (!Array.isArray(parsed[key])) return null
    }
    // Added after the first release; fill in rather than discarding the document.
    if (!Array.isArray(parsed.products)) parsed.products = SEED_PRODUCTS
    if (!Array.isArray(parsed.reviews)) parsed.reviews = SEED_REVIEWS
    if (!parsed.amcPricing) parsed.amcPricing = SEED_AMC_PRICING
    return parsed
  } catch {
    return null
  }
}

let state = null
const listeners = new Set()

function ensure() {
  if (state === null) {
    state = { ...(readStorage() || freshDocument()), sync: INITIAL_SYNC }
    writeStorage(state)
  }
  return state
}

function writeStorage(doc) {
  try {
    // `sync` is live connection state, not data — never persist it.
    const { sync: _sync, ...persistable } = doc
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch {
    // Quota or private-mode failure: keep the in-memory copy so the session
    // still works, it just will not survive a reload.
  }
}

function commit(updater) {
  const next = { ...ensure(), ...updater(ensure()) }
  state = next
  writeStorage(next)
  listeners.forEach((fn) => fn())
  return next
}

export function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot() {
  return ensure()
}

export function resetToSeed() {
  state = freshDocument()
  writeStorage(state)
  listeners.forEach((fn) => fn())
}

/* ── Cloud sync (Supabase) ─────────────────────────────────────────────────
 * localStorage stays the synchronous source of truth that components render
 * from — that keeps the store snapshot sync, keeps the site usable offline, and
 * means a lead is never lost to a failed request. Supabase is the shared copy
 * on top: pulled once on boot, and written through on every mutation.
 * ------------------------------------------------------------------------- */

function setSync(patch) {
  commit((doc) => ({ sync: { ...doc.sync, ...patch } }))
}

/** Runs a cloud write in the background, tracking it so the admin can see it. */
function mirror(run) {
  if (!remoteEnabled) return
  setSync({ pendingWrites: ensure().sync.pendingWrites + 1 })
  run().then((result) => {
    const sync = ensure().sync
    setSync({
      pendingWrites: Math.max(0, sync.pendingWrites - 1),
      status: result?.ok ? 'synced' : result?.authRequired ? 'signin-required' : 'error',
      error: result?.ok ? '' : result?.error || 'Cloud write failed',
      lastSyncedAt: result?.ok ? new Date().toISOString() : sync.lastSyncedAt,
    })
  })
}

let pulled = false

/**
 * Pulls the cloud copy and merges it in. Remote wins for rows that exist in
 * both, since another device may have moved a booking along; local-only rows
 * are kept, because they are usually writes that have not been pushed yet.
 */
export async function syncFromCloud({ force = false } = {}) {
  if (!remoteEnabled) return { ok: false, error: 'Supabase not configured' }
  if (pulled && !force) return { ok: true, skipped: true }
  pulled = true
  setSync({ status: 'syncing', error: '' })

  const [result, catalogue] = await Promise.all([pullAll(), pullCatalogue()])
  if (!result.ok && !result.enquiries && !result.bookings) {
    const blocked = result.authRequired || /sign in to the database/i.test((result.errors || []).join(' '))
    setSync({
      status: blocked ? 'signin-required' : 'error',
      error: result.error || (result.errors || []).join('; '),
    })
    return { ok: false, error: result.error }
  }

  const mergeById = (remote, local) => {
    const byId = new Map(remote.map((r) => [r.id, r]))
    local.forEach((l) => {
      if (!byId.has(l.id)) byId.set(l.id, l)
    })
    return [...byId.values()].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  commit((doc) => {
    const next = {}
    if (result.enquiries) next.enquiries = mergeById(result.enquiries, doc.enquiries)
    if (result.bookings) next.bookings = mergeById(result.bookings, doc.bookings)
    // Content is authoritative from the cloud only once it has been saved
    // there; an empty array means "never configured", so keep the local copy.
    for (const field of ['services', 'brands', 'amcPlans', 'reviews']) {
      const rows = result.content?.[field]
      if (Array.isArray(rows) && rows.length) next[field] = rows
    }
    if (Array.isArray(catalogue.products) && catalogue.products.length) {
      next.products = catalogue.products
    }
    if (catalogue.amcPricing) next.amcPricing = { ...doc.amcPricing, ...catalogue.amcPricing }
    // authRequired covers both "asked and was refused" and "did not ask,
    // because there is no session" — the badge should offer the sign-in either
    // way rather than claiming everything is synced.
    const needsSignIn =
      result.authRequired || (result.errors || []).some((e) => /sign in to the database/i.test(e))
    next.sync = {
      ...doc.sync,
      status: needsSignIn ? 'signin-required' : (result.errors || []).length ? 'error' : 'synced',
      error: (result.errors || []).join('; '),
      lastSyncedAt: new Date().toISOString(),
    }
    return next
  })
  return { ok: true }
}

/** Pushes the current site content up, e.g. after an admin edit. */
function mirrorContent(field) {
  mirror(() => pushContent(field, ensure()[field]))
}

function uid(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

/* ── Email notification plumbing ───────────────────────────────────────── */

const CHANNELS = {
  email: {
    statusKey: 'emailStatus',
    errorKey: 'emailError',
    configured: () => emailConfigured,
    // EmailJS tells us whether it actually accepted the message.
    okStatus: 'sent',
    send: (collection, record) =>
      collection === 'enquiries' ? sendEnquiryEmail(record) : sendBookingEmail(record),
  },
  whatsapp: {
    statusKey: 'waStatus',
    errorKey: 'waError',
    configured: () => whatsappConfigured,
    // CallMeBot's response is opaque to the browser — see notify.js.
    okStatus: 'unconfirmed',
    send: (collection, record) =>
      collection === 'enquiries' ? sendEnquiryWhatsApp(record) : sendBookingWhatsApp(record),
  },
}

/**
 * Fires one channel for an already-saved record and writes the result back onto
 * it. Deliberately not awaited by callers: the record is safe in localStorage
 * either way, and the customer should not wait on a third-party request to see
 * their confirmation.
 */
function notifyChannel(collection, record, channelName) {
  const channel = CHANNELS[channelName]
  const patch = (fields) =>
    commit((doc) => ({
      [collection]: doc[collection].map((r) => (r.id === record.id ? { ...r, ...fields } : r)),
    }))

  if (!channel.configured()) {
    patch({ [channel.statusKey]: 'disabled', [channel.errorKey]: '' })
    return
  }
  patch({ [channel.statusKey]: 'sending', [channel.errorKey]: '' })
  channel.send(collection, record).then((result) => {
    patch({
      [channel.statusKey]: result.ok ? channel.okStatus : 'failed',
      [channel.errorKey]: result.ok ? '' : result.error,
    })
  })
}

/** Alerts every channel. One failing never blocks the other. */
function notifyAll(collection, record) {
  Object.keys(CHANNELS).forEach((name) => notifyChannel(collection, record, name))
}

/** Retries a single channel the admin can see has failed. */
export function resendNotification(collection, id, channel = 'email') {
  const record = ensure()[collection].find((r) => r.id === id)
  if (!record) return
  notifyChannel(collection, record, channel)
}

/* ── Enquiries ─────────────────────────────────────────────────────────── */

export function getEnquiries() {
  return ensure().enquiries
}

export function addEnquiry({ name, phone, email = '', service = '', message = '' }) {
  const createdAt = new Date().toISOString()
  const record = {
    id: uid('enq'),
    name: name.trim(),
    phone: phone.trim(),
    email: email.trim(),
    service,
    message: message.trim(),
    status: 'New',
    notes: '',
    createdAt,
    emailStatus: 'sending',
    emailError: '',
    waStatus: 'sending',
    waError: '',
  }
  commit((doc) => ({
    enquiries: [record, ...doc.enquiries],
    analytics: [
      ...doc.analytics,
      { id: uid('evt'), type: 'enquiry', day: createdAt.slice(0, 10), ts: createdAt, service },
    ],
  }))
  mirror(() => pushEnquiry(record))
  notifyAll('enquiries', record)
  return record
}

export function updateEnquiryStatus(id, status) {
  updateEnquiry(id, { status })
}

export function updateEnquiry(id, patch) {
  commit((doc) => ({
    enquiries: doc.enquiries.map((e) => (e.id === id ? { ...e, ...patch, id } : e)),
  }))
  const updated = ensure().enquiries.find((e) => e.id === id)
  if (updated) mirror(() => patchEnquiry(updated))
}

export function deleteEnquiry(id) {
  commit((doc) => ({ enquiries: doc.enquiries.filter((e) => e.id !== id) }))
  mirror(() => removeRow('enquiries', id))
}

/* ── Bookings ──────────────────────────────────────────────────────────── */

export function getBookings() {
  return ensure().bookings
}

export function addBooking({
  name,
  phone,
  brand = '',
  model = '',
  plan = '',
  requestedDate = '',
}) {
  const createdAt = new Date().toISOString()
  const record = {
    id: uid('bkg'),
    name: name.trim(),
    phone: phone.trim(),
    brand,
    model: model.trim(),
    plan,
    requestedDate,
    status: 'Pending',
    technician: '',
    scheduledDate: '',
    notes: '',
    createdAt,
    emailStatus: 'sending',
    emailError: '',
    waStatus: 'sending',
    waError: '',
  }
  commit((doc) => ({
    bookings: [record, ...doc.bookings],
    analytics: [
      ...doc.analytics,
      { id: uid('evt'), type: 'booking', day: createdAt.slice(0, 10), ts: createdAt, service: plan },
    ],
  }))
  mirror(() => pushBooking(record))
  notifyAll('bookings', record)
  return record
}

export function updateBooking(id, patch) {
  commit((doc) => ({
    bookings: doc.bookings.map((b) => (b.id === id ? { ...b, ...patch, id } : b)),
  }))
  const updated = ensure().bookings.find((b) => b.id === id)
  if (updated) mirror(() => patchBooking(updated))
}

export function updateBookingStatus(id, status) {
  updateBooking(id, { status })
}

export function deleteBooking(id) {
  commit((doc) => ({ bookings: doc.bookings.filter((b) => b.id !== id) }))
  mirror(() => removeRow('bookings', id))
}

/* ── Services ──────────────────────────────────────────────────────────── */

export function getServices() {
  return ensure().services
}

export function addService({ name, icon = 'ti-tool', description = '' }) {
  const record = { id: uid('svc'), name, icon, description }
  commit((doc) => ({ services: [...doc.services, record] }))
  mirrorContent('services')
  return record
}

export function updateService(id, patch) {
  commit((doc) => ({
    services: doc.services.map((s) => (s.id === id ? { ...s, ...patch, id } : s)),
  }))
  mirrorContent('services')
}

export function deleteService(id) {
  commit((doc) => ({ services: doc.services.filter((s) => s.id !== id) }))
  mirrorContent('services')
}

/* ── Brands ────────────────────────────────────────────────────────────── */

export function getBrands() {
  return ensure().brands
}

export function addBrand({ name, featured = false }) {
  const record = { id: uid('brd'), name, featured }
  commit((doc) => ({ brands: [...doc.brands, record] }))
  mirrorContent('brands')
  return record
}

export function updateBrand(id, patch) {
  commit((doc) => ({
    brands: doc.brands.map((b) => (b.id === id ? { ...b, ...patch, id } : b)),
  }))
  mirrorContent('brands')
}

export function deleteBrand(id) {
  commit((doc) => ({ brands: doc.brands.filter((b) => b.id !== id) }))
  mirrorContent('brands')
}

/* ── AMC plans ─────────────────────────────────────────────────────────── */

export function getAmcPlans() {
  return ensure().amcPlans
}

export function addAmcPlan({
  title,
  icon = 'ti-file-certificate',
  price = '',
  description = '',
  features = [],
  featured = false,
}) {
  const record = { id: uid('amc'), title, icon, price, description, features, featured }
  commit((doc) => ({ amcPlans: [...doc.amcPlans, record] }))
  mirrorContent('amcPlans')
  return record
}

export function updateAmcPlan(id, patch) {
  commit((doc) => ({
    amcPlans: doc.amcPlans.map((p) => (p.id === id ? { ...p, ...patch, id } : p)),
  }))
  mirrorContent('amcPlans')
}

export function deleteAmcPlan(id) {
  commit((doc) => ({ amcPlans: doc.amcPlans.filter((p) => p.id !== id) }))
  mirrorContent('amcPlans')
}

/* ── Products ──────────────────────────────────────────────────────────── */

export function getProducts() {
  return ensure().products
}

export function addProduct(product) {
  // public.products uses a BIGINT id with no default, so it is assigned here.
  const nextId = ensure().products.reduce((max, p) => Math.max(max, Number(p.id) || 0), 0) + 1
  const record = {
    id: nextId,
    name: product.name,
    brand: product.brand || '',
    capacity: product.capacity || '',
    type: product.type || '',
    price: Number(product.price) || 0,
    description: product.description || '',
    featured: Boolean(product.featured),
    image: product.image || '',
  }
  commit((doc) => ({ products: [...doc.products, record] }))
  mirror(() => pushProduct(record))
  return record
}

export function updateProduct(id, patch) {
  commit((doc) => ({
    products: doc.products.map((p) =>
      p.id === id ? { ...p, ...patch, id, price: Number(patch.price ?? p.price) || 0 } : p,
    ),
  }))
  const updated = ensure().products.find((p) => p.id === id)
  if (updated) mirror(() => pushProduct(updated))
}

export function deleteProduct(id) {
  commit((doc) => ({ products: doc.products.filter((p) => p.id !== id) }))
  mirror(() => removeProduct(id))
}

/* ── Reviews ───────────────────────────────────────────────────────────── */

export function getReviews() {
  return ensure().reviews
}

export function addReview({ name, rating = 5, text = '', source = 'Google' }) {
  const record = {
    id: uid('rev'),
    name: name.trim(),
    rating: Math.min(5, Math.max(1, Number(rating) || 5)),
    text: text.trim(),
    source,
  }
  commit((doc) => ({ reviews: [...doc.reviews, record] }))
  mirrorContent('reviews')
  return record
}

export function updateReview(id, patch) {
  commit((doc) => ({
    reviews: doc.reviews.map((r) => (r.id === id ? { ...r, ...patch, id } : r)),
  }))
  mirrorContent('reviews')
}

export function deleteReview(id) {
  commit((doc) => ({ reviews: doc.reviews.filter((r) => r.id !== id) }))
  mirrorContent('reviews')
}

/* ── AMC pricing (drives the public estimator) ─────────────────────────── */

export function getAmcPricing() {
  return ensure().amcPricing
}

export function updateAmcPricing(patch) {
  commit((doc) => ({ amcPricing: { ...doc.amcPricing, ...patch } }))
  mirror(() => pushPricing(ensure().amcPricing))
}

/** Same formula the sample used, reading admin-configurable rates. */
export function calculateAmcPrice({ capacity, acType, plan }, pricing = getAmcPricing()) {
  let base = pricing.base_1_ton
  if (capacity === '1.5 Ton') base = pricing.base_1_5_ton
  if (capacity === '2.0 Ton') base = pricing.base_2_ton
  if (plan === 'Comprehensive') base *= pricing.comprehensive_multiplier
  if (acType === 'Cassette AC') base += pricing.cassette_surcharge
  return Math.round(base)
}

/* ── Analytics ─────────────────────────────────────────────────────────── */

export function getAnalytics() {
  return ensure().analytics
}

const VISIT_SESSION_KEY = 'vrstore:visit-logged'

/** Counts one visit per browser tab session so a refresh loop cannot inflate it. */
export function recordVisit() {
  try {
    if (sessionStorage.getItem(VISIT_SESSION_KEY)) return
    sessionStorage.setItem(VISIT_SESSION_KEY, '1')
  } catch {
    // sessionStorage unavailable — fall through and log the visit anyway.
  }
  const ts = new Date().toISOString()
  commit((doc) => ({
    analytics: [...doc.analytics, { id: uid('vis'), type: 'visit', day: today(), ts }],
  }))
}

/** Rolls the event log up into `days` daily buckets, oldest first. */
export function getDailySeries(days = 14) {
  const events = ensure().analytics
  const buckets = new Map()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    buckets.set(key, { day: key, label: key.slice(5), visits: 0, enquiries: 0, bookings: 0 })
  }
  events.forEach((e) => {
    const bucket = buckets.get(e.day)
    if (!bucket) return
    if (e.type === 'visit') bucket.visits += 1
    else if (e.type === 'enquiry') bucket.enquiries += 1
    else if (e.type === 'booking') bucket.bookings += 1
  })
  return [...buckets.values()]
}

/** Most-requested service, derived from enquiry `service` and booking `plan`. */
export function getServiceBreakdown() {
  const doc = ensure()
  const counts = new Map()
  const bump = (label) => {
    const key = label && label.trim() ? label.trim() : 'Unspecified'
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  doc.enquiries.forEach((e) => bump(e.service))
  doc.bookings.forEach((b) => bump(b.plan))
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}
