import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAmcPlans, useStore } from '../../data/StoreContext'
import { calculateAmcPrice } from '../../data/store'

const CAPACITIES = ['1.0 Ton', '1.5 Ton', '2.0 Ton']
const AC_TYPES = ['Split AC', 'Window AC', 'Cassette AC']
const TIERS = [
  { value: 'Standard', label: 'Standard (servicing only)' },
  { value: 'Comprehensive', label: 'Comprehensive (parts covered)' },
]

export default function AmcPage() {
  const plans = useAmcPlans()
  const { amcPricing } = useStore()
  const navigate = useNavigate()

  const [capacity, setCapacity] = useState('1.5 Ton')
  const [acType, setAcType] = useState('Split AC')
  const [plan, setPlan] = useState('Standard')

  const price = calculateAmcPrice({ capacity, acType, plan }, amcPricing)

  const bookCalculated = () =>
    navigate('/book', {
      state: {
        service: 'AC AMC',
        plan: `AMC — ${plan}`,
        message: `AMC enquiry: ${plan} plan for a ${capacity} ${acType}. Estimated ₹${price}/year.`,
      },
    })

  return (
    <div className="container">
      <div className="page-hero">
        <div className="eyebrow">Protection Plans</div>
        <h1>Annual Maintenance Contracts</h1>
        <p>
          Annual service plans that secure long-term durability and discounted repairs for home and
          office ACs.
        </p>
      </div>

      <div className="amc-grid" style={{ marginTop: 0, marginBottom: '4rem' }}>
        {plans.map((p) => (
          <div className={`amc-card${p.featured ? ' featured' : ''}`} key={p.id}>
            <div className="amc-icon">
              <i className={`ti ${p.icon}`} />
            </div>
            <h3>{p.title}</h3>
            {p.price ? <div className="amc-price">{p.price}</div> : null}
            <p>{p.description}</p>
            {p.features?.length > 0 && (
              <ul className="amc-features">
                {p.features.map((f, i) => (
                  <li key={`${p.id}-f-${i}`}>
                    <i className="ti ti-check" /> {f}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className={`pbtn ${p.featured ? 'pbtn-ghost' : 'pbtn-red'} pbtn-wide`}
              style={{ marginTop: '1.5rem' }}
              onClick={bookCalculated}
            >
              Enquire About This Plan
            </button>
          </div>
        ))}
      </div>

      <div className="estimator">
        <h2>AMC Cost Estimator</h2>
        <p className="lede">Configure your AC to see an instant annual estimate.</p>

        <div className="estimator-fields">
          <div className="f">
            <label htmlFor="amc-cap">AC capacity</label>
            <select id="amc-cap" value={capacity} onChange={(e) => setCapacity(e.target.value)}>
              {CAPACITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="f">
            <label htmlFor="amc-type">AC type</label>
            <select id="amc-type" value={acType} onChange={(e) => setAcType(e.target.value)}>
              {AC_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="f">
            <label htmlFor="amc-tier">Cover tier</label>
            <select id="amc-tier" value={plan} onChange={(e) => setPlan(e.target.value)}>
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="estimator-out">
          <div>
            <div className="label">Estimated annual rate</div>
            <div className="amount">
              ₹{price.toLocaleString('en-IN')} <span>/ year</span>
            </div>
          </div>
          <button type="button" className="pbtn pbtn-red" onClick={bookCalculated}>
            <i className="ti ti-calendar-plus" /> Book This AMC Plan
          </button>
        </div>
        <p className="lede" style={{ marginTop: '1rem', marginBottom: 0, fontSize: 12 }}>
          An estimate, not a quote — the final rate is confirmed after we see the unit.
        </p>
      </div>
    </div>
  )
}
