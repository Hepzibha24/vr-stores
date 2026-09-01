import { useServices } from '../../data/StoreContext'
import './Services.css'

const FEATURES = [
  { icon: 'ti-clock', title: 'Same-Day Service', sub: 'Response within hours' },
  { icon: 'ti-users', title: 'Certified Team', sub: 'Trained professionals' },
  { icon: 'ti-discount', title: 'Genuine Parts', sub: 'Original spares only' },
  { icon: 'ti-currency-rupee', title: 'Transparent Pricing', sub: 'No hidden charges' },
]

export default function Services() {
  const services = useServices()

  return (
    <section className="section" id="services">
      <div className="container">
        <div className="eyebrow">What We Do</div>
        <h2 className="section-heading">Complete AC Solutions</h2>
        <p className="section-sub">
          From new AC purchases to annual maintenance — we handle everything with certified
          professionals.
        </p>

        <div className="services-grid">
          {services.map((s) => (
            <div className="service-card" key={s.id}>
              <div className="service-icon">
                <i className={`ti ${s.icon}`} />
              </div>
              <h3>{s.name}</h3>
              <p>{s.description}</p>
            </div>
          ))}
        </div>

        <div className="feature-strip">
          {FEATURES.map((f) => (
            <div className="feature-item" key={f.title}>
              <i className={`ti ${f.icon}`} />
              <h4>{f.title}</h4>
              <p>{f.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
