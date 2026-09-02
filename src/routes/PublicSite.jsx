import { useEffect } from 'react'
import { recordVisit } from '../data/store'
import Nav from '../components/public/Nav'
import Hero from '../components/public/Hero'
import Ticker from '../components/public/Ticker'
import Services from '../components/public/Services'
import Tech from '../components/public/Tech'
import AMC from '../components/public/AMC'
import Brands from '../components/public/Brands'
import Models from '../components/public/Models'
import Reviews from '../components/public/Reviews'
import Faq from '../components/public/Faq'
import ServiceAreas from '../components/public/ServiceAreas'
import Timings from '../components/public/Timings'
import Contact from '../components/public/Contact'
import Footer from '../components/public/Footer'
import FloatingActions from '../components/public/FloatingActions'
import useReveal from '../components/public/useReveal'

export default function PublicSite() {
  // Lightweight visit counter feeding the admin analytics view. Deduped per
  // browser tab session inside recordVisit().
  useEffect(() => {
    recordVisit()
  }, [])

  useReveal()

  return (
    <>
      <Nav />
      <Hero />
      <Ticker />
      <Services />
      <Models />
      <Tech />
      <AMC />
      <Brands />
      <Reviews />
      <ServiceAreas />
      <Timings />
      <Faq />
      <Contact />
      <Footer />
      <FloatingActions />
    </>
  )
}
