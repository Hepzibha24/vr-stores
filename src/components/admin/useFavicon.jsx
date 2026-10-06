import { useEffect } from 'react'

/**
 * Swaps the browser tab icon while an admin screen is mounted, so the admin tab
 * is distinguishable from the public site tab when both are open. Restores the
 * previous icons on unmount.
 *
 * Every icon link has to be swapped, not just the first one. The document
 * declares several — an .ico for the bare /favicon.ico request and an SVG for
 * browsers that prefer it — and a browser picks whichever it likes best rather
 * than the first in source order. Swapping one and leaving the rest put the
 * public logo back in the admin tab on exactly the browsers that take the SVG.
 */
export default function useFavicon(href) {
  useEffect(() => {
    const links = Array.from(document.querySelectorAll("link[rel~='icon']"))
    if (!links.length) return undefined

    const previous = links.map((link) => ({
      link,
      href: link.getAttribute('href'),
      type: link.getAttribute('type'),
    }))

    links.forEach((link) => {
      link.setAttribute('href', href)
      link.setAttribute('type', 'image/svg+xml')
    })

    return () => {
      previous.forEach((p) => {
        p.link.setAttribute('href', p.href)
        if (p.type) p.link.setAttribute('type', p.type)
        else p.link.removeAttribute('type')
      })
    }
  }, [href])
}
