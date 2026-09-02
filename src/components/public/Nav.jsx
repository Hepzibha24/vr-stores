import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { asset } from '../../lib/asset'
import './Nav.css'

/**
 * Single-page site, so the bar carries no section links — just the brand and
 * the call to action. With no menu to open, the mobile burger goes too.
 * The logo is the way in to the admin portal.
 */
export default function Nav() {
  const [condensed, setCondensed] = useState(false)

  // Tightens once the page has moved, which hands a few vertical pixels back
  // to the content and marks the header as pinned rather than in flow.
  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`site-nav${condensed ? ' condensed' : ''}`}>
      <Link
        className="nav-logo"
        to="/admin"
        title="Open the admin portal"
        aria-label="Open the admin portal"
      >
        <img src={asset('logo.png')} alt="VR Store" />
      </Link>

      <a className="nav-cta" href="tel:9940291467">
        <i className="ti ti-phone" style={{ verticalAlign: '-2px', marginRight: 5, fontSize: 14 }} />
        Call Now
      </a>
    </nav>
  )
}
