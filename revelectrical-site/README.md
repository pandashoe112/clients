# Revelectrical site

Astro front end, Sanity CMS, deployed on Netlify. The design lives in code. The client
only ever edits text and images through named fields, so there is nothing they can
reorder, restyle or break.

## How it fits together

```
sanity/          the CMS the client logs into
src/components/  the design system, one file per section
src/pages/       pages that assemble components and pull content from Sanity
src/styles/      one stylesheet, all tokens and component classes
public/          logo, favicon and the service icons
```

A page is a fixed template. `src/pages/index.astro` lists the sections in order and
hands each one its content. The client cannot add or move sections. If they need a
section moved, that is a code change, which is the point.

## First-time setup

```bash
npx sanity login             # if you are not already logged in
npx sanity projects list     # copy your project ID
bash setup.sh YOUR_PROJECT_ID
```

That writes the project ID into the studio config and `.env`, installs both apps, and
imports every document plus all eight photos from `sanity/import/content.ndjson`.

The import ships the site fully populated: site settings, the whole homepage, six
services, 29 suburbs, nine reviews and the eight gallery photos. `--replace`
overwrites documents with matching IDs, so re-running it is safe on a fresh dataset
but will overwrite client edits on a live one.

If the image upload fails, it is almost always the relative paths in the ndjson. Run
the import from inside `sanity/` (which `setup.sh` does) so `./images/...` resolves.

### Netlify

Connect the repo. Build command `npm run build`, publish directory `dist`.
Add `PUBLIC_SANITY_PROJECT_ID` and `PUBLIC_SANITY_DATASET` as environment variables.

Add a deploy hook in Netlify, then paste it into Sanity under API, Webhooks, so that
publishing in the studio rebuilds the site. Without this the client publishes and
nothing changes, which is the first support call you will get.

## What the client sees

Left-hand menu in the studio:

- **Homepage** — one form, grouped into SEO, Hero, Page sections, Contact
- **Site settings** — phone, email, licence, rating, review count, announcement bar
- **Services** — six entries, each with a title, summary and an icon from a fixed list
- **Gallery** — photos with captions
- **Reviews** — name, date, rating, text
- **Suburbs** — name and postcode

Guard rails are in the schema, not in a document nobody reads. The feature strip
demands exactly four items. Captions cap at 40 characters. Icons are a dropdown, not
a free text field. Every image requires alt text before it will publish.

## Adding a new page type

1. New schema in `sanity/schemaTypes/`, registered in `index.ts`
2. New file in `src/pages/`, importing the components it needs
3. Reuse existing components wherever possible

For something like suburb landing pages, use `getStaticPaths` in a
`src/pages/[suburb].astro` file and generate all 29 from the suburb documents. That
is the payoff of this setup: 29 pages become one template.

## Notes

- The contact form posts to `/thank-you` and is handled by Netlify Forms. File uploads
  need Netlify Forms with file uploads enabled on the site.
- Images are served through Sanity's CDN, resized and format-converted per request.
  Replace the low resolution photos currently in use with originals when you have them.
- Analytics and Google Ads tags go in `src/layouts/Base.astro`.
- Colours, type and spacing all come from the custom properties at the top of
  `src/styles/global.css`. Change them there and the whole site follows.
