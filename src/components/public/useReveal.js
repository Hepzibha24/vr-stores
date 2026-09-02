import { useEffect } from 'react'

/**
 * Fades sections in as they enter the viewport.
 *
 * Uses one IntersectionObserver over `[data-reveal]` rather than a component
 * wrapper, so markup stays plain and nothing re-renders on scroll. Elements
 * are unobserved once shown — this is an entrance, not a scroll effect, and
 * re-animating on the way back up is distracting.
 *
 * Honours prefers-reduced-motion by revealing everything immediately.
 */
export default function useReveal() {
  useEffect(() => {
    const nodes = document.querySelectorAll('[data-reveal]')
    if (!nodes.length) return undefined

    const revealAll = () => nodes.forEach((n) => n.setAttribute('data-revealed', 'true'))

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealAll()
      return undefined
    }

    // Only now opt into hiding. The stylesheet keys off this class, so if the
    // script never runs — or throws before this line — the page renders in
    // full rather than blank. Hiding content that only JavaScript can bring
    // back is a bad trade for an entrance animation.
    document.documentElement.classList.add('reveal-ready')

    // Belt and braces: some environments create the observer without ever
    // delivering a callback. Anything still hidden after this is shown
    // outright, so a failed animation costs the effect, not the content.
    const failsafe = window.setTimeout(revealAll, 2500)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-revealed', 'true')
          observer.unobserve(entry.target)
        })
      },
      // Start a little before the element is fully in view, so the motion has
      // finished by the time it is properly on screen.
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    nodes.forEach((n) => observer.observe(n))
    return () => {
      window.clearTimeout(failsafe)
      observer.disconnect()
    }
  }, [])
}
