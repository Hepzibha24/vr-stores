import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { currentUser, logout } from '../../data/auth'
import { useEnquiries, useSync } from '../../data/StoreContext'
import useFavicon from './useFavicon'
import SyncBadge from './SyncBadge'
import './admin.css'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: 'ti-layout-dashboard', end: true },
  { to: '/admin/enquiries', label: 'Enquiries', icon: 'ti-inbox', badge: 'newEnquiries' },
  { to: '/admin/bookings', label: 'AMC & Bookings', icon: 'ti-calendar-event' },
  { to: '/admin/content', label: 'Site Content', icon: 'ti-edit' },
  { to: '/admin/products', label: 'Products', icon: 'ti-building-store' },
  { to: '/admin/pricing', label: 'AMC Pricing', icon: 'ti-currency-rupee' },
  { to: '/admin/invoices', label: 'Invoice Generator', icon: 'ti-file-invoice' },
  { to: '/admin/cloud', label: 'Cloud Database', icon: 'ti-database' },
  { to: '/admin/security', label: 'Change Password', icon: 'ti-lock' },
]

export default function AdminLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const enquiries = useEnquiries()
  const sync = useSync()
  const badges = { newEnquiries: enquiries.filter((e) => e.status === 'New').length }

  useFavicon('/admin-mark.svg')

  // Close the mobile drawer whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname])

  function handleLogout() {
    logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar${menuOpen ? ' open' : ''}`}>
        <div className="admin-brand">
          <img src="/vr-mark.svg" alt="" />
          <div className="admin-brand-text">
            <strong>VR STORE</strong>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}>
              <i className={`ti ${item.icon}`} />
              {item.label}
              {item.badge && badges[item.badge] > 0 && (
                <span className="nav-badge">{badges[item.badge]}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-foot">
          <SyncBadge sync={sync} />
          <span className="admin-user">Signed in as {currentUser() || 'admin'}</span>
          <Link to="/">
            <i className="ti ti-external-link" /> View public site
          </Link>
          <button type="button" onClick={handleLogout}>
            <i className="ti ti-logout" /> Log out
          </button>
        </div>
      </aside>

      <div
        className={`admin-backdrop${menuOpen ? ' show' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div className="admin-main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-burger"
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i className={menuOpen ? 'ti ti-x' : 'ti ti-menu-2'} />
          </button>
          <i className="ti ti-layout-dashboard admin-topbar-icon" aria-hidden="true" />
          <strong>VR STORE ADMIN</strong>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
