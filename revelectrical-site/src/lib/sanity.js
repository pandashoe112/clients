import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanity = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  useCdn: true
});

const builder = imageUrlBuilder(sanity);

// img(source, 900) -> a resized, auto-format URL. Always pass a width.
export function img(source, width, height) {
  if (!source) return '';
  let url = builder.image(source).width(width).auto('format').fit('crop');
  if (height) url = url.height(height);
  return url.url();
}

// Alt text lives on the image object in Sanity, not on the field using it.
export function alt(source) {
  return (source && source.alt) || '';
}
