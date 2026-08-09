# DUNK landing pages

Fast, static landing pages built with Astro, hosted on Netlify, with the hero and
SEO content editable in Sanity by the team.

One repo, one Sanity project, one Netlify site per client.

```
packages/landing-template/   shared components, styles and Sanity client
  scaffold/                  what a new site is copied from
studio/                      the Sanity Studio (schema lives here)
sites/<slug>/                one folder per client site
scripts/new-site.mjs         spins up a new site
```

## What the team can edit, and what they cannot

Editable in Sanity — the same seven groups on every site:

| Group | What is in it |
| --- | --- |
| SEO | meta title, meta description, canonical URL, social share image, noindex toggle |
| Tracking | Google Ads conversion ID and label, GA4 measurement ID |
| Header | logo, nav links, availability chip, button label |
| Hero | eyebrow, headline, sub-copy, tick list, background image, buttons, review badge |
| Quote form | heading, sub-copy, dropdown options, button label, footnote |
| Thank you | heading, sub-copy, "what happens next" list |
| Business | name, phone, email, ABN, address, service area, about text, legal links |

Everything below the hero — services, brands, process, gallery, reviews — is code
in `sites/<slug>/src/sections/`. That is deliberate. Those sections differ
structurally per client, and making them editable turns this into a page builder.

## Spinning up a new site

```bash
npm run new-site -- --slug acme-plumbing --name "Acme Plumbing"
npm install
```

Then:

1. **Sanity** — open the Studio, add the logo, hero image and real copy, publish.
2. **Sections** — build `sites/<slug>/src/sections/` and wire them into
   `src/pages/index.astro`. Delete `Example.astro`.
3. **Netlify** — create a site from this repo with **base directory**
   `sites/<slug>`. The build command, publish directory and environment variables
   all come from that site's `netlify.toml`.
4. **Rebuild on publish** — add a Netlify build hook, then a Sanity webhook
   filtered to `_id == "<slug>"` pointing at it. Publishing that document rebuilds
   only that site.
5. **Go live** — point the domain, then turn off *Hide from search engines* in
   Sanity.

The slug is the single source of truth: folder name, npm workspace name,
`PUBLIC_SITE_ID`, and the Sanity document `_id` are all the same string.

## Local development

```bash
cp sites/<slug>/.env.example sites/<slug>/.env
npm run dev --workspace=@sites/<slug>     # site on localhost:4321
npm run studio                            # Studio on localhost:3333
```

The dataset is public-read, so no API token is needed to build a site. Content is
read at build time only — nothing calls Sanity from the browser.

## The Studio

```bash
npm run studio          # local
npm run studio:deploy   # deploys to dunk-landing.sanity.studio
```

Schema changes live in `studio/schemaTypes/landingPage.ts`. After changing it, run
`npm run studio:deploy` so the hosted Studio picks it up.

## Forms

Both quote forms post to Netlify Forms under a single form name, `quote`, so all
leads land in one inbox. A hidden `form_location` field records whether the lead
came from the hero or the footer form, and hidden fields capture `gclid` and the
UTM parameters off the landing URL.

Submissions redirect to `/thank-you/`, which is the URL to use as the Google Ads
conversion trigger. When the Ads conversion ID and label are filled in in Sanity,
that page fires the conversion event itself.

Turn on submission notifications per site in Netlify under
**Forms → Settings → Form notifications**.

## Images

- **Logo, hero and social share image** come from Sanity and are served from its
  CDN with `auto=format`, so browsers get WebP or AVIF automatically.
- **Section images** live in `sites/<slug>/src/assets/images/` and go through
  Astro's `<Image>` component, which resizes and converts them at build time.

Do not inline images as base64 data URIs — it defeats browser caching and inflates
the HTML, which costs you directly on paid traffic.
