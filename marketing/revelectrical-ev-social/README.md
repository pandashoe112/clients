# Revelectrical — EV charging social posts

Four 1080×1350 posts for Instagram and Facebook, advertising home EV charger
installation across the suburbs the site has pages for.

| # | Board | What it does |
| - | ----- | ------------ |
| 01 | `png/01-offer.png` | The offer. Lead board of the carousel. |
| 02 | `png/02-service-areas.png` | The local hook — one chip per suburb with a page. |
| 03 | `png/03-review.png` | Proof. A real Google review, quoted as written. |
| 04 | `png/04-whats-included.png` | The closer. Answers "what am I paying for". |

`ev-charging-social-posts.html` is the same four boards on one page, fully
self-contained — fonts, photos and icons are all inlined, so it opens anywhere
with no network. Open it to review or to hand to someone else; use the PNGs to
post.

## Where the content comes from

Nothing here is invented. Copy is pulled from the live site: the tick lists and
the "what's included" items are the `diffItems` on `/services/ev-charging/`,
the suburb list and postcodes are the eleven suburb pages, the review is Prab
Pandher's Google review verbatim, and 5.0 / 52 reviews is site settings.
Colours and type are the tokens in `revelectrical-site/src/styles/global.css`.

The lime rule at the base of each board fills a quarter further on each one, so
posted in order they read as a sequence. It is the same charge-bar motif the
process steps use on the service pages.

Photos come from `revelectrical-site/public/photos/`. The review board is
cropped above the car's number plate deliberately — a customer's rego does not
belong on a social post.

## Regenerating

Run from this directory. Playwright and sharp are resolved out of
`revelectrical-site/node_modules`, so no separate install is needed.

```sh
node src/crops.mjs    # cut the four photo crops from the site's photo library
node src/build.mjs    # inline everything -> ev-charging-social-posts.html
node src/export.mjs   # render the four PNGs
```

Edit `src/template.html` for copy or layout changes, then re-run `build` and
`export`. Crops only need re-cutting if you swap a photo.

`src/fonts/` holds the six Outfit and Manrope weights the boards use, taken
from the `@fontsource` packages. They are committed so a rebuild does not need
the network — Google Fonts is blocked from the build environment anyway.

## Note on the folder

This sits outside `revelectrical-site/` and `detailsplash-site/` on purpose.
Each Netlify project skips builds that do not touch its own folder, so changes
in here never trigger a deploy of either site.

## Handover package

`handover/` is a standalone copy for anyone outside this repo — another Claude
session, a freelancer, the client. It carries the logo, both typefaces, all 24
job photos, the template, the build scripts, the four approved PNGs as a
reference to diff against, and three docs: `PROMPT.md` to paste into a fresh
Claude session, `BRAND.md` for the design system, and `HANDOVER.md` for how it
is built plus every trap that cost a render.

It depends on nothing in this repo. `npm install && npm run all` reproduces the
four PNGs pixel-identical to `handover/reference/` — verified, not assumed.

`revelectrical-ev-social-handover.zip` is that folder, zipped, for sending.
Rebuild it with:

```sh
cd marketing/revelectrical-ev-social
rm -f revelectrical-ev-social-handover.zip
zip -qr revelectrical-ev-social-handover.zip handover
```
