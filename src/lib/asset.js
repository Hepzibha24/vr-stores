/**
 * Builds a URL for a file in public/, honouring Vite's base path.
 *
 * GitHub Pages serves this project from /vr-stores/, not the domain root, so a
 * hard-coded "/logo.jpg" would 404 there. Vite rewrites asset URLs it can see
 * through imports, but not string literals in JSX, so those go through here.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`
