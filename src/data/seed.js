// Seed content lifted directly from the original vr_store_premium HTML so the
// public site renders identical copy before the admin edits anything.

export const SEED_SERVICES = [
  { id: 'svc-sales', name: 'AC Sales', icon: 'ti-building-store', description: 'Split, Window & Cassette ACs — all capacities & models' },
  { id: 'svc-repair', name: 'AC Repair', icon: 'ti-tool', description: 'Fast diagnosis and repair of all AC faults same day' },
  { id: 'svc-install', name: 'Installation', icon: 'ti-settings', description: 'Expert fitting and commissioning by certified technicians' },
  { id: 'svc-clean', name: 'Deep Cleaning', icon: 'ti-droplet', description: 'Coil wash, filter clean, drain flush & gas refill' },
  { id: 'svc-maint', name: 'Maintenance', icon: 'ti-calendar-check', description: 'Scheduled servicing to keep your AC at peak performance' },
  { id: 'svc-amc', name: 'AC AMC', icon: 'ti-file-certificate', description: 'Annual Maintenance Contracts for homes & businesses' },
]

export const SEED_BRANDS = [
  { id: 'brd-ogeneral', name: 'O General', featured: true },
  { id: 'brd-daikin', name: 'Daikin', featured: false },
  { id: 'brd-voltas', name: 'Voltas', featured: false },
  { id: 'brd-lg', name: 'LG', featured: false },
  { id: 'brd-samsung', name: 'Samsung', featured: false },
  { id: 'brd-hitachi', name: 'Hitachi', featured: false },
  { id: 'brd-bluestar', name: 'Blue Star', featured: false },
  { id: 'brd-carrier', name: 'Carrier', featured: false },
  { id: 'brd-whirlpool', name: 'Whirlpool', featured: false },
]

export const SEED_AMC_PLANS = [
  {
    id: 'amc-visits',
    title: '2 Service Visits',
    icon: 'ti-calendar-repeat',
    price: '',
    description: 'Scheduled preventive maintenance visits every 6 months to keep your AC running at its best.',
    features: [],
    featured: false,
  },
  {
    id: 'amc-priority',
    title: 'Priority Support',
    icon: 'ti-rosette',
    price: '',
    description: 'Jump the queue — AMC customers get same-day emergency breakdown support, any day.',
    features: [],
    featured: true,
  },
  {
    id: 'amc-gas',
    title: 'Gas & Filter Check',
    icon: 'ti-droplet',
    price: '',
    description: 'Gas pressure inspection, filter cleaning, coil wash and top-up if needed — all covered.',
    features: [],
    featured: false,
  },
  {
    id: 'amc-home',
    title: 'Home & Commercial',
    icon: 'ti-home',
    price: '',
    description: 'Available for residential apartments, villas, shops, offices and commercial buildings.',
    features: [],
    featured: false,
  },
]

// A handful of demo records so the dashboard and tables are not empty on a
// fresh install. Clear them from Admin once real enquiries start arriving.
function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function dayKey(n) {
  return daysAgo(n).slice(0, 10)
}

function daysAhead(n) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export const SEED_ENQUIRIES = [
  { id: 'enq-1', name: 'Ramesh Kumar', phone: '9876543210', email: '', service: 'AC Sales', message: 'Looking for a 1.5 ton O General split AC for a bedroom. What is the best price?', status: 'New', createdAt: daysAgo(1), notes: '' },
  { id: 'enq-2', name: 'Priya Nandhini', phone: '9840112233', email: 'priya.n@example.com', service: 'Deep Cleaning', message: 'Need deep cleaning for two split ACs at Rohini Nagar. Weekend preferred.', status: 'Contacted', createdAt: daysAgo(4), notes: 'Quoted Rs. 1200 for both. Awaiting confirmation.' },
  { id: 'enq-3', name: 'Suresh Babu', phone: '9500098765', email: '', service: 'AC Repair', message: 'AC not cooling, making a rattling noise. Urgent.', status: 'Closed', createdAt: daysAgo(11), notes: 'Capacitor replaced on site.' },
]

export const SEED_BOOKINGS = [
  { id: 'bkg-1', name: 'Anitha Raj', phone: '9791234567', brand: 'O General', model: 'ASGA18FUTA', plan: 'AMC — Comprehensive', requestedDate: daysAhead(3), status: 'Pending', technician: '', scheduledDate: '', notes: '', createdAt: daysAgo(2) },
  { id: 'bkg-2', name: 'Karthik S', phone: '9962345671', brand: 'Daikin', model: 'FTKF35', plan: 'Service Request', requestedDate: daysAhead(1), status: 'Scheduled', technician: 'Murugan', scheduledDate: daysAhead(1), notes: 'Second floor, carry ladder.', createdAt: daysAgo(6) },
  { id: 'bkg-3', name: 'Fathima Beevi', phone: '9080012345', brand: 'Voltas', model: '183V Vectra', plan: 'AMC — Basic', requestedDate: daysAgo(21).slice(0, 10), status: 'Completed', technician: 'Vignesh', scheduledDate: daysAgo(19).slice(0, 10), notes: 'Gas topped up, filters washed.', createdAt: daysAgo(22) },
]

// Event log backing the analytics view. Types: 'visit' | 'enquiry' | 'booking'.
// The seed sprinkles a month of plausible traffic so the charts have shape on a
// first run; real visits are appended by the public site on load.
export const SEED_ANALYTICS = (() => {
  const events = []
  const baseline = [12, 9, 14, 18, 11, 22, 7, 15, 19, 13, 10, 24, 16, 12, 8, 20, 17, 11, 14, 9, 21, 13, 18, 10, 15, 12, 23, 16, 11, 19]
  baseline.forEach((count, idx) => {
    const day = dayKey(29 - idx)
    for (let i = 0; i < count; i++) {
      events.push({ id: `vis-${idx}-${i}`, type: 'visit', day, ts: `${day}T09:00:00.000Z` })
    }
  })
  SEED_ENQUIRIES.forEach((e) => {
    events.push({ id: `evt-${e.id}`, type: 'enquiry', day: e.createdAt.slice(0, 10), ts: e.createdAt, service: e.service })
  })
  SEED_BOOKINGS.forEach((b) => {
    events.push({ id: `evt-${b.id}`, type: 'booking', day: b.createdAt.slice(0, 10), ts: b.createdAt, service: b.plan })
  })
  return events
})()

// ── Products catalogue (Admin → Products) ────────────────────────────────
// The sample shipped an empty catalogue; these give the page something real to
// show before the shop adds its own. Prices are indicative, not quotes.
export const SEED_PRODUCTS = [
  { id: 1, name: 'O General ASGA18FUTA Split AC', brand: 'O General', capacity: '1.5 Ton', type: 'Split', price: 52990, description: 'Tropicalised rotary compressor, 5 star inverter, copper condenser. Built for Chennai summers.', featured: true, image: '' },
  { id: 2, name: 'O General ASGA12FUTA Split AC', brand: 'O General', capacity: '1.0 Ton', type: 'Split', price: 41990, description: 'Compact 1 ton inverter split for bedrooms and small cabins.', featured: true, image: '' },
  { id: 3, name: 'O General AUGA24FUAS Cassette AC', brand: 'O General', capacity: '2.0 Ton', type: 'Cassette', price: 86990, description: 'Four-way ceiling cassette for shops, clinics and offices.', featured: false, image: '' },
  { id: 4, name: 'Daikin FTKF35 Split AC', brand: 'Daikin', capacity: '1.0 Ton', type: 'Split', price: 38990, description: 'Inverter split with PM 2.5 filter and coanda airflow.', featured: false, image: '' },
  { id: 5, name: 'Voltas 183V Vectra Split AC', brand: 'Voltas', capacity: '1.5 Ton', type: 'Split', price: 34990, description: 'Value 5 star inverter with turbo cooling mode.', featured: false, image: '' },
  { id: 6, name: 'Hitachi Kashikoi 5100X', brand: 'Hitachi', capacity: '1.5 Ton', type: 'Split', price: 46990, description: 'Expandable inverter with self-cleaning front panel.', featured: false, image: '' },
]

// ── AMC pricing, driving the public estimator (Admin → AMC Pricing) ──────
export const SEED_AMC_PRICING = {
  base_1_ton: 1999,
  base_1_5_ton: 2499,
  base_2_ton: 2999,
  cassette_surcharge: 500,
  comprehensive_multiplier: 2,
}

// ── Customer reviews (Admin → Site Content → Reviews) ────────────────────
// Deliberately empty. These are testimonials attributed to real named people,
// so inventing them would put words in customers' mouths on a live business
// site. Paste the genuine ones from the Google Business Profile instead; the
// public section stays hidden until at least one exists.
export const SEED_REVIEWS = []
