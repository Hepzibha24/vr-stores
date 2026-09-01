import { useState } from 'react'
import { useAmcPlans, useBrands } from '../../data/StoreContext'
import { addBooking } from '../../data/store'
import './AMC.css'

const PLAN_OPTIONS = [
  'AMC — Basic',
  'AMC — Comprehensive',
  'Service Request',
  'Installation',
  'Deep Cleaning',
]

const EMPTY = { name: '', phone: '', brand: '', model: '', plan: PLAN_OPTIONS[0], requestedDate: '' }

export default function AMC() {
  const plans = useAmcPlans()
  const brands = useBrands()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number.')
      return
    }
    addBooking(form)
    setForm({ ...EMPTY, brand: '' })
    setError('')
    setSent(true)
  }

  return (
    <section className="section" id="amc">
      <div className="container">
        <div className="eyebrow">Annual Plans</div>
        <h2 className="section-heading">AMC — What&apos;s Included</h2>
        <p className="section-sub">
          Protect your investment with our comprehensive Annual Maintenance Contracts.
        </p>

        <div className="amc-grid">
          {plans.map((p) => (
            <div className={`amc-card${p.featured ? ' featured' : ''}`} key={p.id}>
              <div className="amc-icon">
                <i className={`ti ${p.icon}`} />
              </div>
              <h3>{p.title}</h3>
              {p.price ? <div className="amc-price">{p.price}</div> : null}
              <p>{p.description}</p>
              {p.features && p.features.length > 0 && (
                <ul className="amc-features">
                  {p.features.map((f, i) => (
                    <li key={`${p.id}-f-${i}`}>
                      <i className="ti ti-check" /> {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="amc-book" id="book">
          <div className="amc-book-head">
            <h3>Book an AMC or Service Visit</h3>
            <p>Tell us about your unit and we will call you back to confirm a slot.</p>
          </div>

          {sent ? (
            <div className="amc-sent" role="status">
              <i className="ti ti-circle-check" />
              <div>
                <strong>Request received.</strong>
                <span>We will call you on the number you shared to confirm the visit.</span>
              </div>
              <button type="button" className="amc-again" onClick={() => setSent(false)}>
                Book another
              </button>
            </div>
          ) : (
            <form className="amc-form" onSubmit={handleSubmit} noValidate>
              <div className="amc-field">
                <label htmlFor="bk-name">Your name</label>
                <input id="bk-name" value={form.name} onChange={set('name')} autoComplete="name" required />
              </div>
              <div className="amc-field">
                <label htmlFor="bk-phone">Phone number</label>
                <input
                  id="bk-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="amc-field">
                <label htmlFor="bk-brand">AC brand</label>
                <select id="bk-brand" value={form.brand} onChange={set('brand')}>
                  <option value="">Select a brand</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="amc-field">
                <label htmlFor="bk-model">Model (optional)</label>
                <input id="bk-model" value={form.model} onChange={set('model')} />
              </div>
              <div className="amc-field">
                <label htmlFor="bk-plan">Plan / request type</label>
                <select id="bk-plan" value={form.plan} onChange={set('plan')}>
                  {PLAN_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="amc-field">
                <label htmlFor="bk-date">Preferred date</label>
                <input id="bk-date" type="date" value={form.requestedDate} onChange={set('requestedDate')} />
              </div>

              {error && (
                <p className="amc-error" role="alert">
                  {error}
                </p>
              )}

              <button className="amc-submit" type="submit">
                <i className="ti ti-calendar-plus" /> Request Booking
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
