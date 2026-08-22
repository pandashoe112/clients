# DUNK site

An Astro site in `dunk-site/`, three pages, no CMS.

    src/pages/          index.astro, services/seo.astro, services/google-ads.astro
    src/includes/       nav, footer, cta, reviews, cases, why-us, strategy-call, trust
    src/layouts/        Base.astro, the html/head/body wrapper
    public/css/         global.css, service.css, suite.css
    public/img/         every photograph and logo, as files
    public/js/site.js   the nav and menu script

`npm run dev` to work on it, `npm run build` to produce `dist/`.

## How to change something

- **A section on one page** lives in that page's `.astro` file, as plain HTML.
  Edit it there.
- **The nav, footer, contact panel, reviews, results, booking panel** are in
  `src/includes/`. Edit once, all three pages follow.
- **Styling** is `public/css/global.css` for everything shared, and
  `service.css` for the two service pages. They are linked, not imported, so
  what ships is what you can read.
- **Images** go in `public/img/` and are referenced by path.

## It used to be built differently, and why that changed

The first page was an Artifact, and an Artifact has to be one self-contained
file: a strict CSP blocks external images, so every photograph was base64
inlined. That was fine for one page. When the SEO and Google Ads pages arrived
the nav, footer and reviews had to match the homepage, so a Python generator
(`build/build-pages.py`) cut those blocks out of `index.html` by comment marker
and pasted them into the other two.

It worked, but every change meant patching string anchors in a 900-line script,
each page carried its own copy of the same 1.2MB of base64, and one mis-set
marker silently deleted 107 lines of CSS. The port to Astro replaced it:

- three HTML pages: **1.2MB, 960KB, 900KB -> 49KB, 68KB, 64KB**
- images are 34 files shared between pages, not copied into each
- the generator and the three root `.html` files are gone

The port was verified section by section against the old output at 1440 and
414. Every section height matched except one: the FAQ, where
`.faq__side{position:sticky}` was riding over the questions once the grid
collapsed to a single column. That was a real bug on all three pages and is
fixed, so the FAQ is shorter now than it was.

## Still to confirm

- The reviews and the 4.9 / 123 figures came from another agency's listing and
  need replacing with DUNK's own.
- The Google Ads prices ($139 / $185 / $275 a week) were quoted to one client.
  Confirm they are the public rate card.
- Two Premier Partner mentions survive on the Google Ads page, in the meta
  description and one hero chip.
- The Google Ads case cards are the three SEO ones, with their real service
  tags left on. DUNK's paid case studies are not written up.
- General Sans cannot be fetched in this environment, so headings fall back to
  Plus Jakarta Sans in preview. It loads from Fontshare in a browser.

---

## Older notes, kept for the decisions in them


Two self-contained HTML pages: `index.html`, the DUNK marketing site with the
split hero layout, and `seo.html`, the first service page. Photos are inlined as
base64, so the files are large but open straight from disk with no build step and
no network.

Open them with `open index.html`, or serve the folder with any static server.

**The service pages are generated, not hand-maintained.**
`build/build-pages.py` emits both `seo.html` and `ppc.html`. It reads
`index.html` and lifts out everything they share with it (tokens, nav,
dropdowns, mobile panel, buttons, the marquee, case cards, the reviews
component, the why-us grid, FAQ, lead form, CTA, footer, script), plus the
platform-tile CSS and the four gradient art panels out of
`build/archive/services-suite.html`. Shared page CSS lives in
`build/page.css`; page content is one `CFG` per page and one set of section
builders both pages call.

So: **edit `index.html`, `build/page.css` or the script, then run
`python3 build/build-pages.py`.** Editing `seo.html` or `ppc.html` directly
means losing the change on the next build. This is what keeps a nav change
from having to be made three times, and it is the reason the other-services
tiles are the homepage tiles rather than pictures of them.

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

Order inside `.shell`: hero → approach → picker → strategy call → services
carousel → reviews → case studies → why DUNK → faq → cta → footer.

The four service rows ("How each one works") were archived on request. They
live in `build/archive/services-suite.html`, and that file is **live input to
the build**: `build/build-seo.py` reads the platform-tile CSS, two of the four
art panels and the winning SERP result out of it. So it has to stay valid even
while it is off the page. Putting it back is three paste operations, described
at the top of the file. The reviews sit
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

**Only seo.html uses the white bar.** ppc.html puts the nav on its hero
photograph instead, the way the homepage does: `NAV_OVER` in the build names
the pages that do it, `hero()` takes the nav as an argument and emits it inside
the `.phero`, the `<header class="topbar">` is skipped, and the nav's
light-ground overrides come back off (`nav--light` dropped, the CTA back to
`btn--white`). The scrim is built to darken the foot of the frame where the
copy sits, so `.phero--nav::before` adds a wash of its own across the top.
That nav scrolls away rather than sticking, again matching the homepage.

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

## Services carousel

`.svc`, directly above the four service rows. A sticky copy column against a
horizontally scrolling rail of four photo cards, one per service, bleeding off
the right edge so it reads as a rail rather than a row that happens to fit.

Two things worth knowing:

- **It adds no image weight.** The four photographs were already in the file:
  three were the channel picker's card backgrounds and the fourth is the
  studio shot the intro and CTA use as texture. All four are `:root` tokens
  now (`--photo-trade`, `--photo-desk`, `--photo-focus`, `--photo-studio`),
  and `.pick__bg` changed from an `<img>` to a `<span>` with a background so
  the picker and the carousel share the same bytes rather than inlining a
  second copy of each. The `<img>` was decorative anyway: it sits behind a
  scrim and the card's own heading.
- **The thumbnail row drives the rail and follows it.** Clicking a thumbnail
  scrolls the rail; scrolling or swiping the rail moves the active ring. The
  active index is the card nearest the rail's left edge, computed from
  `scrollLeft` on a rAF-throttled scroll listener. An IntersectionObserver was
  the first attempt and picked whichever card it happened to report last on
  load, which lit the wrong thumbnail.

The section takes the "What are our digital marketing services?" heading, and
the four rows below it now read **How each one works**. Two sections cannot
both ask the same question, and the rows are the detail. No other copy moved.

The photographs are real but they are doing double duty: the same three faces
appear in the channel picker higher up the page. Four photographs shot for
these four services would be better, and swapping them is four token values.

## The SEO page process section

`.proc`, rebuilt as steps down the left against a photograph on the right.

- **The rail and its markers are drawn inside the steps column**, not in a
  middle grid track. A middle track means aligning markers to rows they are
  not in; on each step, every marker lands on its own step by construction.
  The connector is one absolute hairline behind them.
- **The SERP overlay is the homepage's own winning result**, lifted out of the
  SEO tile by the build script, in a white card with a search bar above it and
  a ranking-keywords foot below. It laps the photograph's bottom-right corner
  at 58% width and 3% past the frame: deep enough to read as one object,
  shallow enough that no line of the result is clipped.
- Two traps it set on the way. `.proc__shot img` matched the Google mark
  inside the overlay and stretched it to the frame, so the rule is
  `.proc__shot > img`. And below 560px the photo is only about 270px tall, so
  a lapping overlay covered nearly all of it; there the overlay drops into
  flow and laps the bottom edge with a negative margin instead.

The photograph is the homepage hero, re-encoded to 1100px WebP (77KB) and held
in `build/process-photo.b64`.

### One thing the build script now has to do

The token block is copied to `seo.html` whole, so the three carousel-only
photographs would ride along as about 270KB the page never paints. The script
strips those three declarations. Add a homepage-only image token and it needs
adding to that list.

## The carousel's pin

Wide viewports pin the section and let the page scroll drive the rail
sideways; narrow ones leave it a plain swipeable rail. Two custom properties
carry the state: `--svc-p` is the 0-to-1 progress the script writes each
frame, `--svc-travel` is how far the rail has to move in px, which only the
layout knows.

Four things this got wrong before it got right:

- **The rail cannot carry the transform.** Translating the rail slid it out of
  its grid column and over the copy, and clipping at the section could not
  stop that. The rail is the clipping box now and the cards carry the
  transform, which means the focus rule has to repeat the translate rather
  than replace it (`translate3d(var(--x),-.65rem,0) scale(1.02)`).
- **`overflow-x:clip`, never `hidden`.** Hidden makes the element a scroll
  container and the sticky child inside stops sticking to the page. Clip does
  not. Paired with `overflow-y:visible` so the focused card's lift and shadow
  are not cut off.
- **Cards get wider while pinned** (`clamp(20rem,30vw,27rem)`). At the
  unpinned size three cards fit the column, which left barely one card of
  travel for a whole pinned section. Fewer visible cards is what gives the
  rail something to do.
- **The focused card comes off progress, not position.** The rail can only
  ever bring the last card to the right edge, never to a focus line, so a
  positional test never reached card four and the thumbnails stopped at three.

Measured at 1440: 1012px of travel over a 2064px section, so about a screen
and a bit of extra scrolling. Everything the pin adds is scoped to
`.svc.is-pinned`, which the script adds, so a JS failure degrades to the
swipeable rail rather than to a section that cannot be scrolled.

## ppc.html

The Google Ads page. Same chrome and the same section builders as the SEO
page; what differs is the `CFG` entry and which builders get called.

Order: hero, trust marquee, the six campaign types, Premier Partner, how we
manage campaigns, why our ads win, pricing, every package includes, results,
reviews, FAQ, other services, CTA, footer.

Three components are new, and both pages can use all three:

- **`.ct`, the comparison table**, ported from the Solid Ground proposal. It
  is a grid rather than a `<table>`: the DUNK column has to be paintable as a
  continuous full-height band down the middle, which a table cell cannot do
  without a colgroup hack. Below 700px the feature icons drop out and the two
  verdict columns shrink to fixed widths, because that content is what has to
  survive.
- **`.tier`, the three pricing tiers**, ported from the same proposal. The
  taken tier is raised and its button goes lime rather than being recoloured
  wholesale, so the three still read as three of the same thing. The
  proposal's per-client framing ("your recommended tier", "not recommended")
  is gone, since this page is not addressed to one reader.
- **`.proc__tile`** is the second overlay for the process photograph. The
  Google Ads tile is much wider than a search result, so it takes its own
  width and a plum ground to sit on rather than reusing `.proc__serp`.

### What the PPC page still needs

- **Its own case studies.** The three cards are the SEO ones, with their real
  service tags (Local SEO / Technical SEO / SEO) left on so nothing implies a
  paid result. DUNK's paid case studies are not written up yet; three of those
  and it is a one-line change to `PPC_CASES`.
- The **pricing figures are the proposal's** ($139 / $185 / $275 a week
  against $1,500 / $3,000 / $5,000 monthly spend). They were quoted to one
  client, so confirm they are the public rate card before this ships.
- **"Top 3% of Google Ads agencies in Australia"** and Premier Partner status
  came from the supplied copy. Both are checkable claims about DUNK and both
  should be checked before the page goes live.

### Copy that had to be generalised

Both comparison tables and the SEO includes grid came out of proposals written
for one client each. The SEO set said "per clinic", "all five clinic profiles"
and "local dental enquiry"; those are "per location" and "local enquiry" now.
The SEO comparison row "a page set for every clinic location" is "every
location you serve". Nothing else in either list changed.

### Icons

The includes grids name their own icons rather than borrowing the homepage's
why-us set by position, which had put a padlock beside "user journey heatmaps"
and a person beside "brand vs non-brand". Four were drawn for this: person,
split, flow and tag.

## Components ported from the two proposals

The client asked for these to match the supplied HTML rather than be
reinterpreted, so the values are the proposal's and only the variable names
are the site's.

- **Pricing (`.pgrid`/`.pcard`).** The brushed-silver gradient, the 4px dot
  texture over it, the purple tier pill against a right-aligned price, the
  basketball bullets, and the featured card's plum wash with its lime button
  and inverted bullet colours. Its head is the proposal's too: a Google mark
  and a label over a rule, then a left-aligned heading, not the two-column
  band head the rest of the page uses. What is gone is the per-client framing:
  a public rate card cannot say "your recommended tier" or mark two of three
  "not recommended", so every card reads Get started and the featured one is
  the visual emphasis.
- **Comparison table (`.ct`).** The wordmark sits in the header cell and again
  in the heading, feature icons are purple rounded tiles, and where the answer
  is simply no the cell takes a red cross rather than a word. It is a grid,
  not a `<table>`: the DUNK column has to paint as one continuous band down
  the middle, which a table cell cannot do without a colgroup hack.
- **Certification strip (`.badge`).** The five badges out of the proposal, on
  white, because each is artwork on its own white plate and any other ground
  shows the plates as rectangles. It sits low on the page, after the reviews,
  with the rest of the proof material rather than under the hero.

## Components built from references

- **Service tiles (`.tiles`).** The homepage channel-picker card reused: white
  panel, display title, grey body, lime chips. The hairline spec sheet they
  replaced read as a list of admin rather than a set of things you can buy.
- **Feature cards (`.feat`).** Three tinted cards, circular icon badge, and a
  mock panel pinned to the bottom of each so the card shows the thing instead
  of describing it. The panels are the `.ui` vocabulary the homepage tiles
  use, plus two new members of it (`.ui__prow` for a product or audience row,
  `.ui__chan` for a channel chip row), so they inherit the type scale rather
  than inventing another. The panel is `margin-top:auto` and bleeds off the
  card bottom, which is what stops three cards needing equal copy to look
  right.
- **Service features (`.svcs`).** Label and heading on the top row, an
  accordion bottom left, a photograph bottom right. The label sits in its own
  grid cell rather than stacked over the heading, which is what keeps it a
  label rather than a kicker.
- **Case tiles, as photo cards.** Photograph, near-black scrim, then client,
  result and the line about it at the foot. Near-black rather than a hue
  because three different photographs have to end up on the same value for the
  type to read the same on all three. The logo plate is gone: on a photograph
  a white plate reads as a sticker. Photos are the client-supplied ones,
  centre-cropped to 4:5 and re-encoded (49 to 129KB each), in
  `build/case-*.b64`.

## Reviews on the service pages

They are the homepage section, extracted whole: three rails, twelve cards,
moving. The static three-up that was there first did not move, and the rails
are the component the client knows.

## Nationwide, not Melbourne

The PPC copy came in written for Melbourne. Targeting language is national
now: the title, the meta description, the campaign-type copy, the process
steps, the Premier Partner section and the budget FAQ. What still says
Melbourne is true and stays: DUNK is Melbourne based (the hero says so, then
says it works across Australia), the footer address, the Pestline case study,
and the illustrative SERP tile, whose example client is a Melbourne window
cleaner. The Google Ads tile carried "Melbourne, all campaigns" as a caption;
these pages' copy of it reads "All campaigns, last 30 days".

## Removed from the PPC page on request

The Premier Partner section, the how-we-manage-campaigns process, and the
other-services pair. Two Premier Partner references survive because they were
not part of what was removed: the meta description and one hero proof chip.
Say the word and they go too.

Removing the Premier Partner CSS took the feature-card and mock-panel blocks
with it the first time, because the delete ran from its own marker to the
*certification strip* marker and those two blocks sit between them. The band
rendered 10646px tall, which is how it got caught. Delete to the **next**
`/* ---------- */` marker, not to a named one further down.

## The first capability card's artwork

Client-supplied, not built. The image is a whole card, so only the mock search
page below its icon is used, cropped and re-encoded to `build/tile-search.b64`
(900x580, 44KB). Its ground was sampled at its own edge, `rgb(235,226,252)`, and
all three feature cards take that value, so the artwork bleeds into the card
with no seam.

The visual leads the card, above the icon and heading, and all three cards share
the artwork's `900/580` aspect so the three headings line up even though the
panels are different heights. Every panel is therefore cut off part way down, so
`.fcard__shot::after` fades the cut into the card ground. That fade needs
`z-index:3`: `.ui` carries a `z-index:2` of its own, and without it the fade
paints under the panel and the cut stays hard.

The artwork's example query is "emergency plumber Melbourne". It is an example
of a local search rather than a claim about where DUNK works, but it is the one
place on the page that still says Melbourne, so swap the asset if that reads
wrong.
