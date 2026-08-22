# DUNK — split hero variant

Two self-contained HTML pages: `index.html`, the DUNK marketing site with the
split hero layout, and `seo.html`, the first service page. Photos are inlined as
base64, so the files are large but open straight from disk with no build step and
no network.

Open them with `open index.html`, or serve the folder with any static server.

**`seo.html` is generated, not hand-maintained.** `build/build-seo.py` reads
`index.html` and lifts out everything the two pages share (tokens, nav,
dropdowns, mobile panel, buttons, the marquee, the service suite's art panels
and platform tiles, case cards, reviews, FAQ, lead form, CTA, footer, script),
then adds only the page-specific CSS and copy, which live in the script.

So: **edit `index.html` or the script, then run `python3 build/build-seo.py`.**
Editing `seo.html` directly means losing the change on the next build. This is
what keeps a nav change from having to be made twice, and it is the reason the
other-services tiles are the homepage tiles rather than pictures of them.

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

Order inside `.shell`: hero → approach → picker → strategy call → suite →
reviews → case studies → why DUNK → faq → cta → footer. The reviews sit
directly under the services section: what we do, then what people say about
it. Nothing carries a hand-written section number any more, so inserting a
section no longer means renumbering anything after it.

`.suite` is the four-service grid. Each service is a `.suite__row` — a
two-column grid holding a `.suite__copy` half and a `.suite__art` half.
The row is the card: it owns the `1.5rem` radius, the `overflow:hidden`,
the hairline and the shadow, and its `gap` is `0`, so the two halves meet
on a seam and read as one block rather than two floating cards. Doing the
rounding on the row rather than the halves is what lets the zig-zag work
without per-corner rules — whichever half lands on the left gets the left
rounding for free. So neither half sets a radius of its own.

Copy always comes first in the DOM so the single-column order reads
service-then-artwork; `:nth-child(even) .suite__copy{order:2}` does the
zig-zag on desktop and the mobile query resets it. The gap between rows
stays at `1.25rem`: within a row the halves are one service, between rows
they are different ones.

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

The `.ph` machinery is still in the stylesheet but nothing uses it any
more: methodology, awards and creative showcase were removed on request,
and testimonials and the footer are built. Keep the classes only as long
as another section is coming; an amber tag and a dashed rule is what stops
an unfinished block being mistaken for real content in a review.

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
  that nudges on hover.

The copy block is **vertically centred** (`justify-content:center`), not
top-aligned with the link pinned to the bottom. The card is taller than
its copy because it matches the art panel beside it, and centring splits
that slack evenly above and below rather than banking it all in one gap.
Measured equal to the pixel on all four cards.

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

The avatar holds the supplied portrait, cropped square and encoded to
280px WebP.

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

The avatar is the real portrait: cropped square from a 2552x2552 source at
80% centred slightly left and high, encoded to 280px WebP (21 KB). The
circle went from 4.5rem to 5.5rem now that it holds a face rather than a
placeholder wash, and the gradient fallback behind it is gone.

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

## The CTA-to-footer block

The `.blog` insights section that used to sit between the FAQs and the CTA
was removed on request, markup and CSS both. Nothing links to `#insights`
any more.

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

## The CTA and footer, both flat dark

**The colour band is gone.** It went through three versions and none of
them worked: a dark gradient over the pastels greyed them to mud, and the
masked rebuild still fought the lead form sitting on top of it. `.cta` is
now a flat `#0D0A14` and `.foot` a flat `#15131C`, one step apart, so the
two read as two bands with no rule needed between them.

If a colour treatment comes back here, put it somewhere the form is not:
overlaying dark on pastel always greys it, and masking the colour out
still leaves form fields sitting on a moving background.

`.cta__panel` is a two-column grid: copy left, lead form right, one column
below 1024px. The `.cta__arc` glow is gone; it was drawn for the old
rounded dark card and had nothing to sit on once the section went
full-bleed.

## Case studies

`.cases` replaces the single `.cs` block: a light section, centred head,
three cards across, two below 1024px, one below 640px. Cards are flex
columns so all three bottom out level (measured 582px each).

All three cards now carry real client copy and figures: Pestline 641%,
Solargain 220%, Approved Electrix 318%. The plate behind each logo is
white because the supplied logos are **JPEGs with a white background**, not
transparent PNGs; on a white plate they read as though they were cut out.
Put them on any tinted surface and the white box shows.

The `View SEO case study` links point at `/case-studies/<client>` routes
that do not exist yet.

## Client reviews

`.voices`, between Why DUNK and the FAQs. Centred head, a three-figure stat
row, then three vertical rails of cards.

The rails are the logo marquee's trick turned 90 degrees. Each
`.vrail__set` carries a `padding-bottom` equal to its own card gap, so one
set is exactly half the track and `translateY(-50%)` loops with no seam.
Two constraints follow from that:

- **A set must be taller than its rail** or a bald patch scrolls through.
  Measured: 938px of cards against a 672px rail. That is what fixes four
  cards per rail, not taste.
- **The middle rail runs in reverse and a third of a cycle ahead**, so the
  three columns do not move as one slab. The stagger is
  `animation-delay:-20s`, not a negative top margin: the margin version
  staggered them by pulling the rail up into the proof bar above it, which
  is what closed the gap between the two.

Below 700px the rails stop being rails: the animation is off, the mask is
off, the height is auto and the duplicate sets are hidden, so it becomes
one plain column of twelve cards. Three auto-scrolling rails on a phone is
unreadable.

### Where the reviews came from, and what needs replacing

The quotes are the Google reviews supplied in the brief, with the agency
name swapped for DUNK as asked. They are **attributed to another agency at
source**, and so are the figures in the stat row: 4.9 average, 123 reviews.
The 300+ businesses figure came from the earlier brief. All of it needs
swapping for DUNK's own before this page goes anywhere public, because as
it stands the page puts real named people's words against the wrong
business.

Two things deliberately not carried across:

- **The staff first names inside the review bodies.** They name another
  agency's employees. The sentences that mentioned them are trimmed out.
- **Photographs.** These are real people who left real reviews, so a stock
  face on a named person invents them. The avatars are monograms.

One reviewer in the source is listed only as initials, so that review is
not used at all.

## Fonts

Three faces, taken from the reference the client supplied:

| Role | Face | Where it comes from |
| ---- | ---- | ------------------- |
| Body | Geist | Google Fonts, already loaded |
| Headings | General Sans | **Fontshare**, not Google Fonts |
| Accent | Instrument Serif | Google Fonts, loaded and unused |

General Sans is the catch. It is a Fontshare face, so:

- The `<link>` to `api.fontshare.com` loads it for real visitors on a
  deployed site.
- It does **not** load inside an Artifact preview: that CSP allows Google
  Fonts and nothing else. Headings fall back there.
- It could not be fetched and inlined from this environment either.
  Fontshare is outside the network policy and it is not on npm.

So `--font-head` is `'General Sans','Plus Jakarta Sans',...`. The fallback
is deliberate rather than arbitrary: the two are the same
geometric-humanist genre, so losing General Sans shifts the metrics
slightly and nothing else. Drop the woff2 files into the repo and they can
be inlined, at which point both pages get the real face everywhere.

`--font-style` holds Instrument Serif. It is wired and applied to nothing;
scattering serif italics around unasked seemed worse than leaving the
token ready.

## seo.html

The first service page. Same tokens, same nav component, light chrome.

The nav is the homepage's markup with `nav--light` added, and the overrides
sit in one block. The wordmark needs no work: its svg is `currentColor`, so
it turns black off the body colour on its own. Everything the dark nav
painted in white alpha needs a black-alpha equivalent, and two colours
cannot survive the flip:

- **The lime asterisk** is nearly invisible on a warm off-white, so on
  light grounds it deepens to `#B9CE2E`.
- **Lime accents inside the dropdown** go to `#5B7A00` for the same reason.

One rule had to change rather than be re-tinted. The dark nav ordered its
divider with `.nav__right .btn--white{order:2}`, keyed to the class name.
This page's CTA is `.btn--ink`, so the divider fell to the end of the row
until the selector was loosened to `.nav__right .btn`.

`.phero` is a photo card inset by the shell rather than a full-bleed hero,
because the light header above it is the page ground and the card has to
read as a card. The crop is pulled to `50% 32%`: the faces sit in the upper
middle of the frame, and the empty foreground is what the copy sits on.

### Other services

`.others` shows the two services the page is **not** about. On this page
that is Google and Meta; on either ads page it would be whichever two are
left, which is the pattern to follow when those pages get built.

The card artwork is the homepage's own gradient panels, **captured** rather
than rebuilt: the two `.suite__art` elements screenshotted at 2x, cropped
44 device px in on every side to drop the row's rounded corners, and
re-encoded as WebP. The alternative was porting 300 lines of tile CSS to a
second file where it would drift. The aspect ratio is pinned to `1100/1004`
so the crop is never squeezed. It also means the panels have to be
recaptured if the homepage tiles change.

## The polish pass

A round of UI work across both pages. What changed, and why each one was a
change rather than a preference.

### Strategy call

Was a white panel inside the plum card with a third bordered card inside that:
three nested containers to say one thing. The copy now sits straight on the
plum and the booking card is the only card in the section, so there is one
object to look at. The card gained a host row, a definition list of length,
format and cost, an availability strip and its own button; the live pip moved
off the photograph, where it was decoration, onto a labelled chip.

The pixel motif went from a corner sticker to a masked ground texture that
fades out before it reaches the copy.

### Services suite

Packaging only. Every visual and every word is the same.

- The head is a two-column split, question left, answer and count right, over
  a rule. The numbered eyebrow above it is gone.
- Each copy half opens with a header bar carrying the service name and its
  index, under a hairline.
- **Chips and link are one card foot.** The copy column has to absorb whatever
  the art panel's height does not use. Centring the lot hid that; top-aligning
  it stranded 250px between the chips and the link. Collecting both into a
  foot with `margin-top:auto` puts the slack in one place, above a rule, where
  it reads as designed space.
- `min-height` on the art panel dropped from 38rem to 37.75rem, which is the
  tallest panel's natural height (the SERP tile, 604px). Every pixel above
  that was dead air in the column opposite.

### Case studies

Was three white cards fronted by a big empty logo plate and a bare percentage,
which is the stock hero-metric tile. Same three tiles, same figures:

- The client leads, in a tinted band, with the trade underneath. Each card
  takes one of the three brand hues through a `--case-tint` / `--case-ink`
  pair, so a fourth client is two custom properties.
- The number sits in a sentence: `641%` then `more local organic traffic`,
  rather than `Increase → Local organic traffic`. Same claim, read in one pass.
- **The logo chip is landscape**, 7rem by 2.6rem. Every supplied logo is
  roughly 3.5:1, and in the square chip they scaled to fit the height and came
  out unreadable.
- The whole card is the link now, not a text link inside it.

### Reviews

The three figures were floating on the section ground with hairlines between
them, reading as three things. They are on one white panel now, which reads as
one proof line. Bylines carry the Google mark, and the card under the cursor
gets a border and shadow, since hovering a rail is what pauses it.

### FAQ

`name="faq"` makes it an exclusive accordion and the first answer opens by
default, so the section does not present as seven closed rows. The side column
sticks, because the answer someone is reading is often the one that decides the
click. Body copy went from 15px grey-200 to 16px grey-100, and the focus ring
moved onto the row.

### Footer

Three brand hues as a radial wash across the top, masked to fade well before
the legal bar. Two colours had to move for it: `.foot__label` and the
newsletter placeholder were set against flat `#15131C` and fell under 4.5:1 on
the wash, so both went up a step to `--grey-200`.

### CTA

The studio photograph sits behind the panel at .20, anchored to the copy side
and masked out before it reaches the form, so every field still sits on the
flat ground its contrast was set against. A second layer scrims the photograph
only. The eyebrow above the heading is gone, and the heading's measure went
from 26rem to 34rem: at 52px it was breaking to seven lines.

### Two shared assets became tokens

`--photo-studio` and `--mark-google`. The photograph is used by two sections
and the Google mark by thirteen elements; both were being inlined again at
every use.

### Eyebrows and section numbers

All four numbered eyebrow lines (`01 Get started`, `02 What we do`, `04 FAQ`,
`Let's talk`) are gone and the `.eyebrow-line` component with them. Each said
less than the heading under it. The one surviving index is `01 / 04` on the
service rows, which stays because the lede claims four services are the whole
list and the index is what backs it.

### Known findings left alone

The mechanical design detector flags four things on both pages: Geist as an
overused face, the dot-grid background, the radial halo on the dark sections,
and the auto-scrolling marquee. All four are what the client asked for by name.
They are listed here so the next person knows they were seen and kept, not
missed.

## seo.html sections

Order: white bar, hero, trust marquee, what you are competing for, what SEO
includes, how the work runs, results, reviews, FAQ, other services, CTA,
footer.

- **The white bar** is sticky and bleeds past the shell padding, so sections
  carry `scroll-margin-top:6.5rem` or an anchored jump lands underneath it.
  The wordmark needs no override: its svg is `currentColor`. Two colours
  cannot survive the flip to light, the lime asterisk and the dropdown's lime
  accents, and both deepen to olive.
- One rule had to be loosened rather than re-tinted. The dark nav ordered its
  divider with `.nav__right .btn--white{order:2}`, keyed to a class name this
  page's CTA does not use, so the divider fell to the end of the row.
- **What you are competing for** puts the homepage's SERP tile, live markup,
  next to a numbered list of what each part of a result page is worth. That
  row's panel holds a bare `.ui` rather than a `.stack`, which is why the
  build script lifts the tile by class and not by wrapper.
- **What SEO includes** is a hairline-separated spec sheet, two up, rather than
  six identical icon cards.
- **How the work runs** draws its connector once behind the row as a dashed
  line, so it is one line through the sequence rather than four borders. The
  stage chips align to the bottom of the row, since the bodies differ in
  length.
- **Other services** shows the two services the page is not about. On either
  ads page it would be whichever two are left. The art is the homepage's own
  panel markup with nothing but its corners changed: two cards at this width
  give the stack the same 592px it gets on the homepage, measured, so the tiles
  render identically. Shrinking the stack was what wrapped a word to a line.
- **Reviews** are static here, three cards on white. The homepage runs them on
  rails; a service page has one job.
