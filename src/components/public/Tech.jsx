import { asset } from '../../lib/asset'
import './Tech.css'

const POINTS = [
  'O General certified service engineers',
  'Fully equipped with latest tools',
  'On-time, courteous service',
  'Post-service follow-up & warranty',
]

export default function Tech() {
  return (
    <section className="section bg-gray">
      <div className="container" data-reveal>
        <div className="tech-section">
          <div className="tech-img">
            <img src={asset('technician.jpg')} alt="VR Store technician servicing an air conditioner" />
            <div className="tech-img-overlay" />
          </div>
          <div className="tech-content">
            <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Our Experts
            </div>
            <h3>
              Expert Technicians
              <br />
              At Your Door
            </h3>
            <p className="tech-lede">
              Our trained and certified team handles all AC needs quickly, safely and professionally
              — at homes and offices across Urapakkam.
            </p>
            <ul className="tech-list">
              {POINTS.map((p) => (
                <li key={p}>
                  <i className="ti ti-circle-check" /> {p}
                </li>
              ))}
            </ul>
            <a className="tech-cta" href="tel:9940291467">
              <i className="ti ti-phone" style={{ fontSize: 18 }} /> Book a Technician
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
