import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { recordVisit } from '../../data/store'
import Nav from './Nav'
import Footer from './Footer'
import './pages.css'

/** Nav + Footer shell shared by every public page other than the home one-pager. */
export default function SiteLayout() {
  const { pathname } = useLocation()

  useEffect(() => {
    recordVisit()
  }, [])

  // Landing part-way down a page after a route change is disorienting.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return (
    <>
      <Nav />
      <main className="page">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
