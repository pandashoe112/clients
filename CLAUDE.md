# CLAUDE.md — Revelectrical project context

Context for Claude Code sessions working on the Revelectrical website and its
Sanity CMS. Read this first.

## What this is

**Revelectrical** — a licensed Melbourne residential electrician (EV chargers,
solar batteries, heat-pump hot water, switchboards, lighting). Site:
https://www.revelectrical.com.au/

The project has two halves:

1. **Content — Sanity CMS** (editable *right now* from this session via the
   Sanity MCP tools).
2. **Frontend — an Astro site** (`revelectrical-site`) that reads from Sanity
   and renders the pages. **The Astro source is NOT in this repo yet** — see
   "Known gaps" below.

## Sanity project

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| Project ID     | `mt5betow`                             |
| Organization   | `oKIL2aLz6`                            |
| Dataset        | `production` (public read ACL)         |
| Studio         | https://revelectrical-cms.sanity.studio/ (workspace `revelectrical`) |
| Account        | oliver@dunk.agency (Google)            |

### Deployed schema (document types)

- **siteSettings** — single doc. `businessName, phone, phoneHref, email,
  licence, established, ratingValue, reviewCount, announcementText,
  announcementCtaLabel`.
- **homePage** — single doc. `seoTitle, seoDescription, heroHeadingStart,
  heroHeadingHighlight, heroHeadingEnd, heroTicks[], heroIntro, heroImage,
  featureItems[], servicesHeading`.
- **service** — `title, slug, summary, icon (ev|battery|hotwater|lighting|
  switchboard|induction), order`. 6 docs.
- **review** — `authorName, reviewedAt, rating, body`. 9 docs.
  ⚠️ The deployed schema does **not** yet have the `avatar` (Profile photo)
  field — see "Pending updates".
- **suburb** — `name, postcode, order`. 29 docs (service-area list).
- **galleryItem** — `image, caption, order`. 8 docs.

## How to make regular content edits (works today)

Content edits go straight to Sanity via MCP — no site checkout needed. Common
tasks:

- **Change business details / phone / announcement** → patch the single
  `siteSettings` doc.
- **Edit hero copy or homepage SEO** → patch the single `homePage` doc.
- **Add / edit / reorder services** → `service` docs (`order` controls order).
- **Add / edit reviews** → `review` docs.
- **Add / remove service-area suburbs** → `suburb` docs.
- **Gallery photos** → `galleryItem` docs.

Workflow rules:
- Always `get_schema` (workspace `revelectrical`) before writing.
- The schema is now **MCP-managed**, so schema changes are made from a Claude
  session with `deploy_schema` + `deploy_studio` — no local machine needed.
  After `deploy_schema`, re-run `deploy_studio` (appHost `revelectrical-cms`)
  so the Studio picks the new fields up.
- The `sanity/` folder in this repo is now a reference copy, not the live
  source. Keep it in step with what you deploy, but the deployed schema wins.
- Edits create **drafts**; use `publish_documents` to make them live, or tell
  the user you've staged a draft for them to review in the Studio.
- To find a doc's `_id` first: `query_documents` with a GROQ filter.

## Pending updates (`pending-updates/homepage-update/`)

A partial frontend patch the user uploaded, preserved here in version control.
It is meant to be copied into the real `revelectrical-site` project (it
references files not included here, e.g. `Icon.astro`, `Stars.astro`,
`lib/sanity.js`). See its `WHAT-CHANGED.txt`. Summary:

- Restores the lime announcement bar + styled CTA link, hero background wash,
  bigger feature headings, brand-logo styles, review-photo styles.
- `BrandGrid.astro` renders brand **logos** (evnex, zappi, fox/foxess,
  sigenergy, goodwe) from `/public/brand-*.webp` instead of text.
- `Reviews.astro` shows a profile photo when a review has one.
- `review.ts` adds an **optional `avatar` (Profile photo)** field.

To apply it, the user must (in the real site repo + Studio):
1. Copy `src/`, `public/`, `sanity/` over their site.
2. Deploy the schema change from their **local Studio** with
   `npx sanity@latest schema deploy` (or `sanity deploy`).
   (Superseded: the schema is MCP-managed now, so deploy it with
   `deploy_schema` + `deploy_studio` from a session instead.)
3. In the Studio: swap the Hero photo to the downlight shot; upload Google
   profile photos for reviews by Brandon Grant, Chris Peers, Prab Pandher,
   Justin Fennessy.

## Known gaps

- **The Astro site source is not in this repo.** To let Claude edit the site
  code (components, pages, styles) and the Studio schema directly, the full
  `revelectrical-site` project needs to be pushed to this repo (or another
  repo added to the session). Until then, Claude can edit **content** via
  Sanity MCP but cannot change how the site looks/behaves.

## Repo / branch

- Repo: `pandashoe112/clients`.
- Work branch: `claude/sanity-project-setup-sy7buv`.

## Service landing pages

`src/pages/services/[slug].astro` is one template that builds a page for every
service whose **Has a landing page** toggle is on. Sections: hero + quote form,
guarantee, steps, why-us, our work, brands, FAQs, related services, final CTA.
Styles live in `src/styles/service.css`, markup in the ten `Service*`/`Diff*`/
`Faq*`/`Rel*`/`FinalCta` components.

- Live so far: **ev-charging**. The other five have the fields but `hasPage`
  off, so they do not build until their content is filled in.
- `ServiceBase.astro` emits canonical + `Electrician` + `FAQPage` structured
  data, so FAQs are eligible for a Google rich result.

## Environment note

This sandbox's egress policy **blocks `*.sanity.io`**, so `npm run build`
cannot fetch content here — it fails at the network call. Netlify's build
servers are not restricted. To check rendering locally, temporarily swap
`src/lib/sanity.js` for a fixture (see git history) and restore it after.

## Netlify

- Project `revelectrical-site` (id `5c860da9-591c-4efd-80df-ea04600a5c09`),
  team DUNK Agency. `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET`
  are already set on it.
- An older project `revelectrical` holds a one-off manual upload; it is not
  git-connected and has no env vars.
- Still to do: connect the GitHub repo (base directory `revelectrical-site`)
  and add a build hook into Sanity so publishing rebuilds the site.
