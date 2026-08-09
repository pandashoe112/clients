# CLAUDE.md — Revelectrical project context

Context for Claude Code sessions working on the Revelectrical website and its
Sanity CMS. Read this first.

## What this is

**Revelectrical** — a licensed Melbourne residential electrician (EV chargers,
solar batteries, heat-pump hot water, switchboards, lighting).

Two halves, both editable from a session:

1. **Content** — Sanity CMS, edited via the Sanity MCP tools.
2. **Frontend** — an Astro site in `revelectrical-site/`, built and deployed by
   Netlify from the `main` branch.

## Live URLs

| What | Where |
| ---- | ----- |
| Site | https://revelectrical-live.netlify.app |
| Studio (client logs in here) | https://revelectrical-cms.sanity.studio/ |
| Netlify project | `revelectrical-live` (id `0cff14f1-eaaf-4e6e-b5b0-7666f3dc0c63`) |
| Repo | `pandashoe112/clients`, folder `revelectrical-site/` |

Custom domain `revelectrical.com.au` is **not** pointed at the site yet.

## How changes reach the live site

- **Code** — push to `main`. Netlify builds from base directory
  `revelectrical-site`, publish directory `revelectrical-site/dist`.
- **Content** — publish in the Studio. A Sanity webhook (`Netlify-rebuild`,
  hook id `VW5qnGaNDvrQ7zUb`) pings a Netlify build hook, so publishing
  rebuilds the site on its own. Verified working.

Work on `claude/sanity-project-setup-sy7buv`, then merge to `main` to deploy.

## Sanity project

| Field | Value |
| ----- | ----- |
| Project ID | `mt5betow` |
| Organization | `oKIL2aLz6` |
| Dataset | `production` (public read ACL) |
| Workspace | `revelectrical` |
| Account | oliver@dunk.agency (Google) |

The schema is **MCP-managed**: change it with `deploy_schema`, then re-run
`deploy_studio` (appHost `revelectrical-cms`) so the Studio picks the new
fields up. No local machine needed. `revelectrical-site/sanity/` is a
reference copy — the deployed schema wins, but keep the two in step.

### Document types

- **siteSettings** — single doc. Business details, rating, announcement bar.
- **homePage** — single doc, grouped into SEO / Hero / Page sections / Contact.
- **service** — card fields plus a full landing-page set behind `hasPage`.
- **review** — `authorName, reviewedAt, rating, body, photo`.
- **suburb** — 29 docs, the service-area list.
- **galleryItem** — 8 docs.

Edits create **drafts**; `publish_documents` makes them live (and triggers a
rebuild). Always `get_schema` before writing, and `query_documents` to find a
doc's `_id`.

## Service landing pages

`src/pages/services/[slug].astro` builds a page for every service whose
**Has a landing page** toggle is on. Sections: hero + quote form, guarantee,
steps, why-us, our work, brands, FAQs, related services, final CTA. Styles in
`src/styles/service.css`.

- Live: **ev-charging**. The other five have the fields but `hasPage` off.
- `ServiceBase.astro` emits canonical + `Electrician` + `FAQPage` structured
  data.

## Things that have bitten before

- **`useCdn` is `false`** in `src/lib/sanity.js`, deliberately. With it on, a
  build could fetch cached content and ship a stale page — that is what made a
  swapped hero photo appear not to take.
- **Sanity config is read from `import.meta.env` *and* `process.env`.** Netlify
  injects the variables where `import.meta.env` did not surface them, and the
  build died with `Configuration must contain projectId`.
- **Verify Netlify env vars after setting them.** `manage-env-vars` reported
  success while the list came back empty; the build then failed.
- **Check the hero slot, not the whole page.** An image can appear in the
  gallery while the hero still holds the old one.

## Environment

The cloud environment's network policy is **Custom**, allowing `*.sanity.io`,
`*.netlify.com` and `*.netlify.app` alongside the default package registries.
`npm run build` therefore fetches live content from a session. If a build ever
dies at the network call, that policy has been narrowed — see
https://code.claude.com/docs/en/cloud-environments.

`SANITY_OFFLINE=1` builds from the committed snapshot in
`src/lib/content-cache.json` instead of the network. Off by default; the
snapshot goes stale, so treat it as a fallback, not a source of truth.

## Still to do

- Point `revelectrical.com.au` at the Netlify project.
- Clear the stray branch name out of the functions-directory field in the
  Netlify deploy settings.
- Fill in content for the five remaining services and switch `hasPage` on.

## Applied already

`pending-updates/homepage-update/` has been applied to the site — its
`global.css`, `AnnounceBar`, `Hero` and `ServiceAreas`. Its `Reviews` and
`BrandGrid` were **not** applied: the repo versions are newer, reading the live
`photo` field and pulling brand logos from Sanity rather than `/public`. The
folder is kept only as a record.
