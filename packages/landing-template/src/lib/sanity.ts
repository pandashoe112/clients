import {createClient, type SanityClient} from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type {ImageUrlBuilder} from '@sanity/image-url/lib/types/builder'
import type {LandingPage, SanityImage} from './types'
import {LANDING_PAGE_QUERY} from './queries'

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `Missing ${name}. Set it in sites/<slug>/.env for local dev, and in the site's Netlify environment variables for deploys.`,
    )
  }
  return value
}

const projectId = required('PUBLIC_SANITY_PROJECT_ID', import.meta.env.PUBLIC_SANITY_PROJECT_ID)
const dataset = required('PUBLIC_SANITY_DATASET', import.meta.env.PUBLIC_SANITY_DATASET)

export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  // Content is read at build time only. Skipping the CDN means a webhook-triggered
  // build always picks up what was just published rather than a cached copy.
  useCdn: false,
  perspective: 'published',
})

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImage): ImageUrlBuilder {
  return builder.image(source)
}

/**
 * Fetch the landing page document for this site.
 *
 * SITE_ID is the document `_id`, which is also the site's folder name under
 * `sites/`. Kept in lockstep by scripts/new-site.mjs.
 */
export async function getLandingPage(): Promise<LandingPage> {
  const siteId = required('PUBLIC_SITE_ID', import.meta.env.PUBLIC_SITE_ID)

  const page = await client.fetch<LandingPage | null>(LANDING_PAGE_QUERY, {siteId})

  if (!page) {
    throw new Error(
      `No published landingPage document found with _id "${siteId}" in dataset "${dataset}". ` +
        `Open the Studio and publish it — an unpublished draft will not build.`,
    )
  }

  return page
}
