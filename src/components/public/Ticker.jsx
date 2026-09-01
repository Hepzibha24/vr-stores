import './Ticker.css'

const ITEMS = [
  { icon: 'ti-star-filled', label: 'AC Sales' },
  { icon: 'ti-tool', label: 'AC Repair' },
  { icon: 'ti-settings', label: 'Installation' },
  { icon: 'ti-droplet', label: 'Deep Cleaning' },
  { icon: 'ti-file-certificate', label: 'AMC Plans' },
  { icon: 'ti-award', label: 'O General Authorised' },
]

export default function Ticker() {
  // Rendered twice so the -50% translate loops seamlessly.
  const loop = [...ITEMS, ...ITEMS]

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-inner">
        {loop.map((item, i) => (
          <span key={`${item.label}-${i}`} className="ticker-group">
            <span className="ticker-item">
              <i className={`ti ${item.icon}`} style={{ fontSize: 12 }} /> {item.label}
            </span>
            <span className="ticker-dot">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}
