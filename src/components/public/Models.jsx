import { useStore } from '../../data/StoreContext'
import './Models.css'

const WHATSAPP = '919940291467'

/**
 * The models on the shop floor.
 *
 * Deliberately no prices: AC pricing moves with stock, offers and installation,
 * and a stale number on a website is worse than none — it either loses the sale
 * or has to be walked back on the phone. Each card opens WhatsApp with the
 * model already named, which is the conversation the shop wants anyway.
 */
export default function Models() {
  const { products } = useStore()

  if (!products.length) return null

  // Featured first, otherwise the order the shop entered them in.
  const ordered = [...products].sort((a, b) => Number(b.featured) - Number(a.featured))

  const enquire = (p) => {
    const text = `Hi VR Store, I would like to know more about the ${p.name}${
      p.capacity ? ` (${p.capacity})` : ''
    }. Could you share the price and availability?`
    return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
  }

  return (
    <section className="section" id="models">
      <div className="container" data-reveal>
        <div className="eyebrow">On Our Floor</div>
        <h2 className="section-heading">Air Conditioners We Stock</h2>
        <p className="section-sub">
          Split, window and cassette units across all major brands. Message us about any model and
          we will confirm the current price, stock and installation timing.
        </p>

        <div className="models-grid">
          {ordered.map((p) => (
            <article className="model-card" key={p.id}>
              {p.featured && <span className="model-badge">Exclusive</span>}

              <div className="model-media">
                {p.image ? (
                  <img src={p.image} alt={p.name} loading="lazy" />
                ) : (
                  <i className="ti ti-air-conditioning" aria-hidden="true" />
                )}
              </div>

              <div className="model-body">
                <h3>{p.name}</h3>
                <div className="model-tags">
                  {p.brand && <span className="model-brand">{p.brand}</span>}
                  {p.capacity && <span className="model-tag">{p.capacity}</span>}
                  {p.type && <span className="model-tag">{p.type}</span>}
                </div>
                {p.description && <p className="model-desc">{p.description}</p>}

                <a
                  className="model-cta"
                  href={enquire(p)}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Enquire about ${p.name} on WhatsApp`}
                >
                  <i className="ti ti-brand-whatsapp" /> Enquire on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
