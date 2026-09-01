import { useEffect } from 'react'

/**
 * Swaps the browser tab icon while an admin screen is mounted, so the admin tab
 * is distinguishable from the public site tab when both are open. Restores the
 * previous icon on unmount.
 */
export default function useFavicon(href) {
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']")
    if (!link) return undefined
    const previous = link.getAttribute('href')
    const previousType = link.getAttribute('type')
    link.setAttribute('href', href)
    link.setAttribute('type', 'image/svg+xml')
    return () => {
      link.setAttribute('href', previous)
      if (previousType) link.setAttribute('type', previousType)
    }
  }, [href])
}
