import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

// Netlify does not always surface variables through import.meta.env at build
// time, so read process.env as well. Same fix as the revelectrical site.
const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  // Deliberately off. With the CDN on, a build can pick up cached content and
  // ship a stale page, which makes a swapped photo look like it did not take.
  useCdn: false
});

export const sanity = client;

const builder = imageUrlBuilder(client);

// Sized, format-optimised image URL. Height is optional.
export function img(source, width, height) {
  if (!source) return '';
  let url = builder.image(source).width(width).auto('format').fit('crop');
  if (height) url = url.height(height);
  return url.url();
}

// A CSS background-image value for the sections that use one.
export function bg(source, width, height) {
  const url = img(source, width, height);
  return url ? `--bg-img:url(${url})` : '';
}
