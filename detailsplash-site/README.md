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
| Site | https://detailsplash.netlify.app |
| Studio (client logs in here) | https://detailsplash-cms.sanity.studio/ |
| Netlify project | `detailsplash` (id `b3ad7e37-c0dc-4e69-aaec-30eed0570d7d`) |
| Sanity project | `god0zlq8`, dataset `production`, workspace `detailsplash` |
| Repo | `pandashoe112/clients`, folder `detailsplash-site/` |

Custom domain `detailsplash.com.au` is **not** pointed at the site yet.

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

Nine document types, all MCP-managed. Change them with `deploy_schema`, then
re-run `deploy_studio` (appHost `detailsplash-cms`) so the Studio picks up the
new fields.

- **siteSettings** — one doc. Business name, phone, email, logo, rating,
  announcement bar, footer copy.
- **homePage** — one doc, grouped in the Studio by page section (SEO, Hero,
  Intro, Compare, Packages, Add-ons, Club, How it works, Why us, Our work,
  Service areas, FAQs, Booking form).
- **package** — the four priced offerings. `vehiclePrices` drives both the
  package card and the What is included section, so a price is only ever
  edited once. `shortText` is the one-line summary under the title and
  `plainEnglish` is the jargon-free explanation shown when a row is opened.
- **service** (6), **addon** (4), **galleryItem** (8), **review** (10),
  **areaGroup** (4), **faq** (12).

## The What is included section

`Included.astro` replaced the old side-by-side comparison table. It is an
accordion: one numbered row per package, each opening to a plain-English
explanation, the price by vehicle size, and the inclusion list.

The inclusion lists are not typed twice. They are read out of the homepage's
`compareGroups` — the same Interior / Exterior / Protection rows the table
used — and split per package by the `inFirst` / `inSecond` flags, with
`comparePackages` deciding which package each flag belongs to. Packages
outside that pair (the two coatings) fall back to their own `features` list.
So ticking a row on or off in the Studio still updates the right package, and
the two can't drift apart.

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
