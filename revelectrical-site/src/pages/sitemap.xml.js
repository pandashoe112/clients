import { sanity } from '../lib/sanity.js';

// Built from the same content the pages are, so a service or suburb that gets
// its landing page switched on in the Studio appears here on the next build.
// /thank-you/ is left out deliberately: it is noindex.
export async function GET() {
  const { services, areas } = await sanity.fetch(`{
    "services": *[_type == "service" && hasPage == true && defined(slug.current)]{ "slug": slug.current },
    "areas": *[_type == "suburb" && hasPage == true && defined(slug.current)]{ "slug": slug.current }
  }`);

  const base = 'https://www.revelectrical.com.au';
  const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/about/', priority: '0.7' },
    { loc: '/service-areas/', priority: '0.8' },
    ...services.map((s) => ({ loc: `/services/${s.slug}/`, priority: '0.9' })),
    ...areas.map((a) => ({ loc: `/electrician-${a.slug}/`, priority: '0.8' }))
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${base}${u.loc}</loc>
    <changefreq>monthly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
