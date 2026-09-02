/**
 * Injects the server-rendered home page into dist/index.html.
 *
 * Runs after both Vite builds: the client build produces dist/, the SSR build
 * produces dist-ssr/entry-server.js. This stitches them together and removes
 * the SSR output, which is a build artefact rather than something to deploy.
 */
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

const INDEX = resolve('dist/index.html')
const SSR_ENTRY = resolve('dist-ssr/entry-server.js')

if (!existsSync(SSR_ENTRY)) {
  console.error('[prerender] dist-ssr/entry-server.js is missing — did the SSR build run?')
  process.exit(1)
}

const { render } = await import(pathToFileURL(SSR_ENTRY).href)
const html = render('/')

const template = readFileSync(INDEX, 'utf8')
const marker = '<div id="root"></div>'
if (!template.includes(marker)) {
  console.error('[prerender] could not find the root mount point in dist/index.html')
  process.exit(1)
}

writeFileSync(INDEX, template.replace(marker, `<div id="root">${html}</div>`), 'utf8')
rmSync(resolve('dist-ssr'), { recursive: true, force: true })

const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
console.log(`[prerender] injected ${html.length} bytes of HTML (${text.length} chars of text)`)
