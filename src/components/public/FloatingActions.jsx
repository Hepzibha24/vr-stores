import { useEffect, useState } from 'react'
import './FloatingActions.css'

/**
 * Persistent call and WhatsApp buttons.
 *
 * For a service business the whole page exists to produce a phone call, and on
 * a phone the header scrolls away — so the action follows the reader down.
 * Held back until the hero has passed, where the same two buttons are already
 * on screen at full size.
 */
export default function FloatingActions() {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight * 0.6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`fab-stack${shown ? ' shown' : ''}`} aria-hidden={!shown}>
      <a
        className="fab fab-whatsapp"
        href="https://wa.me/919940291467"
        target="_blank"
        rel="noreferrer"
        aria-label="Message VR Store on WhatsApp"
        tabIndex={shown ? 0 : -1}
      >
        <i className="ti ti-brand-whatsapp" />
        <span>WhatsApp</span>
      </a>
      <a
        className="fab fab-call"
        href="tel:9940291467"
        aria-label="Call VR Store on 9940291467"
        tabIndex={shown ? 0 : -1}
      >
        <i className="ti ti-phone" />
        <span>Call</span>
      </a>
    </div>
  )
}
