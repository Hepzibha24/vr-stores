import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../data/StoreContext'

const ALL = 'All'

export default function ProductsPage() {
  const { products } = useStore()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState(ALL)
  const [capacity, setCapacity] = useState(ALL)
  const [type, setType] = useState(ALL)

  const options = useMemo(
    () => ({
      brands: [ALL, ...new Set(products.map((p) => p.brand).filter(Boolean))],
      capacities: [ALL, ...new Set(products.map((p) => p.capacity).filter(Boolean))],
      types: [ALL, ...new Set(products.map((p) => p.type).filter(Boolean))],
    }),
    [products],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter(
      (p) =>
        (!q ||
          p.name.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)) &&
        (brand === ALL || p.brand === brand) &&
        (capacity === ALL || p.capacity === capacity) &&
        (type === ALL || p.type === type),
    )
  }, [products, search, brand, capacity, type])

  const requestQuote = (product) =>
    navigate('/book', {
      state: {
        service: 'AC Sales',
        product: `${product.brand} ${product.name}`,
        message: `Enquiry for a quote on ${product.name} (${product.capacity}).`,
      },
    })

  return (
    <div className="container">
      <div className="page-hero">
        <div className="eyebrow">Showroom Stock</div>
        <h1>Air Conditioner Catalogue</h1>
        <p>
          Models we stock and supply. Prices are indicative — ask for a quote and we will confirm
          the current rate, including installation.
        </p>
      </div>

      <div className="filters">
        <div className="f">
          <label htmlFor="pf-search">Search</label>
          <input
            id="pf-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Model or keyword"
          />
        </div>
        <div className="f">
          <label htmlFor="pf-brand">Brand</label>
          <select id="pf-brand" value={brand} onChange={(e) => setBrand(e.target.value)}>
            {options.brands.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label htmlFor="pf-cap">Capacity</label>
          <select id="pf-cap" value={capacity} onChange={(e) => setCapacity(e.target.value)}>
            {options.capacities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label htmlFor="pf-type">Type</label>
          <select id="pf-type" value={type} onChange={(e) => setType(e.target.value)}>
            {options.types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="count">
          {filtered.length} of {products.length}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-search-off" />
          <h3>No products match your filters</h3>
          <p>Try clearing the search or choosing a different brand.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <article className="product-card" key={p.id}>
              {p.featured && <span className="badge-featured">EXCLUSIVE</span>}
              <div className="product-media">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <i className="ti ti-air-conditioning" />
                )}
              </div>
              <div className="product-body">
                <div className="tag-row">
                  {p.brand && <span className="p-brand">{p.brand}</span>}
                  {p.capacity && <span className="p-tag">{p.capacity}</span>}
                  {p.type && <span className="p-tag">{p.type}</span>}
                </div>
                <h3>{p.name}</h3>
                <p className="desc">{p.description}</p>
                <div className="price-row">
                  <div className="price">
                    ₹{Number(p.price).toLocaleString('en-IN')}
                    <small>indicative</small>
                  </div>
                  <button type="button" className="pbtn pbtn-red" onClick={() => requestQuote(p)}>
                    <i className="ti ti-message-2" /> Get Quote
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
