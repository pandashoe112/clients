# DUNK — split hero variant

A single self-contained HTML page (`index.html`): the DUNK marketing site with the
split hero layout. Photos are inlined as base64, so the file is large but opens
straight from disk with no build step and no network.

Open it with `open index.html`, or serve the folder with any static server.

## Hero background

The hero panel is built from three layers, all in the `.hero` / `.hero::after`
rules near the "split hero" comment in the `<style>` block:

1. **Base** — `#1C1729`, a deep plum-black. Deliberately *not* neutral black:
   a flat `#111116` swallowed the dot texture, and full purple was too much.
   This sits between the two so the dots read everywhere.
2. **Purple bloom** — a radial gradient anchored off the bottom-left corner
   (`#3A1C74` → `#2A1458`), fading to transparent at 68%.
3. **Dot texture** — `.hero::after`, a 26px dot grid. It covers the whole panel
   (`inset:0`) and its mask floor never reaches zero: the far edges hold at
   60% so the grain carries across the full background instead of dying in the
   bottom-left corner.

Turning any of these down again means touching all three together — the dot
alpha is tuned against that specific base colour, so a darker base needs
brighter dots to stay visible.

## Hero photo

The photo in `.hero__media-card` is inlined as a base64 JPEG. It was cropped
from a 1672×941 source down to 1255×941 — an exact 4:3 window, taken at
x=150 so the framing loses the pencil pot and laptop on the right rather
than crowding either subject.

Because the crop is already exactly 4:3 and the card is `aspect-ratio:4/3`,
`object-fit:cover` has nothing left to trim: the framing is identical at
every viewport. Re-cropping means redoing the source crop, not nudging
`object-position`.

Note `.hero__media` still carries the previous full-bleed photo as a
base64 `background-image`, and this variant hides it
(`.hero__media,.hero__scrim{display:none}`). It is dead weight in the file
and could be dropped if this layout is the one that ships.

## Sections

Order inside `.shell`: hero → approach (01) → picker (02) → suite (03) →
faq (04) → cta. The eyebrow numbers are hand-written, so inserting a
section means renumbering the ones after it.

`.suite` is the four-service grid. Each service is a `.suite__row` — a
two-column grid holding a `.suite__copy` card and a `.suite__art` panel.
Copy always comes first in the DOM so the single-column order reads
service-then-artwork; `:nth-child(even) .suite__copy{order:2}` does the
zig-zag on desktop and the mobile query resets it.

The art panels are pure CSS: four stacked `radial-gradient`s over a
`linear-gradient` base, plus a 3px dot grid at `mix-blend-mode:overlay`
for grain — one shared gradient across all four panels. Floating on each
is a `.ui` tile mocking that channel's actual
surface — a Google Ads campaign table, Meta's Ads Manager with delivery
toggles, an organic result on a search page, and a referring-domains
list. All CSS and inline SVG, no images.

The Google and Meta marks are the real logos, supplied by the client and
inlined as base64 WebP. They were downscaled first: the Meta source was
3840x2551 and 80 KB for an 18px mark, so both are re-encoded at 72px tall
(9 KB the pair). Re-encode rather than restyle if they ever need to be
bigger.

**Every figure in those tiles is invented**, and the tiles are
`aria-hidden="true"` so none of it reaches a screen reader as fact. So
are the names: the referring domains, the SERP competitor, and
**`summitwindowcare.com.au` in the SEO tile — that is a placeholder, not
a client.** Swap in the real client and real numbers, or label them as
illustrative, but do not ship them as case-study data.

`.cta` is the footer CTA: a gradient bleed with a near-black panel inset
by the section padding. `.cta__arc` is the soft sweep — one wide ellipse
centred *below* the panel, sized in percentages of the panel box so its
glowing edge always crosses the frame. It also carries `id="contact"`,
which is what the four existing `href="#contact"` links in the nav, FAQ
and mobile drawer were pointing at with nothing there.

### A trap this file sets twice

`.hero > *` and `.cta__panel > *` both set `position:relative;z-index:1`
on every direct child. At one class of specificity they beat any earlier
single-class rule, so they silently flattened the nav's `z-index:40` and
killed the arc's `position:absolute`. Both are now scoped around
(`.hero > .nav`, `> *:not(.cta__arc)`). If something inside a section
mysteriously loses its positioning, check for a `> *` rule first.

## The three light tones

`--page` `#EFEEEB` (the ground) → `--paper` `#F5F4F1` (the light sections)
→ `#fff` (the cards inside them). `--paper` was pure white, which put the
white `.pick` cards white-on-white and left them relying entirely on
their border and shadow to read as cards.

`--paper` is used by exactly two sections, `.approach` and `.picker`, so
one token moves both and they stay in step. The cards use a literal
`#fff` rather than a token, which is why they stayed put.
