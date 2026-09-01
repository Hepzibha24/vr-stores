import { asset } from '../../lib/asset'

const ENGINEERS = [
  {
    name: 'Mr. R. Karthikeyan',
    role: 'Senior Commissioning Engineer',
    note: 'Specialises in cassette units, VRF balancing and compressor load testing.',
  },
  {
    name: 'Mr. M. Sundar',
    role: 'AC Diagnostics Lead',
    note: 'Expert in PCB repair, circuit load testing and copper piping leak seals.',
  },
]

export default function AboutPage() {
  return (
    <div className="container">
      <div className="about-grid">
        <aside className="about-aside">
          <div className="eyebrow">Who We Are</div>
          <h1 style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2 }}>
            About <span style={{ color: 'var(--red)' }}>VR Store Showroom</span>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14.5, lineHeight: 1.7 }}>
            Your trusted authorised O General air conditioning showroom in Urapakkam, Chennai —
            delivering premium climate comfort since 2018.
          </p>
          <div className="about-badge">
            <i className="ti ti-award" /> Authorised O General Dealer
          </div>
          <div className="about-badge">
            <i className="ti ti-users" /> 1000+ Happy Customers
          </div>
          <div className="about-photo">
            <img src={asset('showroom-about.png')} alt="Inside the VR Store O General showroom" />
          </div>
        </aside>

        <div>
          <div className="prose-card">
            <h2>Our Showroom &amp; Services Profile</h2>
            <p>
              Founded with a vision to deliver premium cooling products, <strong>VR Store</strong>{' '}
              stands as an official <strong>O General Exclusive Dealer</strong> in Urapakkam. We
              cater to homes, clinics, commercial shops and industrial spaces, providing tailored
              cooling consultations.
            </p>
            <p>
              We believe purchasing an air conditioner is a long-term investment. That is why our
              showroom staff do not just sell — they help you work out thermal load requirements,
              tonnage capacities, and the most energy-efficient star rating for your space.
            </p>
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <h3>
                <i className="ti ti-target" /> Mission
              </h3>
              <p>
                To deliver authentic cooling solutions across Tamil Nadu, ensuring every unit meets
                O General&apos;s premium quality benchmark.
              </p>
            </div>
            <div className="mini-card">
              <h3>
                <i className="ti ti-eye" /> Vision
              </h3>
              <p>
                To be Chengalpattu&apos;s most trusted partner for residential and commercial
                tropicalised HVAC projects.
              </p>
            </div>
          </div>

          <div className="mini-card">
            <h3 style={{ marginBottom: '1.25rem' }}>
              <i className="ti ti-certificate" /> Factory Certified Engineers
            </h3>
            <div className="mini-grid" style={{ marginBottom: 0 }}>
              {ENGINEERS.map((p) => (
                <div className="person" key={p.name}>
                  <h4>{p.name}</h4>
                  <div className="role">{p.role}</div>
                  <p>{p.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
