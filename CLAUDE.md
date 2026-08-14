# CLAUDE.md — client project context

Context for Claude Code sessions working in this repo. Read this first.

The repo holds more than one client site, each its own folder, its own Sanity
project and its own Netlify project. They share nothing but the pattern:
an Astro site rendering content out of Sanity, built by Netlify.

| Client | Folder | Sanity | Netlify |
| ------ | ------ | ------ | ------- |
| Revelectrical | `revelectrical-site/` | `mt5betow` | `revelectrical-live` |
| DetailSplash | `detailsplash-site/` | `god0zlq8` | `detailsplash` |

Everything below is Revelectrical unless it says otherwise; DetailSplash has
its own section at the end and its own `detailsplash-site/README.md`.

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
| Site | https://www.revelectrical.com.au |
| Studio (client logs in here) | https://revelectrical-cms.sanity.studio/ |
| Netlify project | `revelectrical-live` (id `0cff14f1-eaaf-4e6e-b5b0-7666f3dc0c63`) |
| Repo | `pandashoe112/clients`, folder `revelectrical-site/` |

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

- **siteSettings** — single doc. Business details, rating, announcement bar, and
  the footer accreditation badges (`accreditations[]`: name, logo, optional url).
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

- Fill in content for the five remaining services and switch `hasPage` on.
- `npm audit` reports a dev-only esbuild/vite advisory and sharp/libvips CVEs.
  Neither is reachable from a static production build, and clearing them needs
  Astro 4 → 7. DetailSplash is on the same Astro 4, so upgrade them together.

## DetailSplash

A Melbourne mobile car detailing business (Lachie, 0401 600 471). One long
homepage plus a thank-you page. Full detail in `detailsplash-site/README.md`.

| What | Where |
| ---- | ----- |
| Site | https://detailsplash.com.au |
| Studio | https://detailsplash-cms.sanity.studio/ |
| Netlify project | `detailsplash` (id `b3ad7e37-c0dc-4e69-aaec-30eed0570d7d`) |
| Sanity | project `god0zlq8`, dataset `production`, workspace `detailsplash` |

It arrived as a single 2.5 MB `index.html` with all 16 photos inlined as
base64. The markup and CSS were kept as-is; the copy, prices, photos, reviews,
suburbs and FAQs moved into Sanity, and the photos now come off Sanity's CDN,
which took the page to 80 KB.

Same conventions as Revelectrical: MCP-managed schema (`deploy_schema` then
`deploy_studio`, appHost `detailsplash-cms`), public-read dataset so no build
token, `useCdn: false`, config read from both `import.meta.env` and
`process.env`.

Worth knowing:

- **The CMS is two documents: Home page and Site settings.** Services,
  packages, add-ons, gallery, reviews, areas and FAQs are inline lists inside
  the home page, not separate document types. Sanity cannot drop a type from a
  workspace, so the seven original document types are redeclared as object
  types — object types are not listed in the Studio, so they vanish from the
  navigation while the Studio keeps its URL. Their old documents are still in
  the dataset, unreferenced and invisible.
- **The packages section is an accordion, not a table.** One row per package,
  showing its price closed, and opening to a plain-English explanation, the
  price by vehicle size and the inclusion groups. Each package carries its own
  `inclusions`, so nothing is shared across packages any more.
- **It owns the `#packages` and `#ceramic` anchors.** The old pricing-cards
  section was removed and the header, footer and three CTAs still point at
  them, so they moved onto the accordion.
- **The copy contains real non-breaking spaces** (U+00A0) where the original
  had `&nbsp;`, which is what keeps headings breaking where they were designed
  to.
- **Structured data is generated from the same content the page renders**, and
  is escaped through the `ld()` helper in `Base.astro` — `JSON.stringify`
  leaves `<` alone, so a `</script>` typed into any CMS field would otherwise
  close the tag early and become live HTML.
- **The booking form is Netlify Forms**, detected by parsing the built HTML.
  It posts to `/thank-you/`, which Astro builds as a real page, so the old
  `_redirects` rule is gone. Netlify rewrites the form tag during
  post-processing, so the deployed HTML uses single quotes and drops the
  `data-netlify` attribute — that is what success looks like, not a bug.
- **The nav script lives in `public/js/nav.js`, not in a component.** Astro
  inlines small scripts, and an inline script needs `'unsafe-inline'` or a
  per-build hash in the CSP. Serving it as a file keeps `script-src` at
  `'self'`. Put new client-side JS there for the same reason.

### DetailSplash deploy wiring

Both halves are live, set up the same way Revelectrical is:

- **Code** — the project is linked to `pandashoe112/clients`, branch `main`,
  base directory `detailsplash-site`. Pushing to `main` deploys.
- **Content** — Sanity webhook `Netlify-rebuild` (`9mrcOLlKE1UdDfMk`) points at
  the Netlify build hook `Sanity rebuild`
  (`6a7f2972e99f0fd6bdf2273b`). Publishing in the Studio rebuilds the site;
  measured at about ten seconds end to end.

Neither the Netlify MCP nor the Sanity CLI can create these: the MCP has no
repo-link or build-hook operation, and `sanity hooks create` is interactive
only. They were made with the REST APIs — `PATCH /api/v1/sites/{id}` and
`POST /api/v1/sites/{id}/build_hooks` for Netlify, and
`sanity api hooks/projects/{id} -X POST --global` for Sanity, which borrows
the CLI's own credentials.

## Both sites

- **Each site skips builds that do not touch its folder.** The `ignore` line in
  each `netlify.toml` compares the push against that directory. The
  `INCOMING_HOOK_TITLE` guard in it is load-bearing: a build hook fires against
  the same commit as the last build, so without the guard the diff is empty and
  a content publish would be skipped and never reach the site. Verified by
  firing Revelectrical's hook and watching a new deploy appear.
- **Both carry a Content-Security-Policy**, and they are deliberately different.
  DetailSplash runs no third-party scripts so `script-src` is `'self'`.
  Revelectrical loads Google Tag Manager, whose loader is inline and which
  injects further scripts, so it needs `'unsafe-inline'`; what still earns its
  place there is `object-src`, `base-uri`, `frame-ancestors` and `form-action`.
  If tracking ever breaks after a CSP change, that header is the first suspect.
- **Both have a privacy policy** at `/privacy/`, linked in the footer. They are
  pages rather than CMS content: the business details come from site settings
  so they cannot go stale, but the legal wording stays in code. They are a
  template and have not been reviewed by anyone qualified.

## Applied already

`pending-updates/homepage-update/` has been applied to the site — its
`global.css`, `AnnounceBar`, `Hero` and `ServiceAreas`. Its `Reviews` and
`BrandGrid` were **not** applied: the repo versions are newer, reading the live
`photo` field and pulling brand logos from Sanity rather than `/public`. The
folder is kept only as a record.
