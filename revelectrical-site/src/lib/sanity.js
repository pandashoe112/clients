import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import cache from './content-cache.json';

const client = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID,
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-10-01',
  useCdn: false
});

function fromCache(query, params) {
  if (query.includes('hasPage == true')) return [{ slug: 'ev-charging' }];
  if (query.includes('"service":')) {
    return {
      settings: cache.settings,
      service: cache.evService,
      services: cache.services,
      brands: cache.page.brands,
      gallery: cache.gallery.slice(0, 3)
    };
  }
  if (query.includes('siteSettings') && !query.includes('"page"')) return cache.settings;
  return cache;
}

const OFFLINE = process.env.SANITY_OFFLINE === '1';

export const sanity = {
  fetch: async (query, params) => {
    if (OFFLINE) return fromCache(query, params);
    return client.fetch(query, params);
  }
};

const builder = imageUrlBuilder(client);

export function img(source, width, height) {
  if (!source) return '';
  let url = builder.image(source).width(width).auto('format').fit('crop');
  if (height) url = url.height(height);
  return url.url();
}

export function alt(source) {
  return (source && source.alt) || '';
}
