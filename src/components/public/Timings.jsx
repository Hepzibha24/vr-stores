import './Timings.css'

export default function Timings() {
  return (
    <section className="section">
      <div className="container" data-reveal>
        <div className="eyebrow">Working Hours</div>
        <h2 className="section-heading">Store Timings</h2>
        <div className="timings-grid">
          <div className="timing-card">
            <div className="timing-icon">
              <i className="ti ti-sun" />
            </div>
            <div>
              <div className="timing-day">Monday – Saturday</div>
              <div className="timing-time">9:00 AM – 8:00 PM</div>
              <span className="timing-badge">OPEN</span>
            </div>
          </div>
          <div className="timing-card closed">
            <div className="timing-icon">
              <i className="ti ti-moon" />
            </div>
            <div>
              <div className="timing-day">Sunday</div>
              <div className="timing-time">Closed</div>
              <span className="timing-badge closed-badge">CLOSED</span>
            </div>
          </div>
        </div>
        <p className="timing-note">
          <i className="ti ti-info-circle" />
          Emergency AC service available on Sundays — call us for urgent breakdowns.
        </p>
      </div>
    </section>
  )
}
