import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

/**
 * Render entry used only at build time, to bake the home page into
 * dist/index.html.
 *
 * The site is a single page for visitors but was shipping an empty <body> to
 * crawlers — every heading, service and phone number was drawn by JavaScript
 * after load. Google will run JS, but as a slower second pass that a new
 * domain with no authority cannot rely on.
 *
 * Only "/" is prerendered. The admin is behind a gate and excluded in
 * robots.txt, so there is nothing to gain from rendering it.
 */
export function render(url = '/') {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
}
