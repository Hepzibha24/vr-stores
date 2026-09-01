import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Stamped into the page so `curl` can tell which commit is live and whether
// that build had its credentials — see vite.config.js.
const build = __BUILD_INFO__
const meta = document.createElement('meta')
meta.name = 'x-build'
meta.content = `${build.sha} ${build.at} supabase=${build.env.supabase} emailjs=${build.env.emailjs} whatsapp=${build.env.whatsapp}`
document.head.appendChild(meta)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
