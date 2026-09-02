import { useState } from 'react'
import { useServices } from '../../data/StoreContext'
import { addEnquiry } from '../../data/store'
import './Contact.css'

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.049!2d80.06134!3d12.86207!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52f788abd26703%3A0x1a9f560e9e03db68!2sVR+Store+%2FO+General+Exclusive+Ac+Showroom%2C+AC+Sales+And+Service+Urapakkam!5e0!3m2!1sen!2sin!4v1748000000000!5m2!1sen!2sin'

const EMPTY = { name: '', phone: '', email: '', service: '', message: '' }

export default function Contact() {
  const services = useServices()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Please enter your name and phone number so we can reach you.')
      return
    }
    addEnquiry(form)
    setForm(EMPTY)
    setError('')
    setSent(true)
  }

  return (
    <section className="section bg-dark" id="contact">
      <div className="container" data-reveal>
        <div className="eyebrow" style={{ color: 'rgba(204,0,0,0.9)' }}>
          Get In Touch
        </div>
        <h2 className="section-heading white">Ready to Book?</h2>
        <p className="section-sub white">Reach us via call, WhatsApp or email — we respond fast.</p>

        {/* One set of cards, each of which is the action. Previously the same
            numbers appeared as read-only cards and again as buttons, which
            made the reader check whether the two lists differed. */}
        <div className="contact-actions">
          <a className="caction" href="tel:9940291467">
            <span className="caction-icon">
              <i className="ti ti-phone" />
            </span>
            <span className="caction-text">
              <span className="label">Call — primary</span>
              <span className="value">9940291467</span>
            </span>
            <i className="ti ti-arrow-up-right caction-go" aria-hidden="true" />
          </a>

          <a
            className="caction caction-whatsapp"
            href="https://wa.me/919940291467"
            target="_blank"
            rel="noreferrer"
          >
            <span className="caction-icon">
              <i className="ti ti-brand-whatsapp" />
            </span>
            <span className="caction-text">
              <span className="label">WhatsApp</span>
              <span className="value">Message us now</span>
            </span>
            <i className="ti ti-arrow-up-right caction-go" aria-hidden="true" />
          </a>

          <a className="caction" href="tel:71200817516">
            <span className="caction-icon">
              <i className="ti ti-phone" />
            </span>
            <span className="caction-text">
              <span className="label">Call — alternate</span>
              <span className="value">71200817516</span>
            </span>
            <i className="ti ti-arrow-up-right caction-go" aria-hidden="true" />
          </a>

          <a className="caction" href="mailto:vrstores.airconditioner@gmail.com">
            <span className="caction-icon">
              <i className="ti ti-mail" />
            </span>
            <span className="caction-text">
              <span className="label">Email</span>
              <span className="value">vrstores.airconditioner@gmail.com</span>
            </span>
            <i className="ti ti-arrow-up-right caction-go" aria-hidden="true" />
          </a>

          <a
            className="caction caction-wide"
            href="https://maps.app.goo.gl/yKGixWLWPscbxBky8"
            target="_blank"
            rel="noreferrer"
          >
            <span className="caction-icon">
              <i className="ti ti-map-pin" />
            </span>
            <span className="caction-text">
              <span className="label">Showroom</span>
              <span className="value">Rohini Nagar, Urapakkam West, Tamil Nadu 603211</span>
            </span>
            <i className="ti ti-arrow-up-right caction-go" aria-hidden="true" />
          </a>
        </div>

        <div className="enquiry-box">
          <div className="enquiry-head">
            <h3>Or send us an enquiry</h3>
            <p>Leave your details and we will get back to you — usually the same day.</p>
          </div>

          {sent ? (
            <div className="enquiry-sent" role="status">
              <i className="ti ti-circle-check" />
              <div>
                <strong>Thanks — your enquiry is with us.</strong>
                <span>We will call you back shortly on the number you shared.</span>
              </div>
              <button type="button" className="enquiry-again" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
              <div className="enquiry-field">
                <label htmlFor="eq-name">Your name</label>
                <input id="eq-name" value={form.name} onChange={set('name')} autoComplete="name" required />
              </div>
              <div className="enquiry-field">
                <label htmlFor="eq-phone">Phone number</label>
                <input
                  id="eq-phone"
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  autoComplete="tel"
                  required
                />
              </div>
              <div className="enquiry-field">
                <label htmlFor="eq-email">Email (optional)</label>
                <input
                  id="eq-email"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                />
              </div>
              <div className="enquiry-field">
                <label htmlFor="eq-service">What do you need?</label>
                <select id="eq-service" value={form.service} onChange={set('service')}>
                  <option value="">Select a service</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="enquiry-field full">
                <label htmlFor="eq-message">Message</label>
                <textarea id="eq-message" rows={4} value={form.message} onChange={set('message')} />
              </div>

              {error && (
                <p className="enquiry-error" role="alert">
                  {error}
                </p>
              )}

              <button className="enquiry-submit" type="submit">
                <i className="ti ti-send" /> Send Enquiry
              </button>
            </form>
          )}
        </div>

        <div className="map-wrapper">
          <iframe
            src={MAP_SRC}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="VR Store on Google Maps"
          />
          <div className="map-addr">
            <i className="ti ti-map-pin" />
            <div className="map-addr-text">
              <p>
                Plot No: 4, 1st Floor, Door No: 38, Rohini Nagar, Annai Anjugam Nagar,
                <br />
                Urapakkam West, Chengalpattu District, Tamil Nadu – 603 211
                <br />
                <a
                  href="https://maps.app.goo.gl/yKGixWLWPscbxBky8"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get Directions →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
