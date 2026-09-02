import { execSync } from 'node:child_process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Which commit this bundle was built from, and whether the build could see the
 * credentials it needs.
 *
 * Without this there is no way to tell "the host has not deployed yet" from
 * "it deployed but the environment variables were missing" — both look like a
 * site that quietly has no database.
 */
function buildInfo(env) {
  const sha =
    process.env.VERCEL_GIT_COMMIT_SHA || // Vercel
    process.env.GITHUB_SHA || // GitHub Actions
    (() => {
      try {
        return execSync('git rev-parse HEAD').toString().trim()
      } catch {
        return 'unknown'
      }
    })()

  return {
    sha: sha.slice(0, 7),
    at: new Date().toISOString(),
    // Names and sources only — never values, since this ends up in the page.
    // Supabase always resolves, because src/data/config.js carries a committed
    // default; what is worth knowing is whether this build overrode it.
    env: {
      supabase: env.VITE_SUPABASE_URL && env.VITE_SUPABASE_KEY ? 'env' : 'default',
      emailjs: Boolean(
        env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY,
      ),
      whatsapp: Boolean(env.VITE_CALLMEBOT_APIKEY),
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv merges .env files with the real environment. Reading process.env
  // alone would miss local .env files, which Vite only exposes to client code.
  const env = loadEnv(mode, process.cwd(), '')

  const info = buildInfo(env)

  return {
    plugins: [
      react(),
      {
        name: 'build-stamp',
        transformIndexHtml() {
          return [
            {
              tag: 'meta',
              attrs: {
                name: 'x-build',
                content:
                  `${info.sha} ${info.at} supabase=${info.env.supabase} ` +
                  `emailjs=${info.env.emailjs} whatsapp=${info.env.whatsapp}`,
              },
              injectTo: 'head',
            },
          ]
        },
      },
    ],
    // GitHub Pages serves the site from /<repo>/, so CI sets VITE_BASE.
    // Local dev and any root-domain host keep '/'.
    base: env.VITE_BASE || '/',
    define: {
      __BUILD_INFO__: JSON.stringify(info),
    },
  }
})
