import { useMemo, useState } from 'react'
import { useStore } from '../../data/StoreContext'
import { addProduct, deleteProduct, updateProduct } from '../../data/store'

const CAPACITIES = ['1.0 Ton', '1.5 Ton', '2.0 Ton', '2.5 Ton']
const TYPES = ['Split', 'Window', 'Cassette', 'Multi-Split']

const EMPTY = {
  name: '',
  brand: 'O General',
  capacity: '1.5 Ton',
  type: 'Split',
  price: '',
  description: '',
  featured: false,
  image: '',
}

export default function AdminProducts() {
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
    return products.filter((p) => !q || p.name.toLowerCase().includes(q) || (p.brand || '').toLowerCase().includes(q))
  }, [products, query])

  function startAdd() {
    setEditingId('new')
    setDraft(EMPTY)
    setError('')
  }

  function startEdit(p) {
    setEditingId(p.id)
    setDraft({ ...p, price: String(p.price ?? '') })
    setError('')
  }

  function save(e) {
    e.preventDefault()
    if (!draft.name.trim()) {
      setError('A product needs a name.')
      return
    }
    if (draft.price !== '' && Number.isNaN(Number(draft.price))) {
      setError('Price must be a number.')
      return
    }
    if (editingId === 'new') addProduct(draft)
    else updateProduct(editingId, draft)
    setEditingId(null)
  }

  return (
    <>
      <div className="page-head">
        <h1>Products Catalogue</h1>
        <p>The AC models shown on the public Products page. Changes appear there immediately.</p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>Stocked models</h2>
            <p>{products.length} listed</p>
          </div>
          <button type="button" className="btn btn-primary" onClick={startAdd}>
            <i className="ti ti-plus" /> Add product
          </button>
        </div>

        {editingId && (
          <form className="form-grid" onSubmit={save} style={{ marginBottom: '1.25rem' }}>
            <div className="field full">
              <label htmlFor="pr-name">Model name</label>
              <input id="pr-name" value={draft.name} onChange={set('name')} autoFocus />
            </div>
            <div className="field">
              <label htmlFor="pr-brand">Brand</label>
              <input id="pr-brand" list="pr-brandlist" value={draft.brand} onChange={set('brand')} />
              <datalist id="pr-brandlist">
                {brands.map((b) => (
                  <option key={b.id} value={b.name} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="pr-cap">Capacity</label>
              <input id="pr-cap" list="pr-caplist" value={draft.capacity} onChange={set('capacity')} />
              <datalist id="pr-caplist">
                {CAPACITIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="pr-type">Type</label>
              <input id="pr-type" list="pr-typelist" value={draft.type} onChange={set('type')} />
              <datalist id="pr-typelist">
                {TYPES.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="pr-price">Price (₹)</label>
              <input id="pr-price" inputMode="numeric" value={draft.price} onChange={set('price')} />
            </div>
            <div className="field full">
              <label htmlFor="pr-desc">Description</label>
              <textarea id="pr-desc" rows={2} value={draft.description} onChange={set('description')} />
            </div>
            <div className="field full">
              <label htmlFor="pr-img">Image URL (optional)</label>
              <input
                id="pr-img"
                value={draft.image}
                onChange={set('image')}
                placeholder="Leave blank to show an AC icon instead"
              />
            </div>
            <div className="field">
              <label htmlFor="pr-featured">Highlight</label>
              <span className="field-check">
                <input id="pr-featured" type="checkbox" checked={draft.featured} onChange={set('featured')} />
                Mark as exclusive
              </span>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                <i className="ti ti-check" /> {editingId === 'new' ? 'Add product' : 'Save changes'}
              </button>
              <button className="btn btn-ghost" type="button" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="table-tools">
          <div className="tool-field">
            <label htmlFor="pr-search">Search name or brand</label>
            <input id="pr-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="item-list">
          {rows.length === 0 && <p className="empty-row">No products match.</p>}
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
                <p>
                  {[p.brand, p.capacity, p.type].filter(Boolean).join(' · ')} — ₹
                  {Number(p.price).toLocaleString('en-IN')}
                </p>
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
