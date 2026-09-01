import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves the site from /<repo>/, so CI sets VITE_BASE.
  // Local dev and any root-domain host keep '/'.
  base: process.env.VITE_BASE || '/',
})
