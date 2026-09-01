import { useState } from 'react'
import { useAmcPlans, useBrands, useReviews, useServices } from '../../data/StoreContext'
import {
  addAmcPlan,
  addReview,
  deleteReview,
  updateReview,
  addBrand,
  addService,
  deleteAmcPlan,
  deleteBrand,
  deleteService,
  resetToSeed,
  updateAmcPlan,
  updateBrand,
  updateService,
} from '../../data/store'

const TABS = [
  { key: 'services', label: 'Services' },
  { key: 'brands', label: 'Brands' },
  { key: 'amc', label: 'AMC Plans' },
  { key: 'reviews', label: 'Reviews' },
]

// A short menu of Tabler icons that suit an AC showroom, so the admin does not
// have to know class names by heart. Any `ti-*` name can still be typed in.
const ICON_CHOICES = [
  'ti-building-store',
  'ti-tool',
  'ti-settings',
  'ti-droplet',
  'ti-calendar-check',
  'ti-calendar-repeat',
  'ti-file-certificate',
  'ti-rosette',
  'ti-home',
  'ti-snowflake',
  'ti-air-conditioning',
  'ti-wind',
  'ti-shield-check',
  'ti-clock',
]

export default function AdminContent() {
  const [tab, setTab] = useState('services')

  return (
    <>
      <div className="page-head">
        <h1>Site Content</h1>
        <p>Edits here appear on the public site immediately — both read the same data.</p>
      </div>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`tab${tab === t.key ? ' active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'services' && <ServicesPanel />}
      {tab === 'brands' && <BrandsPanel />}
      {tab === 'amc' && <AmcPanel />}
      {tab === 'reviews' && <ReviewsPanel />}

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Reset content</h2>
            <p>
              Restores services, brands, AMC cards and the demo enquiries/bookings to their original
              seeded values. This cannot be undone.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              if (window.confirm('Reset ALL stored data back to the original seed content?')) {
                resetToSeed()
              }
            }}
          >
            <i className="ti ti-refresh" /> Reset to defaults
          </button>
        </div>
      </div>
    </>
  )
}

function IconField({ id, value, onChange }) {
  return (
    <div className="field">
      <label htmlFor={id}>Icon (Tabler class)</label>
      <input id={id} list={`${id}-list`} value={value} onChange={onChange} placeholder="ti-tool" />
      <datalist id={`${id}-list`}>
        {ICON_CHOICES.map((i) => (
          <option key={i} value={i} />
        ))}
      </datalist>
    </div>
  )
}

/* ── Services ──────────────────────────────────────────────────────────── */

const EMPTY_SERVICE = { name: '', icon: 'ti-tool', description: '' }

function ServicesPanel() {
  const services = useServices()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_SERVICE)
  const [error, setError] = useState('')

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_SERVICE)
    setError('')
  }

  function startEdit(s) {
    setEditingId(s.id)
    setDraft({ name: s.name, icon: s.icon, description: s.description })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('A service needs a name.')
      return
    }
    if (editingId === 'new') addService(draft)
    else updateService(editingId, draft)
    setEditingId(null)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Services</h2>
          <p>Shown in the “Complete AC Solutions” grid and the footer list.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <i className="ti ti-plus" /> Add service
        </button>
      </div>

      {editingId && (
        <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
          <div className="field">
            <label htmlFor="svc-name">Name</label>
            <input id="svc-name" value={draft.name} onChange={set('name')} autoFocus />
          </div>
          <IconField id="svc-icon" value={draft.icon} onChange={set('icon')} />
          <div className="field full">
            <label htmlFor="svc-desc">Description</label>
            <textarea id="svc-desc" rows={2} value={draft.description} onChange={set('description')} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <i className="ti ti-check" /> {editingId === 'new' ? 'Add service' : 'Save changes'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="item-list">
        {services.length === 0 && <p className="empty-row">No services listed yet.</p>}
        {services.map((s) => (
          <div className="item-row" key={s.id}>
            <div className="item-icon">
              <i className={`ti ${s.icon}`} />
            </div>
            <div className="item-body">
              <h3>{s.name}</h3>
              <p>{s.description}</p>
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(s)}>
                <i className="ti ti-pencil" /> Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => window.confirm(`Delete “${s.name}”?`) && deleteService(s.id)}
              >
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Brands ────────────────────────────────────────────────────────────── */

const EMPTY_BRAND = { name: '', featured: false }

function BrandsPanel() {
  const brands = useBrands()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_BRAND)
  const [error, setError] = useState('')

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_BRAND)
    setError('')
  }

  function startEdit(b) {
    setEditingId(b.id)
    setDraft({ name: b.name, featured: b.featured })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('A brand needs a name.')
      return
    }
    if (editingId === 'new') addBrand(draft)
    else updateBrand(editingId, draft)
    setEditingId(null)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Brands</h2>
          <p>Featured brands get the red O General-style highlight chip.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <i className="ti ti-plus" /> Add brand
        </button>
      </div>

      {editingId && (
        <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
          <div className="field">
            <label htmlFor="brd-name">Brand name</label>
            <input
              id="brd-name"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="brd-featured">Highlight</label>
            <span className="field-check">
              <input
                id="brd-featured"
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              />
              Feature this brand
            </span>
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <i className="ti ti-check" /> {editingId === 'new' ? 'Add brand' : 'Save changes'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="item-list">
        {brands.length === 0 && <p className="empty-row">No brands listed yet.</p>}
        {brands.map((b) => (
          <div className="item-row" key={b.id}>
            <div className="item-icon">
              <i className="ti ti-award" />
            </div>
            <div className="item-body">
              <h3>
                {b.name}
                {b.featured && <span className="tag-featured">Featured</span>}
              </h3>
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(b)}>
                <i className="ti ti-pencil" /> Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => window.confirm(`Delete “${b.name}”?`) && deleteBrand(b.id)}
              >
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── AMC plans ─────────────────────────────────────────────────────────── */

const EMPTY_PLAN = {
  title: '',
  icon: 'ti-file-certificate',
  price: '',
  description: '',
  featuresText: '',
  featured: false,
}

function AmcPanel() {
  const plans = useAmcPlans()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_PLAN)
  const [error, setError] = useState('')

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_PLAN)
    setError('')
  }

  function startEdit(p) {
    setEditingId(p.id)
    setDraft({
      title: p.title,
      icon: p.icon,
      price: p.price || '',
      description: p.description,
      featuresText: (p.features || []).join('\n'),
      featured: p.featured,
    })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.title.trim()) {
      setError('An AMC card needs a title.')
      return
    }
    const payload = {
      title: draft.title,
      icon: draft.icon,
      price: draft.price,
      description: draft.description,
      featured: draft.featured,
      features: draft.featuresText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    }
    if (editingId === 'new') addAmcPlan(payload)
    else updateAmcPlan(editingId, payload)
    setEditingId(null)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>AMC plan cards</h2>
          <p>The four cards under “AMC — What&apos;s Included” on the public site.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <i className="ti ti-plus" /> Add card
        </button>
      </div>

      {editingId && (
        <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
          <div className="field">
            <label htmlFor="amc-title">Title</label>
            <input id="amc-title" value={draft.title} onChange={set('title')} autoFocus />
          </div>
          <IconField id="amc-icon" value={draft.icon} onChange={set('icon')} />
          <div className="field">
            <label htmlFor="amc-price">Price (optional)</label>
            <input id="amc-price" value={draft.price} onChange={set('price')} placeholder="₹3,500 / year" />
          </div>
          <div className="field">
            <label htmlFor="amc-featured">Highlight</label>
            <span className="field-check">
              <input
                id="amc-featured"
                type="checkbox"
                checked={draft.featured}
                onChange={(e) => setDraft((d) => ({ ...d, featured: e.target.checked }))}
              />
              Red featured card
            </span>
          </div>
          <div className="field full">
            <label htmlFor="amc-desc">Description</label>
            <textarea id="amc-desc" rows={2} value={draft.description} onChange={set('description')} />
          </div>
          <div className="field full">
            <label htmlFor="amc-feats">Feature bullets — one per line</label>
            <textarea
              id="amc-feats"
              rows={4}
              value={draft.featuresText}
              onChange={set('featuresText')}
              placeholder={'Two visits a year\nGas top-up included'}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <i className="ti ti-check" /> {editingId === 'new' ? 'Add card' : 'Save changes'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="item-list">
        {plans.length === 0 && <p className="empty-row">No AMC cards yet.</p>}
        {plans.map((p) => (
          <div className="item-row" key={p.id}>
            <div className="item-icon">
              <i className={`ti ${p.icon}`} />
            </div>
            <div className="item-body">
              <h3>
                {p.title}
                {p.featured && <span className="tag-featured">Featured</span>}
              </h3>
              <p>
                {p.price ? `${p.price} — ` : ''}
                {p.description}
                {p.features?.length ? ` · ${p.features.length} bullet(s)` : ''}
              </p>
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(p)}>
                <i className="ti ti-pencil" /> Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => window.confirm(`Delete “${p.title}”?`) && deleteAmcPlan(p.id)}
              >
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Reviews ───────────────────────────────────────────────────────────── */

const EMPTY_REVIEW = { name: '', rating: '5', text: '', source: 'Google' }

function ReviewsPanel() {
  const reviews = useReviews()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY_REVIEW)
  const [error, setError] = useState('')

  const set = (field) => (e) => setDraft((d) => ({ ...d, [field]: e.target.value }))

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY_REVIEW)
    setError('')
  }

  function startEdit(r) {
    setEditingId(r.id)
    setDraft({ name: r.name, rating: String(r.rating), text: r.text, source: r.source || 'Google' })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('Enter the reviewer’s name.')
      return
    }
    if (!draft.text.trim()) {
      setError('Enter what they said.')
      return
    }
    if (editingId === 'new') addReview(draft)
    else updateReview(editingId, { ...draft, rating: Number(draft.rating) })
    setEditingId(null)
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <div>
          <h2>Customer reviews</h2>
          <p>
            Shown on the home page. The section stays hidden until there is at least one, so an
            empty list simply means no reviews block appears.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startAdd}>
          <i className="ti ti-plus" /> Add review
        </button>
      </div>

      {reviews.length === 0 && !editingId && (
        <div className="notice">
          <i className="ti ti-quote" />
          <div>
            <strong>No reviews yet</strong>
            <p>
              Copy real ones across from your Google Business Profile rather than writing them
              yourself — these are quotes attributed to named customers, and invented ones would
              mislead the people reading them.
            </p>
          </div>
        </div>
      )}

      {editingId && (
        <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
          <div className="field">
            <label htmlFor="rv-name">Customer name</label>
            <input id="rv-name" value={draft.name} onChange={set('name')} autoFocus />
          </div>
          <div className="field">
            <label htmlFor="rv-rating">Rating</label>
            <select id="rv-rating" value={draft.rating} onChange={set('rating')}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n === 1 ? '' : 's'}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rv-source">Source</label>
            <input id="rv-source" value={draft.source} onChange={set('source')} placeholder="Google" />
          </div>
          <div className="field full">
            <label htmlFor="rv-text">What they said</label>
            <textarea id="rv-text" rows={3} value={draft.text} onChange={set('text')} />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <i className="ti ti-check" /> {editingId === 'new' ? 'Add review' : 'Save changes'}
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="item-list">
        {reviews.map((r) => (
          <div className="item-row" key={r.id}>
            <div className="item-icon">
              <i className="ti ti-quote" />
            </div>
            <div className="item-body">
              <h3>
                {r.name}
                <span className="tag-featured">{r.rating}★</span>
              </h3>
              <p>{r.text}</p>
            </div>
            <div className="item-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(r)}>
                <i className="ti ti-pencil" /> Edit
              </button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => window.confirm(`Delete the review from ${r.name}?`) && deleteReview(r.id)}
              >
                <i className="ti ti-trash" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
