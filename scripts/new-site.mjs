#!/usr/bin/env node
/**
 * Spin up a new landing page site.
 *
 *   npm run new-site -- --slug acme-plumbing --name "Acme Plumbing"
 *
 * Copies the scaffold into sites/<slug>, fills in the slug and project id, and
 * (when SANITY_WRITE_TOKEN is set) creates the matching Sanity document so the
 * team can start editing immediately.
 *
 * The slug is the single source of truth: it is the folder name, the npm workspace
 * name, PUBLIC_SITE_ID, and the Sanity document _id. Keep them identical.
 */
import fs from 'node:fs'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCAFFOLD = path.join(ROOT, 'packages/landing-template/scaffold')
const PROJECT_ID = 'me0j4kdl'
const DATASET = 'production'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '')
    if (key) args[key] = argv[i + 1]
  }
  return args
}

const {slug, name} = parseArgs(process.argv.slice(2))

if (!slug || !name) {
  console.error('Usage: npm run new-site -- --slug <site-slug> --name "Business Name"')
  process.exit(1)
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
  console.error(`Invalid slug "${slug}". Use lowercase letters, numbers and hyphens.`)
  process.exit(1)
}

const dest = path.join(ROOT, 'sites', slug)

if (fs.existsSync(dest)) {
  console.error(`sites/${slug} already exists. Pick a different slug or delete it first.`)
  process.exit(1)
}

// ---------------------------------------------------------------- scaffold
const substitute = (text) => text.replaceAll('__SLUG__', slug).replaceAll('__PROJECT_ID__', PROJECT_ID)

function copyTree(from, to) {
  fs.mkdirSync(to, {recursive: true})
  for (const entry of fs.readdirSync(from, {withFileTypes: true})) {
    const src = path.join(from, entry.name)

    if (entry.isDirectory()) {
      copyTree(src, path.join(to, entry.name))
      continue
    }

    // *.tmpl files carry placeholders; everything else copies byte for byte.
    if (entry.name.endsWith('.tmpl')) {
      const target = path.join(to, entry.name.replace(/\.tmpl$/, ''))
      fs.writeFileSync(target, substitute(fs.readFileSync(src, 'utf8')))
    } else {
      fs.copyFileSync(src, path.join(to, entry.name))
    }
  }
}

copyTree(SCAFFOLD, dest)
fs.mkdirSync(path.join(dest, 'src/assets/images'), {recursive: true})
console.log(`Scaffolded sites/${slug}`)

// ------------------------------------------------------------------ Sanity
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.log('\nSANITY_WRITE_TOKEN not set — skipping the Sanity document.')
  console.log(`Create it manually with _id "${slug}", or re-run with the token to do it automatically.`)
} else {
  const {createClient} = await import('@sanity/client')
  const client = createClient({projectId: PROJECT_ID, dataset: DATASET, apiVersion: '2024-10-01', token, useCdn: false})

  // Placeholder content so the site builds as soon as a logo and hero image are
  // added in the Studio. Everything here is meant to be overwritten.
  await client.createIfNotExists({
    _id: slug,
    _type: 'landingPage',
    internalTitle: name,
    seo: {
      title: `${name}`,
      description: `Replace this with the meta description for ${name}.`,
      canonicalUrl: `https://${slug}.netlify.app`,
      noindex: true,
    },
    header: {logoAlt: name, ctaLabel: 'Get a quote', navItems: []},
    hero: {
      headlineLines: [name],
      subcopy: 'Replace this with the hero sub-copy.',
      ticks: [],
      primaryCtaLabel: 'Get a free quote',
    },
    form: {heading: 'Get a free quote', submitLabel: 'Get my free quote', serviceOptions: []},
    thankYou: {
      heading: 'Thanks, we have your request',
      subcopy: 'We have received your details and will be in touch shortly.',
      bullets: [],
    },
    business: {name, phone: ''},
  })

  console.log(`Created Sanity document "${slug}" (starts as noindex — turn that off when the page goes live)`)
}

// ------------------------------------------------------------- next steps
console.log(`
Next:
  1. npm install                      (links the new workspace)
  2. Open the Studio and add the logo, hero image and real copy, then publish.
  3. Build the sections in sites/${slug}/src/sections/ and wire them into
     src/pages/index.astro. Delete Example.astro.
  4. Create the Netlify site:
       - repository: this repo
       - base directory: sites/${slug}
       - build command and publish directory come from netlify.toml
  5. Add a Netlify build hook, then a Sanity webhook filtered to
     _id == "${slug}" pointing at it, so publishing rebuilds only this site.
  6. Point the domain and turn off "Hide from search engines" in Sanity.

  Local preview: npm run dev --workspace=@sites/${slug}
`)
