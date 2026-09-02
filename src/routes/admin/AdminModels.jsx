import { useMemo, useState } from 'react'
import { useStore } from '../../data/StoreContext'
import { addProduct, deleteProduct, updateProduct } from '../../data/store'

const CAPACITIES = ['1.0 Ton', '1.5 Ton', '2.0 Ton', '2.5 Ton']
const TYPES = ['Split', 'Window', 'Cassette', 'Multi-Split']

// No price field: the public cards do not show one, and a number kept here but
// never displayed only goes stale and misleads whoever reads it next.
const EMPTY = {
  name: '',
  brand: 'O General',
  capacity: '1.5 Ton',
  type: 'Split',
  description: '',
  featured: false,
  image: '',
}

export default function AdminModels() {
  const { products, brands } = useStore()
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState(EMPTY)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  const set = (field) => (e) =>
    setDraft((d) => ({
      ...d,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter(
      (p) => !q || p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q),
    )
  }, [products, query])

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY)
    setError('')
  }

  function startEdit(p) {
    setEditingId(p.id)
    setDraft({
      name: p.name,
      brand: p.brand,
      capacity: p.capacity,
      type: p.type,
      description: p.description,
      featured: p.featured,
      image: p.image || '',
    })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('A model needs a name.')
      return
    }
    if (editingId === 'new') addProduct(draft)
    else updateProduct(editingId, draft)
    setEditingId(null)
  }

  return (
    <>
      <div className="page-head">
        <h1>AC Models</h1>
        <p>
          Shown on the home page under “Air Conditioners We Stock”. Each card opens WhatsApp with
          the model named, so customers ask about a specific unit.
        </p>
      </div>

      <div className="notice">
        <i className="ti ti-info-circle" />
        <div>
          <strong>No prices here, by design</strong>
          <p>
            AC pricing moves with stock, offers and installation. A stale figure on the site either
            loses the sale or has to be walked back on the call, so the cards send people to
            WhatsApp for a current quote instead.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Models on the floor</h2>
            <p>{products.length} listed</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={startAdd}>
            <i className="ti ti-plus" /> Add model
          </button>
        </div>

        {editingId && (
          <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
            <div className="field full">
              <label htmlFor="md-name">Model name</label>
              <input id="md-name" value={draft.name} onChange={set('name')} autoFocus />
            </div>
            <div className="field">
              <label htmlFor="md-brand">Brand</label>
              <input id="md-brand" list="md-brandlist" value={draft.brand} onChange={set('brand')} />
              <datalist id="md-brandlist">
                {brands.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="md-cap">Capacity</label>
              <input id="md-cap" list="md-caplist" value={draft.capacity} onChange={set('capacity')} />
              <datalist id="md-caplist">
                {CAPACITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="md-type">Type</label>
              <input id="md-type" list="md-typelist" value={draft.type} onChange={set('type')} />
              <datalist id="md-typelist">
                {TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="md-featured">Highlight</label>
              <span className="field-check">
                <input
                  id="md-featured"
                  type="checkbox"
                  checked={draft.featured}
                  onChange={set('featured')}
                />
                Mark as exclusive
              </span>
            </div>
            <div className="field full">
              <label htmlFor="md-desc">Short description</label>
              <textarea id="md-desc" rows={2} value={draft.description} onChange={set('description')} />
            </div>
            <div className="field full">
              <label htmlFor="md-img">Photo URL (optional)</label>
              <input
                id="md-img"
                value={draft.image}
                onChange={set('image')}
                placeholder="Leave blank to show an AC icon instead"
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                <i className="ti ti-check" /> {editingId === 'new' ? 'Add model' : 'Save changes'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="table-tools">
          <div className="tool-field">
            <label htmlFor="md-search">Search name or brand</label>
            <input
              id="md-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="item-list">
          {rows.length === 0 && <p className="empty-row">No models match.</p>}
          {rows.map((p) => (
            <div className="item-row" key={p.id}>
              <div className="item-icon">
                <i className="ti ti-air-conditioning" />
              </div>
              <div className="item-body">
                <h3>
                  {p.name}
                  {p.featured && <span className="tag-featured">Exclusive</span>}
                </h3>
                <p>{[p.brand, p.capacity, p.type].filter(Boolean).join(' · ')}</p>
              </div>
              <div className="item-actions">
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => startEdit(p)}>
                  <i className="ti ti-pencil" /> Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  type="button"
                  onClick={() => window.confirm(`Delete “${p.name}”?`) && deleteProduct(p.id)}
                >
                  <i className="ti ti-trash" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
