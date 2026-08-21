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

### Tile sizing and the offset overlays

`.ui` is back to `min(24rem,100%)`. Google Ads and Meta each sit in a
`.stack`: base tile at `64%`, a second card (`.ovl`) absolutely placed at
`right:0; bottom:-1.6rem`, width `38%`.

Those are **percentages that sum to ~102% on purpose** — the lap stays
about 12px at every panel width instead of growing as the panel narrows.
The lap has to stay that small: it is roughly the tile's own right
padding, so nothing is covered. Anything larger clips the right-hand
column mid-number, which reads as a rendering bug rather than as layering.
The drop shadow is what sells the depth, not the amount of overlap.

Below 640px there is no room to offset, so `.ovl` goes `position:static`
and full width under the tile.

The panel's decorative corner arrow (`.suite__go`) is gone. A full-width
tile leaves no room for it, and it was rendering as a half-circle behind
the tile; the copy card's "See how we run X" link already carries that
affordance.

`.ui--links .ui__head > *:nth-child(2)` re-left-aligns "Domain": the
generic `> *:not(:first-child)` right-align rule threw it into the traffic
column.

## Dangling in-page links

Ten `href="#..."` links on the page resolve to nothing:

- **`#who-we-work-with` (8)** — the entire "Who We Work With" nav
  dropdown: its three items and its foot link, in both the desktop nav and
  the mobile drawer. The section they pointed at was removed. Either
  rebuild a section with that id, repoint them (`#get-started` is the
  nearest fit — it segments by what the visitor is trying to achieve), or
  drop the nav item.
- **`#about` (2)** — the "Who We Are" nav item and its mobile equivalent.
  This one has never had a target; it predates any of this work.

Everything else resolves: `#get-started`, `#services`, `#results`,
`#why-dunk`, `#faq`, `#contact`.

## Strategy call panel

`.call`, between the picker (02) and the services (03). A white panel
inset in a plum section, with the lime pixel motif top-left and the arrow
bottom-right sitting in the plum margin. Those two are `z-index:0` behind
the panel, so the section's padding has to be wide enough for them to
clear it — at the original `clamp(2rem,4vw,3.5rem)` they ran under the
white and read as clipped. Padding is now `clamp(2.5rem,5vw,4.75rem)` and
both are verified clear of the panel edge.

**The avatar is a plum gradient placeholder, not Oliver.** No headshot was
supplied. Drop a portrait in and swap the `data:` URI on
`.call__avatar img`; the circle, ring and lime live-dot are already there.

## Logo wall

Six logos, alpha-trimmed at encode time and fitted to a 300x88 box rather
than sized by height. Both matter: the source PNGs are square canvases
with the mark floating in transparent padding, and the wordmarks run as
wide as 12:1, so height-sizing made Naked Harvest tower over Dometic and
left every square mark looking tiny.

All are flattened to white with `filter:brightness(0) invert(1)` — two of
the six are black artwork and would vanish on the plum otherwise.

`.marquee__set` gap is 8rem, and that is load-bearing. The track holds two
identical sets and animates to `translateX(-50%)`, so **one set has to be
at least as wide as the marquee container** or the loop shows a hole. Six
logos only reach 1353px against a 1184px container because of that gap;
tighten it and the seam reappears.

## Booking card availability

Set from the client's real Calendly-style config: 15 minutes, Mon to Fri,
9:30am to 4:30pm, Australia/Melbourne. Sat and Sun render as `is-off`
chips rather than being omitted, so the card says what is *not* available
as well as what is. If the real availability changes, these are hand-typed
values in the markup, not fed from anything.

**The avatar is still a placeholder.** A portrait was described but arrived
as a pasted image rather than a file, so there was nothing to encode. Send
it as an attachment and swap the `data:` URI on `.call__avatar img`.

## Footer

`.foot` replaces the placeholder. Brand, address and socials left; three
link columns and a newsletter block right, separated by a rule drawn as a
`border-left` on the right column so it stretches to the taller side.

**Invented values to replace before this ships:**

- `hello@dunk.agency` is a plausible guess, not a supplied address. The
  account email was deliberately not used: putting a personal address in a
  public footer is a different decision from using it for attribution.
- The three social links are `href="#"`. No URLs were supplied.
- `Level 5, 171 Collins Street, Melbourne VIC 3000` is the Melbourne
  address off the Top Rankings footer, on the same assumption the case
  study rests on. Only one office is listed; that source names three.
- The newsletter form has `onsubmit="return false"` and no action. It is
  presentational.

## Insights, and the CTA-to-footer block

`.blog` sits between the FAQs and the CTA: eyebrow and heading left, lede
right, then a featured post with the artwork left and meta/title/excerpt
right, and three secondary posts under a rule. The featured artwork is a
CSS orb, not an image, so the section needs no asset.

`.cta` and `.foot` are both full bleed now, breaking out of the shell with
`calc(var(--shell) * -1)` side margins, no border-radius, and zero gap
between them. The footer also pulls its bottom margin negative so it
reaches the document edge.

Two things make the seam work:

- **The colour band is a fixed 320px strip pinned to the top of `.cta`**,
  not a percentage of its height. Percentage stops broke once the lead form
  made the section much taller: the colour ended up behind the first
  fields and washed them out.
- **`.cta` ends on `#0D0A14` and `.foot` starts on it**, so the two read as
  one block.

A colour cannot be positioned or sized in the `background` shorthand, only
the final bare colour can. Writing `#E7E2D6 top center / 100% 320px` made
the whole declaration invalid and the section fell back to the page ground.
The band's base is a flat `linear-gradient` for that reason.

## Lead form

`.lead`, in the CTA. Eight fields, every one with a real `<label for>`.
Two selects have their native arrow suppressed and one drawn in CSS,
because the OS-rendered arrow ignores the dark surface.

**It does not submit.** `onsubmit="return false"`, no action, no endpoint.
The revenue and spend ranges are invented brackets.

## The CTA colour band, second attempt

The band is now its own layer (`.cta::before`, a fixed-height strip) that
is **masked out downward** with `mask-image`, over a flat `#0D0A14`
section. The previous version painted an `rgba(13,10,20,…)` gradient over
the pastels inside one background stack, which greys them: dark over
pastel is mud, every time. Fading the colour's alpha instead keeps it
clean and lets the flat dark below show through, and that dark is the same
value the footer starts on.

`.cta__panel` is a two-column grid: copy left, lead form right, one column
below 1024px. The `.cta__arc` glow is gone; it was drawn for the old
rounded dark card and had nothing to sit on once the section went
full-bleed.

## Case studies

`.cases` replaces the single `.cs` block: a light section, centred head,
three cards across, two below 1024px, one below 640px. Cards are flex
columns so all three bottom out level (measured 582px each).

**The third card is a deliberate placeholder.** Solargain and Pestline
carry real figures. There is no third case study with data, and inventing
a number against a named real client is the one thing not to do here, so
that card reads "Stat to confirm" in grey and its copy says so. It uses
the Naked Harvest logo on a wash, since no photo was supplied for them,
darkened with `filter:brightness(0)` because the supplied logos are white
artwork.
