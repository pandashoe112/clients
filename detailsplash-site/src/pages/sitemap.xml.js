import { sanity } from '../lib/sanity.js';

// Two pages, so the sitemap is written out directly rather than pulling in an
// integration. The host follows the Site URL in the CMS.
export async function GET() {
  const settings = await sanity.fetch('*[_type == "siteSettings"][0]{ siteUrl }');
  const site = (settings?.siteUrl || 'https://www.detailsplash.com.au').replace(/\/$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${site}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
