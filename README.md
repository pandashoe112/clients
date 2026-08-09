# DUNK landing pages

Fast, static landing pages built with Astro, hosted on Netlify, with the hero and
SEO content editable in Sanity by the team.

One repo, one Sanity project, one Netlify project per client. After the one-time
setup below, adding a client is one command and a push — no Netlify UI, no
per-site webhook.

```
packages/landing-template/   shared components, styles and Sanity client
  scaffold/                  what a new site is copied from
studio/                      the Sanity Studio (schema lives here)
sites/<slug>/                one folder per client site
  site.json                  which Netlify project CI deploys it to
scripts/new-site.mjs         spins up a new site
.github/workflows/deploy.yml builds and deploys on push
```

Studio: **https://dunk-landing.sanity.studio/**

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

## Adding a client

```bash
npm run new-site -- --slug acme-plumbing --name "Acme Plumbing"
npm install
```

That creates the site folder, the Netlify project, `site.json`, and the Sanity
document. Then:

1. Open the Studio, add the logo, hero image and real copy, publish.
2. Build the sections in `sites/<slug>/src/sections/` and wire them into
   `src/pages/index.astro`. Delete `Example.astro`.
3. Commit and push. CI builds and deploys.
4. Point the domain, then turn off *Hide from search engines* in Sanity.

The slug is the single source of truth: folder name, npm workspace name,
`PUBLIC_SITE_ID`, and the Sanity document `_id` are all the same string.

## One-time setup

Done once for the whole repo, not per site.

**1. Local credentials**

```bash
netlify login
export SANITY_WRITE_TOKEN=...   # Sanity → project → API → Tokens (Editor)
```

**2. Repository secret**

`NETLIFY_AUTH_TOKEN` — Netlify → User settings → Applications → Personal access
tokens. Add it under GitHub → Settings → Secrets and variables → Actions.

**3. One Sanity webhook, covering every site**

Sanity → API → Webhooks → Create webhook:

| Field | Value |
| --- | --- |
| URL | `https://api.github.com/repos/pandashoe112/clients/dispatches` |
| Method | `POST` |
| Trigger on | Create, Update, Delete |
| Filter | `_type == "landingPage"` |
| Projection | `{"event_type": "sanity-publish", "client_payload": {"site": _id}}` |
| Headers | `Authorization: Bearer <github-token>`<br>`Accept: application/vnd.github+json` |

The GitHub token is a fine-grained PAT with **Contents: read and write** on this
repo. Because the projection sends the document `_id` and the slug *is* the
`_id`, this single webhook routes to the right site forever — new clients are
covered automatically with nothing to configure.

## How deploys work

Deploys go through the Netlify CLI with a token rather than Netlify's Git
integration, which is why adding a site never touches the Netlify UI.

`.github/workflows/deploy.yml` runs on three triggers, and
`.github/scripts/pick-sites.mjs` decides what to build:

- **push to `main`** — only the sites the commit touched. A change under
  `packages/` or to the lockfile rebuilds every site.
- **`repository_dispatch`** — from the Sanity webhook above, rebuilds the one
  site whose content was published.
- **manual run** — a slug, or `all`.

Sites are only eligible once `sites/<slug>/site.json` exists.

## Local development

```bash
cp sites/<slug>/.env.example sites/<slug>/.env
npm run dev --workspace=@sites/<slug>     # site on localhost:4321
npm run studio                            # Studio on localhost:3333
```

The dataset is public-read, so no API token is needed to build a site. Content is
read at build time only — nothing calls Sanity from the browser.

## The Studio

Schema lives in `studio/schemaTypes/landingPage.ts`. After changing it:

```bash
npm run studio:deploy
```

> The currently deployed Studio was published through the Sanity MCP connector as
> a stopgap, so its schema is managed by Sanity rather than by this repo. Running
> `npm run studio:deploy` once from a machine with `sanity login` makes this repo
> authoritative again. Do that before changing the schema, otherwise edits here
> and the live Studio will drift.

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
