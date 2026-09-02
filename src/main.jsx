import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

const container = document.getElementById('root')

// The build bakes the home page into this container so crawlers get real
// content without running JavaScript. Browsers do not need it — they are about
// to render the same thing — and createRoot over existing markup left the app
// mounted but with its effects never running, which silently disabled the
// scroll reveal, the sticky header and the floating call buttons.
// Clearing first gives a clean mount; the crawler has already read the HTML.
if (container.firstChild) container.textContent = ''

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
