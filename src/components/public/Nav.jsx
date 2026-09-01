import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Nav.css'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/services', label: 'Services' },
  { to: '/products', label: 'Products' },
  { to: '/amc', label: 'AMC' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export default function Nav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="site-nav">
      {/* The logo is the way in to the admin portal. */}
      <Link className="nav-logo" to="/admin" title="Open the admin portal" aria-label="Open the admin portal">
        <img src="/logo.jpg" alt="VR Store logo" />
        <span>VR STORE</span>
      </Link>

      <div className="nav-links">
        {LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}>
            {l.label}
          </NavLink>
        ))}
      </div>

      <div className="nav-right">
        <a className="nav-cta" href="tel:9940291467">
          <i className="ti ti-phone" style={{ verticalAlign: '-2px', marginRight: 5, fontSize: 14 }} />
          Call Now
        </a>
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <i className={open ? 'ti ti-x' : 'ti ti-menu-2'} />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <Link to="/book" className="nav-mobile-cta" onClick={() => setOpen(false)}>
            Book a Service
          </Link>
        </div>
      )}
    </nav>
  )
}
