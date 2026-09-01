import { useNavigate } from 'react-router-dom'
import { useServices } from '../../data/StoreContext'

const DETAIL = {
  'AC Sales': 'Explore O General split, window and cassette models for homes or corporate spaces.',
  'AC Repair': 'Fast diagnosis, fan motor replacement, circuit fixing and coil leak patching.',
  Installation: 'Copper piping work, outdoor stand mounting, unit balancing and commissioning.',
  'Deep Cleaning': 'High-pressure jet wash of outdoor and indoor coils, filters and drain lines.',
  Maintenance: 'Scheduled quarterly checks covering gas pressure, current draw and efficiency.',
  'AC AMC': 'Worry-free annual contracts covering priority visits and spare parts support.',
}

const STEPS = [
  { num: '01', title: 'Submit Enquiry', desc: 'Fill the callback form or call the Urapakkam desk.' },
  { num: '02', title: 'Call Confirmation', desc: 'Our coordinator calls to confirm slot timings.' },
  { num: '03', title: 'Technician Visit', desc: 'Certified engineers arrive and carry out the work.' },
  { num: '04', title: 'Billing & Warranty', desc: 'You get an authentic invoice and post-service warranty.' },
]

const FEATURES = [
  { icon: 'ti-clock', title: 'Same-Day Service', sub: 'Response within hours' },
  { icon: 'ti-users', title: 'Certified Team', sub: 'Trained professionals' },
  { icon: 'ti-discount', title: 'Genuine Spares', sub: 'Original parts only' },
  { icon: 'ti-currency-rupee', title: 'Transparent Price', sub: 'No hidden charges' },
]

export default function ServicesPage() {
  const services = useServices()
  const navigate = useNavigate()

  const book = (service) => navigate('/book', { state: { service } })

  return (
    <div className="container">
      <div className="page-hero">
        <div className="eyebrow">Our Specialities</div>
        <h1>Showroom Services &amp; Support</h1>
        <p>
          Reliable installation, maintenance and support across Urapakkam and the neighbouring
          regions.
        </p>
      </div>

      <div className="services-grid" style={{ marginTop: 0 }}>
        {services.map((s) => (
          <div
            className="service-card"
            key={s.id}
            role="button"
            tabIndex={0}
            style={{ cursor: 'pointer' }}
            onClick={() => book(s.name)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                book(s.name)
              }
            }}
          >
            <div className="service-icon">
              <i className={`ti ${s.icon}`} />
            </div>
            <h3>{s.name}</h3>
            <p>{DETAIL[s.name] || s.description}</p>
          </div>
        ))}
      </div>

      <div className="section-gap">
        <div className="page-hero">
          <div className="eyebrow">Work Flow</div>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 34px)' }}>How Our Service Works</h1>
          <p>A simple, structured process for hassle-free booking and reliable execution.</p>
        </div>
        <div className="steps">
          {STEPS.map((s) => (
            <div className="step" key={s.num}>
              <div className="num">{s.num}</div>
              <h4>{s.title}</h4>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="feature-strip section-gap">
        {FEATURES.map((f) => (
          <div className="feature-item" key={f.title}>
            <i className={`ti ${f.icon}`} />
            <h4>{f.title}</h4>
            <p>{f.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
