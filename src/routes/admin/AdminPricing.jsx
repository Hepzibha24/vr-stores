import { useState } from 'react'
import { useStore } from '../../data/StoreContext'
import { calculateAmcPrice, updateAmcPricing } from '../../data/store'

const FIELDS = [
  { key: 'base_1_ton', label: 'Base rate — 1.0 Ton', hint: 'Standard cover, split or window' },
  { key: 'base_1_5_ton', label: 'Base rate — 1.5 Ton', hint: 'The most common capacity' },
  { key: 'base_2_ton', label: 'Base rate — 2.0 Ton', hint: 'Larger rooms and shops' },
  { key: 'cassette_surcharge', label: 'Cassette surcharge', hint: 'Added on top for ceiling cassettes' },
  {
    key: 'comprehensive_multiplier',
    label: 'Comprehensive multiplier',
    hint: 'Base rate is multiplied by this for parts-covered plans',
  },
]

// The combinations most worth sanity-checking before saving.
const PREVIEW = [
  { capacity: '1.0 Ton', acType: 'Split AC', plan: 'Standard' },
  { capacity: '1.5 Ton', acType: 'Split AC', plan: 'Standard' },
  { capacity: '1.5 Ton', acType: 'Split AC', plan: 'Comprehensive' },
  { capacity: '2.0 Ton', acType: 'Cassette AC', plan: 'Comprehensive' },
]

export default function AdminPricing() {
  const { amcPricing } = useStore()
  const [draft, setDraft] = useState(() =>
    Object.fromEntries(FIELDS.map((f) => [f.key, String(amcPricing[f.key] ?? '')])),
  )
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')

  const set = (key) => (e) => {
    setDraft((d) => ({ ...d, [key]: e.target.value }))
    setSaved('')
  }

  // Preview off the draft so the effect of a change is visible before saving.
  const previewPricing = Object.fromEntries(
    FIELDS.map((f) => [f.key, Number(draft[f.key]) || 0]),
  )

  function save(e) {
    e.preventDefault()
    const bad = FIELDS.find((f) => draft[f.key] === '' || Number.isNaN(Number(draft[f.key])))
    if (bad) {
      setError(`${bad.label} must be a number.`)
      return
    }
    if (Number(draft.comprehensive_multiplier) <= 0) {
      setError('The comprehensive multiplier must be greater than zero.')
      return
    }
    updateAmcPricing(previewPricing)
    setError('')
    setSaved('Saved. The public AMC estimator now uses these rates.')
  }

  return (
    <>
      <div className="page-head">
        <h1>AMC Pricing</h1>
        <p>These rates drive the cost estimator on the public AMC page.</p>
      </div>

      <div className="panel" style={{ maxWidth: 620 }}>
        <div className="panel-head">
          <div>
            <h2>Rate card</h2>
            <p>All values in rupees, except the multiplier.</p>
          </div>
        </div>

        <form className="form-grid" onSubmit={save} noValidate>
          {FIELDS.map((f) => (
            <div className="field full" key={f.key}>
              <label htmlFor={`pr-${f.key}`}>{f.label}</label>
              <input id={`pr-${f.key}`} inputMode="decimal" value={draft[f.key]} onChange={set(f.key)} />
              <span className="stat-sub">{f.hint}</span>
            </div>
          ))}

          {error && <p className="form-error">{error}</p>}
          {saved && (
            <p className="form-success" role="status">
              <i className="ti ti-circle-check" /> {saved}
            </p>
          )}

          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              <i className="ti ti-check" /> Save rates
            </button>
          </div>
        </form>
      </div>

      <div className="panel" style={{ maxWidth: 620 }}>
        <div className="panel-head">
          <div>
            <h2>What customers will see</h2>
            <p>Live preview of the values above, before you save.</p>
          </div>
        </div>
        <div className="table-scroll">
          <table className="data">
            <thead>
              <tr>
                <th scope="col">Capacity</th>
                <th scope="col">Type</th>
                <th scope="col">Tier</th>
                <th scope="col">Annual rate</th>
              </tr>
            </thead>
            <tbody>
              {PREVIEW.map((combo) => (
                <tr key={`${combo.capacity}-${combo.acType}-${combo.plan}`} style={{ cursor: 'default' }}>
                  <td>{combo.capacity}</td>
                  <td className="cell-muted">{combo.acType}</td>
                  <td className="cell-muted">{combo.plan}</td>
                  <td className="cell-strong">
                    ₹{calculateAmcPrice(combo, previewPricing).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
