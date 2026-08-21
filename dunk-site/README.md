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

## Who we work with, and the case study

Both sit between the services and the FAQs: audience fit first, then
proof. `.who` carries `id="who-we-work-with"`, which the two nav dropdown
links and the mobile drawer had been pointing at with nothing there.

`.who` is an image column stretched to the panel's height, so the two
columns bottom out together. The panel is a flex column with the CTA on
`margin-top:auto`, which lines the button up with the photo's bottom edge.

The six audience items are `.pick`-style cards — white, hairline border,
soft lift, lime "NN / LABEL" badge — and they sit **full width below** the
grid, three across, not inside the panel. That placement is load-bearing:
six cards inside the panel pushed it to 924px tall, which squeezed the
615px-wide photo beside it into a 0.67 box and cropped a 1.33 source down
to about half its width. Out here the panel stays at 461px, the photo box
lands at exactly 1.33, and nothing is cropped at all. Three across, two
below 1024px, one below 640px.

`.case` puts the photo across the top rather than beside the copy: the
Solargain shot is 2.17:1 and a side-by-side column would have cut people
off both ends, so it keeps its native ratio at every width. The results
column is a flex column with the CTA on `margin-top:auto`, so it anchors
to the bottom of the card instead of leaving a hole under the list.

### The Solargain content

Supplied by the client, from the Top Rankings case study for the same
business — the phone number on this page matches theirs, so this is read
as their own client work rather than someone else's. Worth confirming
before it goes live.

The pull quote originally named TopRankings. Rather than put a different
agency's name on a DUNK page, or silently reword a client's words, the
brand is bracketed: "We have used [them] for a number of years…". Restore
the original name or get a fresh quote — do not just delete the brackets.

## Why DUNK

`.whyus`, between the case study and the FAQs. Content and the six inline
SVG icons came from the client's own `index_5.html`; the layout is ported
onto this file's tokens rather than its source variables, and its
`min-width` breakpoints were flipped to the `max-width` ones this file
uses everywhere else.

It uses a lime pill eyebrow, not a numbered `.eyebrow-line`, so the
numbered run is unbroken: 01 why us, 02 get started, 03 what we do,
04 who we work with, 05 case study, 06 FAQ. The pill puts it in the same
class as the footer CTA's dot eyebrow — a voice section rather than a
numbered content one.

## Light and dark run

hero (plum) → approach (plum) → picker (paper) → suite (plum) → who
(paper) → case (paper) → whyus (plum) → faq (`--surface`) → cta (gradient).

`.approach` was paper and is now plum, which is why `.approach .logo`
exists: `.logo` hardcodes `#1c1c20`, so the marquee brand names would
have gone invisible on the dark ground. Its eyebrow also needed
`eyebrow-line--light` added in the markup — that variant is what swaps
the rule from black to white.

## Case study

One block, `.cs`, on the template the client supplied: photo left with a
lime `NN / LABEL` badge, a white card riding up over the photo's bottom
edge and hanging below it, and the copy right — eyebrow, client name,
three stats, timeframe note, dark uppercase CTA.

The card is inset from the left and stops short of the photo's right edge,
so it reads as an overlay rather than a caption bar. It carries
`position:relative;z-index:1`: `.cs__shot` is positioned, and a positioned
element paints above a static sibling whatever the DOM order — without it
the card's overlapping top, and the "What we did" heading in it, sits
behind the photo.

The photo runs 16:9 and the card only reaches up 44px, so it covers the
grass rather than the row of people. The badge clears the card by 18px at
every width.

### Content status

Solargain, from the Top Rankings case study for the same business — the
phone number on this page matches theirs. **Pestline was removed** when
this template replaced the two-card grid; its content and image are in
git history (see the two-up commit) if it should come back as a second
instance. The pull quotes are gone with it, so the bracketed-brand problem
no longer applies to this page.

## Placeholders

Five `.ph` sections mark what Clearwater's content flow has and this page
does not: methodology, awards, creative showcase, testimonials, footer.
Each carries an amber tag and a dashed rule so it cannot be mistaken for
real content, plus a note on what content it needs. Delete the `.ph`
classes as each gets built.

Two notes on the flow itself:

- **Client logos** is not a placeholder because the marquee already does
  the job — but it lives *inside* `.approach` rather than standing alone.
- **The CTA and FAQ are in the opposite order to Clearwater's flow.** It
  lists CTA then FAQs; this page runs FAQs then CTA. Left as it was rather
  than reordering unasked.

## .suite__copy

The service copy card. Four things carry it, and they interlock:

- **A lit top edge**, not one flat wash: a vertical gradient plus an inset
  1px white highlight, so it reads as a raised surface the way the `.pick`
  cards do on the light sections.
- **The service name at `.pick__title`'s weight and tracking** — 700 and
  -.022em, up from 600/-.025em, and a size step larger.
- **The tagline is a label chip**, not loose lime body text. Same
  vocabulary as the sub-service chips below it, so the card has two tiers
  of chip rather than one chip row and one stray coloured line. It needs
  `align-self:flex-start` or the flex column stretches it.
- **A card foot**: hairline rule, link beneath it with a circular arrow
  that nudges on hover. The slack under the chips is the art panel's
  25rem min-height showing through, so this turns dead space into
  structure instead of trying to remove it.

`.suite__chips` carries `margin-bottom:1.9rem` and the link `margin-top:auto`.
The auto alone gives no floor, so on a card whose copy nearly fills the
height the rule crowds straight up against the chips.

### Tile sizing

`.ui` is `width:100%` — it fills the art panel's content box (92% of the
panel, the rest being the panel's 1.6rem padding). It was `min(23rem,100%)`,
which used about 63% of the width and left the data cramped.

The panel's decorative corner arrow (`.suite__go`) is gone. A full-width
tile leaves no room for it, and it was rendering as a half-circle behind
the tile; the copy card's "See how we run X" link already carries that
affordance.

`.ui--links .ui__head > *:nth-child(2)` re-left-aligns "Domain": the
generic `> *:not(:first-child)` right-align rule threw it into the traffic
column.
