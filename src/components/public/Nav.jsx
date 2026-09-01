import { Link } from 'react-router-dom'
import { asset } from '../../lib/asset'
import './Nav.css'

/**
 * Single-page site, so the bar carries no section links — just the brand and
 * the call to action. With no menu to open, the mobile burger goes too.
 * The logo is the way in to the admin portal.
 */
export default function Nav() {
  return (
    <nav className="site-nav">
      <Link
        className="nav-logo"
        to="/admin"
        title="Open the admin portal"
        aria-label="Open the admin portal"
      >
        <img src={asset('logo.jpg')} alt="VR Store logo" />
        <span>VR STORE</span>
      </Link>

      <a className="nav-cta" href="tel:9940291467">
        <i className="ti ti-phone" style={{ verticalAlign: '-2px', marginRight: 5, fontSize: 14 }} />
        Call Now
      </a>
    </nav>
  )
}
