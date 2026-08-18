// The business entity, in one place.
//
// Both layouts used to carry their own copy of this object, which is how the
// two drifted. It is also where the Google rich-results error came from: an
// Electrician is a LocalBusiness, and LocalBusiness requires a postal address.
// Without one the block validates against schema.org but is rejected for rich
// results on every page of the site.
//
// The address is deliberately locality-only. This is a service-area business -
// nobody visits the office - and Google's guidance for those is to give the
// area rather than a street someone might turn up at.
export const BASE_URL = 'https://www.revelectrical.com.au';

const ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Braybrook',
  addressRegion: 'VIC',
  postalCode: '3019',
  addressCountry: 'AU'
};

export const OG_IMAGE = BASE_URL + '/og-default.webp';

export function businessSchema(settings, { areaServed } = {}) {
  const sameAs = [settings.instagramUrl, settings.facebookUrl].filter(Boolean);
  return {
    '@context': 'https://schema.org',
    '@type': 'Electrician',
    // A stable @id so every page's block is understood as the same business
    // rather than 26 separate ones that happen to share a name.
    '@id': BASE_URL + '/#business',
    name: settings.businessName,
    legalName: 'Everything Electrification Pty Ltd',
    foundingDate: String(settings.established),
    telephone: settings.phoneHref.replace('tel:', ''),
    email: settings.email,
    url: BASE_URL + '/',
    image: OG_IMAGE,
    logo: BASE_URL + '/logo.webp',
    identifier: settings.licence,
    address: ADDRESS,
    areaServed: areaServed
      ? [{ '@type': 'Place', name: areaServed }]
      : [{ '@type': 'City', name: 'Melbourne' }],
    ...(sameAs.length ? { sameAs } : {}),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(settings.ratingValue),
      reviewCount: String(settings.reviewCount),
      bestRating: '5'
    }
  };
}
