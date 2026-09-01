/**
 * Builds a URL for a file in public/, honouring Vite's base path.
 *
 * The site runs at the root of vrstores.in, where BASE_URL is "/" and this is
 * a no-op. It matters for the GitHub Pages copy, which is served from a
 * subpath: Vite rebases asset URLs it sees through imports, but not string
 * literals in JSX, so those would 404 there without this.
 */
export const asset = (path) => `${import.meta.env.BASE_URL}${String(path).replace(/^\//, '')}`
