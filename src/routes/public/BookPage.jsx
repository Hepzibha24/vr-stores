import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useBrands, useServices } from '../../data/StoreContext'
import { addBooking } from '../../data/store'

const AC_TYPES = ['Split AC', 'Window AC', 'Cassette AC', 'Multi-Split AC']

/**
 * The booking page other pages hand off to. Services, Products and the AMC
 * estimator all navigate here with router state, so the form arrives
 * pre-filled with what the visitor was looking at.
 */
export default function BookPage() {
  const services = useServices()
  const brands = useBrands()
  const { state } = useLocation()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    brand: '',
    model: state?.product || '',
    plan: state?.plan || state?.service || 'Service Request',
    requestedDate: '',
    message: state?.message || '',
  })
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number so we can call you back.')
      return
    }
    addBooking({
      name: form.name,
      phone: form.phone,
      brand: form.brand,
      // The free-text note rides along with the model so nothing is dropped.
      model: [form.model, form.message.trim()].filter(Boolean).join(' — '),
      plan: form.plan,
      requestedDate: form.requestedDate,
    })
    setError('')
    setDone(true)
  }

  if (done) {
    return (
      <div className="container">
        <div className="form-card form-done">
          <i className="ti ti-circle-check" />
          <h2>Request received</h2>
          <p>
            Thanks — we have your details and will call you on the number you gave to confirm a
            slot. For anything urgent, ring <a href="tel:9940291467">9940291467</a>.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: '1.5rem', flexWrap: 'wrap' }}>
            <Link className="pbtn pbtn-red" to="/">
              Back to home
            </Link>
            <button type="button" className="pbtn pbtn-ghost" onClick={() => setDone(false)}>
              Book another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <div className="page-hero">
        <div className="eyebrow">Book a Visit</div>
        <h1>Request a Service or Quote</h1>
        <p>Tell us what you need and we will call you back — usually the same day.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit} noValidate>
        <div className="form-rows">
          <div className="fld">
            <label htmlFor="bp-name">
              Name <span className="req">*</span>
            </label>
            <input id="bp-name" value={form.name} onChange={set('name')} autoComplete="name" placeholder="Your full name" />
          </div>
          <div className="fld">
            <label htmlFor="bp-phone">
              Phone number <span className="req">*</span>
            </label>
            <input
              id="bp-phone"
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              autoComplete="tel"
              placeholder="10-digit mobile number"
            />
          </div>
          <div className="fld">
            <label htmlFor="bp-plan">Service required</label>
            <select id="bp-plan" value={form.plan} onChange={set('plan')}>
              <option>Service Request</option>
              <option>AMC — Standard</option>
              <option>AMC — Comprehensive</option>
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="fld">
            <label htmlFor="bp-brand">AC brand</label>
            <select id="bp-brand" value={form.brand} onChange={set('brand')}>
              <option value="">Select a brand</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="fld">
            <label htmlFor="bp-model">AC model / type</label>
            <input
              id="bp-model"
              list="bp-actypes"
              value={form.model}
              onChange={set('model')}
              placeholder="e.g. Split AC, or a model number"
            />
            <datalist id="bp-actypes">
              {AC_TYPES.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>
          <div className="fld">
            <label htmlFor="bp-date">Preferred date</label>
            <input id="bp-date" type="date" value={form.requestedDate} onChange={set('requestedDate')} />
          </div>
          <div className="fld wide">
            <label htmlFor="bp-msg">Details or special instructions</label>
            <textarea
              id="bp-msg"
              rows={4}
              value={form.message}
              onChange={set('message')}
              placeholder="Any specific issue, address landmark, or timing preference"
            />
          </div>

          {error && (
            <p className="form-error-msg" role="alert">
              {error}
            </p>
          )}

          <div className="fld wide">
            <button className="pbtn pbtn-red" type="submit">
              <i className="ti ti-calendar-plus" /> Submit Request
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
