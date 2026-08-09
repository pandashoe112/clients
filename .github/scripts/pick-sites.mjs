#!/usr/bin/env node
/**
 * Decide which sites the deploy workflow should build.
 *
 * - workflow_dispatch  -> the slug the operator typed, or every site for "all"
 * - repository_dispatch -> the slug Sanity sent when content was published
 * - push               -> only the sites the commit actually touched, or every
 *                         site when shared code changed
 *
 * Writes a JSON array to the `sites` output for the matrix to fan out over.
 */
import fs from 'node:fs'
import {execFileSync} from 'node:child_process'

const SITES_DIR = 'sites'
const eventName = process.env.GITHUB_EVENT_NAME
const eventPath = process.env.GITHUB_EVENT_PATH

const event = eventPath && fs.existsSync(eventPath) ? JSON.parse(fs.readFileSync(eventPath, 'utf8')) : {}

/** Every site folder that has been wired up to a Netlify project. */
function allSites() {
  if (!fs.existsSync(SITES_DIR)) return []

  return fs
    .readdirSync(SITES_DIR, {withFileTypes: true})
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((slug) => fs.existsSync(`${SITES_DIR}/${slug}/site.json`))
}

function changedFiles() {
  const before = event.before
  const after = event.after ?? 'HEAD'

  // First push to a branch reports an all-zero "before" and has nothing to diff.
  if (!before || /^0+$/.test(before)) return null

  try {
    return execFileSync('git', ['diff', '--name-only', `${before}..${after}`], {encoding: 'utf8'})
      .split('\n')
      .filter(Boolean)
  } catch {
    // Shallow clone or force push — fall back to deploying everything.
    return null
  }
}

function resolve() {
  const available = allSites()

  if (eventName === 'workflow_dispatch') {
    const requested = event.inputs?.site?.trim()
    if (!requested || requested === 'all') return available
    return available.filter((slug) => slug === requested)
  }

  if (eventName === 'repository_dispatch') {
    const requested = event.client_payload?.site?.trim()
    if (!requested) return available
    return available.filter((slug) => slug === requested)
  }

  const changed = changedFiles()
  if (!changed) return available

  // A change to the shared template or the lockfile affects every site.
  const sharedChanged = changed.some(
    (file) => file.startsWith('packages/') || file === 'package-lock.json' || file === 'package.json',
  )
  if (sharedChanged) return available

  return available.filter((slug) => changed.some((file) => file.startsWith(`${SITES_DIR}/${slug}/`)))
}

const sites = resolve()

console.log(`event=${eventName} -> deploying: ${sites.length ? sites.join(', ') : '(none)'}`)
fs.appendFileSync(process.env.GITHUB_OUTPUT, `sites=${JSON.stringify(sites)}\n`)
