import { useEffect } from 'react'

/**
 * Sets the browser tab title while a screen is mounted, restoring the previous
 * one on unmount.
 *
 * The document title in index.html is written for search results on the public
 * page — "AC Sales & Service in Urapakkam, Chengalpattu | VR Store". It is a
 * single-page app, so every admin screen inherited that marketing line, which
 * made the browser history and a row of open tabs unreadable for the one person
 * who uses the admin all day.
 */
export default function useTitle(title) {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}
