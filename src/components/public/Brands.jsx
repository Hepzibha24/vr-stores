import { useBrands } from '../../data/StoreContext'
import './Brands.css'

export default function Brands() {
  const brands = useBrands()

  return (
    <section className="section bg-gray" id="brands">
      <div className="container">
        <div className="eyebrow">Multi-Brand Service</div>
        <h2 className="section-heading">Brands We Service</h2>
        <p className="section-sub">
          We service all major AC brands, with special expertise in O General as an exclusive
          authorised dealer.
        </p>
        <div className="brands-row">
          {brands.map((b) => (
            <span className={`brand-chip${b.featured ? ' featured-brand' : ''}`} key={b.id}>
              {b.featured ? '⭐ ' : ''}
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
