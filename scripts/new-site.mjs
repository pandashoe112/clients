#!/usr/bin/env node
/**
 * Spin up a new landing page site, end to end.
 *
 *   npm run new-site -- --slug acme-plumbing --name "Acme Plumbing"
 *
 * Creates the site folder, the Netlify project and the Sanity document, and
 * records the Netlify project id in sites/<slug>/site.json so CI can deploy it.
 *
 * Needs, once per machine:
 *   netlify login                    (or export NETLIFY_AUTH_TOKEN)
 *   export SANITY_WRITE_TOKEN=...    (Sanity → project → API → Tokens)
 *
 * Either step is skipped with an explanation if its credential is missing, so
 * the script is always safe to re-run.
 *
 * The slug is the single source of truth: folder name, npm workspace name,
 * PUBLIC_SITE_ID, and the Sanity document _id are all the same string.
 */
import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SCAFFOLD = path.join(ROOT, 'packages/landing-template/scaffold')
const PROJECT_ID = 'me0j4kdl'
const DATASET = 'production'
const NETLIFY_TEAM = 'oliver-vcctkmu'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i]?.replace(/^--/, '')
    if (key) args[key] = argv[i + 1]
  }
  return args
}

const {slug, name, team = NETLIFY_TEAM} = parseArgs(process.argv.slice(2))

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
      fs.writeFileSync(path.join(to, entry.name.replace(/\.tmpl$/, '')), substitute(fs.readFileSync(src, 'utf8')))
    } else {
      fs.copyFileSync(src, path.join(to, entry.name))
    }
  }
}

copyTree(SCAFFOLD, dest)
fs.mkdirSync(path.join(dest, 'src/assets/images'), {recursive: true})
console.log(`✓ Scaffolded sites/${slug}`)

// ----------------------------------------------------------------- Netlify
let netlifySiteId = null

if (!process.env.NETLIFY_AUTH_TOKEN && !fs.existsSync(path.join(process.env.HOME ?? '', '.netlify/config.json'))) {
  console.log('\n• Netlify: not authenticated — run `netlify login` (or set NETLIFY_AUTH_TOKEN) and re-run.')
} else {
  try {
    const raw = execFileSync(
      'npx',
      ['--yes', 'netlify-cli@17', 'sites:create', '--name', slug, '--account-slug', team, '--json'],
      {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']},
    )

    // The CLI prints a banner before the JSON body on some versions.
    const site = JSON.parse(raw.slice(raw.indexOf('{')))
    netlifySiteId = site.site_id ?? site.id

    fs.writeFileSync(
      path.join(dest, 'site.json'),
      `${JSON.stringify({netlifySiteId, netlifyName: site.name ?? slug}, null, 2)}\n`,
    )

    console.log(`✓ Netlify project "${site.name ?? slug}" created (${netlifySiteId})`)
    console.log(`  ${site.ssl_url ?? site.url ?? `https://${slug}.netlify.app`}`)
  } catch (error) {
    console.log(`\n• Netlify: could not create the project — ${error.message.trim().split('\n').pop()}`)
    console.log('  Create it manually, then add sites/' + slug + '/site.json with {"netlifySiteId": "..."}.')
  }
}

// ------------------------------------------------------------------ Sanity
const token = process.env.SANITY_WRITE_TOKEN

if (!token) {
  console.log('\n• Sanity: SANITY_WRITE_TOKEN not set — skipping the document.')
  console.log(`  Create it manually in the Studio with _id "${slug}".`)
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
      title: name,
      description: `Replace this with the meta description for ${name}.`,
      canonicalUrl: netlifySiteId ? `https://${slug}.netlify.app` : `https://${slug}.example.com`,
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

  console.log(`✓ Sanity document "${slug}" created (starts as noindex)`)
}

// ------------------------------------------------------------- next steps
console.log(`
Next:
  1. npm install                     links the new workspace
  2. https://dunk-landing.sanity.studio/
     Add the logo, hero image and real copy, then publish.
  3. Build the sections in sites/${slug}/src/sections/ and wire them into
     src/pages/index.astro. Delete Example.astro.
  4. Commit and push. CI builds and deploys automatically.

  Local preview: npm run dev --workspace=@sites/${slug}

No Netlify UI, and no per-site webhook — the project-wide Sanity webhook already
covers this site because it sends the document _id as the deploy target.
`)
