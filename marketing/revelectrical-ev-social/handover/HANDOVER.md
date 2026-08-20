# Revelectrical — EV charging social posts

Four 1080×1350 posts for Instagram and Facebook, advertising home EV charger
installation across the suburbs Revelectrical has pages for. Built, exported
and approved by the client.

| # | Board | Job it does |
| - | ----- | ----------- |
| 01 | The offer | Lead board. Charger on brick, three proof points, phone number. |
| 02 | Service areas | The local hook — one chip per suburb, with postcode. |
| 03 | The review | Proof. 5.0 from 52 Google reviews, one review quoted as written. |
| 04 | What's included | The closer. Answers "what am I actually paying for". |

Post them in order as a carousel or run them separately. The lime rule at the
base of each fills a quarter further per board, so a sequence reads as one.

## What is in here

```
PROMPT.md      paste this into a fresh Claude session
BRAND.md       colours, type, logo, motifs, tone
HANDOVER.md    this file
package.json   two dependencies, three scripts

src/template.html   the four boards, one file, with __PLACEHOLDERS__
src/crops.mjs       cuts the four photo crops from photos/
src/build.mjs       inlines fonts + photos -> ev-charging-social-posts.html
src/export.mjs      renders that HTML -> png/01…04.png

brand/         logo (webp + png), favicon, the six font files
photos/        24 EV and Evnex job photos to pick from
reference/     the four approved PNGs, and the built HTML
```

## Rebuilding

```sh
npm install
npm run all
```

`crops` → `build` → `export`. Output lands in `ev-charging-social-posts.html`
and `png/`. Compare against `reference/` — identical is the pass condition.

Chromium comes with the `playwright` install. If you are in a sandbox that
already has one, point `chromium.launch()` at it with `executablePath`.

## How it is put together, and why

**One HTML file holds all four boards** at true 1080×1350, scaled down by a few
lines of JS to fit whatever width the page gets. The export undoes that scale
and screenshots each board at full size. So the file you review and the PNGs
you post are the same artwork — there is no separate "design" and "export"
version to drift apart.

**Everything is inlined as data URIs.** Fonts, photos, icons. The result is one
portable file with no network dependency, which matters because a font that
loads late renders the whole board in Arial and you find out after posting.

**Copy is pulled from the live site, not written fresh.** The tick lists and the
"what's included" items are the why-us points on `/services/ev-charging/`. The
suburbs and postcodes are the eleven live suburb pages. The review is Prab
Pandher's Google review, verbatim. 5.0 / 52 is site settings.

**Text lives in `src/template.html`; the photo crops live in `src/crops.mjs`.**
Change copy in one, framing in the other, then re-run.

---

## Traps. Every one of these cost me a render.

**Cut each crop at the ratio the board renders it at, not a convenient one.**
The service-areas strip displays at 936×330 — about 2.84:1. I first supplied it
as 1080×660, and `object-fit: cover` cropped it a *second* time in the browser,
which took the top off the driver's head. Work out the displayed box, cut to
that ratio, and supply it at 2× for sharpness.

**A `<span>` with a `height` renders nothing.** The bars under each search term
are spans. Without `display: block` they are inline, `height` does not apply,
and they silently vanish. They looked fine in the code and were absent from the
image.

**Scale bars against a fixed maximum, not each row's own.** Board 2's bars are
sized against the largest term. Scale each row against itself and "+217% on six
impressions" draws the longest bar on the board, which is a lie told with
geometry.

**Element screenshots round up.** A fractional page offset gives you a
1080×1351 PNG. `export.mjs` trims every board back to exactly 1080×1350 with
sharp, because platforms are fussy and a one-pixel difference between four
images in a carousel shows.

**The page re-fits itself on `document.fonts.ready`.** If you reset the CSS
scale before that fires, it gets re-applied and the boards export at the wrong
size. `export.mjs` unscales, waits 300ms, and unscales again.

**Check the photo for things that are not yours to publish.** `ev-garage-car`
has the customer's number plate in the lower left. The crop in `crops.mjs`
stops above it deliberately. Before you use a new photo, look at the whole
frame: plates, house numbers, faces, mail.

**A scrim needs more than two stops.** Board 1 is a full-bleed photo with the
headline over it. A single fade either washed out the charger at the top or
left the type unreadable at the bottom. It takes four stops: nearly clear
through the top third so the product keeps its light, then a hard ramp to solid
ink under the copy.

**Two-line labels want a left-aligned icon row, not centred text.** When the
tiles got icons, the centred labels left the second line hanging under the
icon. Icon left, text beside it, `justify-content: flex-start`.

---

## The client

Blunt, fast, and right. What he pushed back on, which is worth knowing before
you show him anything:

- **Headings must say what the thing is.** He had every "clever" heading on the
  website rewritten. A heading that needs the paragraph under it to make sense
  is a failed heading.
- **Less body copy.** If it can be a heading, a number or a chip, it should not
  be a sentence.
- **Never state something the data does not support.** He caught two of these
  in a report: a per-item split I had inferred from a total, and a "first ever"
  claim resting on one week of history. Both were removed rather than reworded.
  If you find yourself softening a claim instead of deleting it, delete it.
- He will tell you plainly when it is wrong. Fix the thing he pointed at, not
  the wording around it.
