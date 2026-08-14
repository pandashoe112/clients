# detailsplash-site

The DetailSplash website. An Astro site that renders one long homepage from
content held in Sanity, built and deployed by Netlify.

It started life as a single 2.5 MB `index.html` with every photo inlined as
base64. The markup and CSS are carried over as-is; what changed is that the
copy, prices, photos, reviews, suburbs and FAQs now come out of the CMS, and
the photos are served from Sanity's image CDN instead of being embedded.

## Where things live

| What | Where |
| ---- | ----- |
| Site | https://detailsplash.com.au |
| Studio (client logs in here) | https://detailsplash-cms.sanity.studio/ |
| Netlify project | `detailsplash` (id `b3ad7e37-c0dc-4e69-aaec-30eed0570d7d`) |
| Sanity project | `god0zlq8`, dataset `production`, workspace `detailsplash` |
| Repo | `pandashoe112/clients`, folder `detailsplash-site/` |

## Running it

```sh
npm install
PUBLIC_SANITY_PROJECT_ID=god0zlq8 PUBLIC_SANITY_DATASET=production npm run dev
```

Or copy `.env.example` to `.env`. The dataset is public-read, so no token is
needed to build.

## How changes reach the live site

- **Code** — push to `main`. Netlify builds from base directory
  `detailsplash-site`, publish directory `detailsplash-site/dist`.
- **Content** — publish in the Studio, which pings a Netlify build hook and
  rebuilds the site on its own.

## The schema

Two document types, both MCP-managed. Change them with `deploy_schema`, then
re-run `deploy_studio` (appHost `detailsplash-cms`) so the Studio picks up the
new fields.

- **siteSettings** — one doc. Business name, phone, email, logo, rating,
  announcement bar, footer copy.
- **homePage** — one doc holding the entire page, grouped in the Studio by
  section (SEO, Hero, Intro, Services, Packages, Add-ons, Club, How it works,
  Why us, Our work, Service areas, FAQs, Booking form).

The lists that used to be their own document types are inline arrays on the
home page: `services` (6), `packages` (4), `addons` (4), `gallery` (8),
`reviews` (10), `areas` (4), `faqs` (12). Array order is display order, so
reordering is a drag rather than an `order` field.

Sanity has no way to delete a type from a workspace. The seven original
document types are therefore redeclared as **object** types, which the Studio
does not list, so they disappear from the navigation while the Studio keeps
its URL. Their old documents are still in the dataset, unreferenced.

## The packages section

`Included.astro` replaced both the side-by-side comparison table and the
pricing cards that used to sit under it. It is an accordion: one numbered row
per package showing its price closed, opening to a plain-English explanation,
the price by vehicle size, and the inclusion groups.

Each package carries its own `inclusions` — an array of groups, each with a
heading and a list. Nothing is shared between packages, so editing one cannot
affect another.

The section owns the `#packages` and `#ceramic` anchors, because the header,
footer and three CTAs point at them and the section that used to hold them is
gone. `#ceramic` lands on the first package with no `vehiclePrices`.

Rows are `<details>`/`<summary>`, so they open without JavaScript and are
keyboard operable. The closing word of the heading is picked out in the accent
colour by the template, so it follows whatever the client types.

## Things worth knowing

- **`useCdn` is `false`** in `src/lib/sanity.js`, deliberately. With it on, a
  build can fetch cached content and ship a stale page.
- **Sanity config is read from `import.meta.env` *and* `process.env`.** Netlify
  does not always surface variables through `import.meta.env` at build time,
  and the build dies with `Configuration must contain projectId`.
- **The copy contains real non-breaking spaces** (U+00A0) where the original
  markup had `&nbsp;`. They are what keeps headings breaking where they were
  designed to. Editing copy in the Studio is fine; just be aware the odd space
  is not a normal one.
- **The vehicle size switcher is pure CSS** — three radio inputs and sibling
  selectors, no JavaScript. `vehicleSizes` on the homepage and `vehiclePrices`
  on each package have to stay in the same order.
- **Icons are keys, not files.** `src/components/Icon.astro` holds three sets
  lifted from the original page: `svc` (two-tone, services grid), `addon` and
  `feature`. The Studio dropdown lists only the keys valid for that type.

## The booking form

Netlify Forms, detected by parsing the deployed HTML at build time. The form
needs its `name`, the `data-netlify` flag and the hidden `form-name` field to
agree, plus the `bot-field` honeypot — see `src/components/BookForm.astro`.
Submissions land in the Netlify dashboard under **booking** and are emailed on
each submission. It posts to `/thank-you/`, which Astro builds as a real page,
so the old `_redirects` rule is not needed.
