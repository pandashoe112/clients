# Panel Pitch — the design model

A handover document. It describes the model the app is built on, not the code
that happens to implement it, so it can be rebuilt in any stack and extended
without the extensions fighting what is already there.

Source of truth for every value below: `panelpitch/app.css`, `panelpitch/js/`.
The published prototype is the same app, unmodified, inside a phone frame.

---

## 1. The one decision everything else hangs off

**There are two surfaces, and they are allowed to look nothing like each
other.**

| | The tool | The report |
| --- | --- | --- |
| Who holds it | The electrician | The homeowner |
| Where | At an open board, in a garage or meter box | On a couch, or printed |
| Ground | Deep green `#032F35` | Cream `#F4F6EF` / paper `#FFFFFF` |
| Job | Classify fast, one thumb, gloves on | Persuade, in plain English |
| Density | Tight, 8–16px rhythm | Loose, 38–58px bands |
| Voice | Trade shorthand | Full sentences, no jargon |

A dark screen at an open board does not blind you or reflect back at you. A
light document is what a business hands a customer. Making them consistent
would compromise both, so they are deliberately inconsistent — and they share a
palette so it still reads as one product.

If you take one rule from this document into a redesign, take this one. Most
ways of "tidying up" Panel Pitch end up merging the two surfaces, and that is
the one change that makes it worse.

## 2. Palette

Colours come from `revelectrical-site/src/styles/global.css` — the tool the
electrician holds and the site the customer found are visibly the same business.

```
/* tool side */
--ink        #032F35   page ground; also text colour on the light side
--surface    #0B3A40   cards
--raised     #10484E   inputs, insets
--line       rgba(244,246,239,.15)
--text       #F4F6EF   cream
--dim        rgba(244,246,239,.74)   secondary copy
--faint      rgba(244,246,239,.5)    labels, meta

/* action — never severity */
--accent     #B6ED3E
--accent-600 #A3DA26   hover
--accent-soft rgba(182,237,62,.14)   selected row fill

/* severity — deliberately outside the green/lime family */
--danger     #FF6B5A   immediate risk
--warn       #F5B301   not to standard
--improve    #6FD3E8   worth upgrading

/* light side */
--cream      #F4F6EF
--paper      #FFFFFF
--muted      #4C6B6E   body copy on light
--line-ink   rgba(3,47,53,.13)
--star       #F5B301
```

**Lime means "selected / do this next". It is never a severity.** Severity has
its own three colours so a red pin can never be read as a chosen option and a
lime tick can never be read as "safe". This separation is load-bearing: the
whole screen is coloured chips and ticks, and if the two vocabularies overlap
the electrician mis-taps in front of the customer.

Severity ranks `danger 3 > warn 2 > improve 1`. A device with several problems
takes the colour of its worst one.

## 3. Type

```
--display 'Outfit', system-ui, sans-serif      700 / 800
--sans    'Manrope', system-ui, sans-serif     400 / 600 / 700
--mono    ui-monospace, SFMono-Regular, Menlo  (money only)
```

- **Outfit** on every heading, on numbers inside pins, and on report prices.
  Headings run `letter-spacing:-.03em`, `line-height:1.1`. The report's `h1`
  goes to `-.035em / 1.05`.
- **Manrope** for everything read as a sentence. Body `16px / 1.55`; report
  ledes `1rem / 1.7`.
- **Mono, tabular-nums, for money in the tool only.** Figures the electrician
  scans in a column must not shift. Money in the *report* is Outfit at
  `2.375rem / 800 / -.04em` — there it is a headline, not a column.
- Uppercase micro-labels: `.6875rem`, `letter-spacing:.1em`, weight 700, colour
  `--faint`. Used for tally captions, field labels, tier names.

Sizes actually in use: `.6875 / .75 / .78125 / .8125 / .875 / .9375 / 1 /
1.0625 / 1.25 / 1.375 / 1.5 / 1.625 / 2.375rem`. Report headings are fluid:
`rh1 clamp(2rem, 8.4vw, 2.6rem)`, `rh2 clamp(1.5rem, 6vw, 1.9rem)`.

## 4. Shape, spacing, motion

- Radii: `--r-sm 8px` (buttons, inputs, icon buttons), `--r 14px` (cards, rows),
  `--r-lg 22px` (board, sheet, tier cards, report board).
- Pills are `999px`: board hint, trust chips, tier flag, "saved" badge.
- Tool rhythm: row gap `8px`, card padding `13–16px`, section heads `26px 0 12px`,
  screen padding `16px` with `120px` of bottom clearance for the dock.
- Report rhythm: `.rwrap` is `max-width:640px` with `20px` inline padding; bands
  are `padding-block: clamp(38px, 7vw, 58px)`.
- Borders: 1px `--line` at rest; selection is a **border colour change plus a
  soft fill**, never a shadow. Only the report uses shadows, and only two:
  `0 2px 4px rgba(3,47,53,.08), 0 24px 52px rgba(3,47,53,.16)`.
- Every transition is `.16s ease` on colour properties only. The two exceptions
  are the sheet rising (`.22s`) and the report chevron rotating (`.2s`).
  Nothing moves unless the user caused it.
- `@media (prefers-reduced-motion: reduce)` kills all of it.

## 5. The tool surface

Frame: `.app` is `display:flex; flex-direction:column; height:100dvh;
max-width:560px; margin:0 auto`. Three stacked regions:

```
bar      sticky top, 1px bottom rule, ink background
screen   the only scrolling element, flex:1
dock     sticky bottom, gradient fade from ink to transparent
```

**Screens** — exactly three, plus one overlay:

1. **Jobs** — empty state, or a list of `.jobcard` rows (thumb, name, "N marked
   · date", running total in lime mono). Dock: *New board*.
2. **Board** — the photo with pins on it, three tallies, then the whole-board
   fixes. Dock: *Job details* (ghost) · *See the options* (primary).
3. **Review** — the tiers, then a flat list of every line item going in. Dock:
   *Coaching* (ghost) · *Present to customer* (primary).
4. **Present** — the report. `position:fixed; inset:0; z-index:60`. Not a
   screen; it covers the app so the phone can be turned around.

Back button is hidden on Jobs, and steps review → board → jobs.

**Components**

- `.opt` — the workhorse selectable row: 22px tick box on the left, name with a
  severity dot, a "why" line in `--dim`, a mono price on the right. Selected =
  `border-color: accent` + `background: accent-soft` + filled tick. Every list
  in the tool is made of these, which is why adding a new kind of list rarely
  needs new CSS.
- `.tally` — three equal cards: Marked · Issues · Best case. Mono numerals at
  `1.375rem/800`, uppercase caption.
- `.pin` — 34px circle, centred on its point by `margin:-17px 0 0 -17px`,
  positioned in **percentages** so it survives any photo size or zoom. 2.5px
  cream ring, Outfit 800 number, severity fill. Unclassified pins are grey.
- `.tier` — name (uppercase micro), price (mono `1.625rem/800`), a note line,
  and an optional `−N% bundled` badge. The recommended one gets
  `border-color:accent` plus a 1px accent ring.
- `.sheet` — bottom sheet, `max-height:88dvh`, scrim `rgba(3,20,23,.66)` with a
  2px blur, grab handle, rises 14px over `.22s`. Four of them: pin, job
  details, coaching, settings. **All secondary interaction happens in a sheet.**
  The main screen never becomes a form.
- `.dock` — one or two buttons, primary at `flex:1.5` so it dominates. It is
  the only place a screen advances from.

## 6. The report surface

Not the tool with the colours turned up. It is built out of the website's own
furniture so a homeowner who found the business on Google recognises it: same
band rhythm, same Outfit headings with one lime highlight word, same lime pill
buttons, same icon tiles on the steps. Mirrors
`revelectrical-site/src/styles/{global,service}.css`.

Band order, top to bottom — the rhythm is the design:

| Band | Ground | Holds |
| --- | --- | --- |
| Hero | ink | Eyebrow, headline, lede, trust chips (licence · rating · phone) |
| Your board | cream | The photo with tappable markers, and a legend |
| What we found | paper | Accordion of findings, one per issue |
| Your options | ink | Paper tier cards on the dark band |
| What happens next | cream | Three steps with a connecting wire |
| Footer | ink | Who quoted, licence, responsibility note |

Rules that matter more than the styling:

- **The headline names the worst thing found**, because it is the sentence the
  customer repeats to their partner tonight. Three states: *"Your switchboard
  has N things to fix now"* / *"Your switchboard is safe, but not up to
  standard"* / *"We checked your switchboard, and it is in good shape"*. The
  second half is always the lime `<span>`.
- **Findings start collapsed.** The customer opens what they care about.
  Tapping a marker on the photo opens its finding, scrolls it to centre, and
  lifts it with `.is-lit` for 1600ms — the eye lands where the finger sent it.
- **The legend only lists severities actually present.** No empty keys.
- **Every finding carries the plain-English `plain` text, then a
  `What we would do:` block** with a lime left rule. Problem, then remedy,
  in that order, every time.
- Recommended tier gets a 3px accent ring and an *Our recommendation* flag —
  and only when there is more than one option to recommend between.
- Price validity is stated: *"Prices hold until <date>"*, 30 days out.
- The footer states that a licensed person made every classification. That
  sentence is not decoration; it is the product's liability position.

**Print** is a first-class output — "Save as PDF" is how the quote leaves the
building. Browsers drop backgrounds, so the ink bands re-render as paper with
ink text rather than printing unreadable; collapsed findings are forced open
(`.pfind__body[hidden]{display:block!important}`) because a printed report has
to be complete; `print-color-adjust:exact` is applied only to the small colour
chips that carry meaning — pins, finding numbers, step tiles, the eyebrow rule.
`@page{margin:14mm}`.

## 7. The domain model

This is the part with the trade knowledge in it, and it is deliberately kept
in one file (`js/catalogue.js`) with no logic, so it can be versioned, exported
and re-imported as a price book without touching code. **Treat it as data, not
as constants.**

```
ISSUE   what the electrician SEES   { key, fix, label, plain }
FIX     what they DO about it       { kind, severity, tier, price, name,
                                      outcome, say, tbc? }
```

- `plain` is the customer's explanation. `outcome` is what changes once it is
  fixed. `say` is coaching for the electrician and never leaves the tool.
- `kind` is `breaker` (attaches to a pin) or `board` (applies once, whole board).
- **Many issues map to one fix.** A Type AC RCBO, a missing RCD and a wrongly
  rated breaker all end in the same device, so the fix is charged **once** while
  every reason still prints on the quote. That mapping is the product;
  everything else is presentation.

**Pricing pipeline** — `pins + boardFixes → fixes (deduped, counted) → tiers → money`:

1. For each pin, collapse its issues to the set of fixes they imply. One device
   with three problems that share a fix is still one device to buy and fit:
   count 1, reasons 3.
2. Bucket every fix into its tier. **Tiers are cumulative**: recommended
   includes essential, complete includes both. That is what makes good/better/
   best read as one decision rather than three quotes.
3. **Collapse duplicate tiers.** A tier that adds nothing to the one below it is
   not a second choice, it is the same choice printed twice — and with a
   discount on top it would read as *"Complete, for less than Recommended, for
   identical work"*. Only tiers that differ are offered; empty tiers never are.
   The review heading counts what is actually on screen, so "three ways to fix
   it" is not always true.
4. **The bundle discount belongs to the largest real option, and only when
   there is a smaller one to weigh it against.**
5. `ex → gst = ex × .1 → inc = ex × 1.1`. The tool shows inc GST throughout.
6. `top` is the biggest option actually offered — the figure on a job card and
   in the running total. It is not always `complete`.
7. Anything with `tbc` (asbestos, a full new board) prices as *"On
   application"* / `+` and never guesses a number.

**Nothing is auto-detected from the photo.** The electrician classifies; the app
prices and presents. A model guessing at a compliance call would put a licensed
person's signature behind a machine's opinion. If you add intelligence, add it
as a *suggestion the electrician confirms*, never as a filled-in answer.

## 8. State and storage

- Everything is on the device: `localStorage` under `panelpitch.v1`, with an
  in-memory fallback for private browsing. Not a cache — the database. The app
  has to work in a basement with no signal, hence the service worker precache.
- Shape: `{ business, prices, jobs[], accepted }`. A job is
  `{ id, ref, customer, site, photo, pins[], boardFixes[], created, updated }`;
  a pin is `{ x, y, issues[], note }` with **x/y as percentages**.
- **Price overrides are only stored when they differ from the catalogue**, so an
  update to the catalogue still reaches everyone who has not deliberately
  changed that line.
- Photos are downscaled to 1600px JPEG at 0.82 before storage; the business logo
  to 480px PNG, stored inline so a report carries the brand with no network and
  no asset host.

## 9. Accessibility and input

- Touch targets are 40px+ (`.iconbtn` 40, `.btn` 14–17px padding, `.opt` rows
  full width). Pins are 34px but sit on a photo you can zoom.
- Focus is visible everywhere: `outline: 3px solid var(--accent); offset 2px`.
- Report accordions are real buttons with `aria-expanded` / `aria-controls`.
  Markers have `aria-label="Finding N"`.
- All user text is escaped before it reaches `innerHTML` (`esc()`), which
  matters because the business name and customer name land in a document that
  gets shared.
- Contrast: cream on ink is ~13:1; `--dim` and `--muted` are the floor — do not
  introduce a third, fainter grey for body copy.

## 10. The showcase page (what the artifact adds)

The published page is scaffolding around the real app, not a mockup of it:

- A 390×844 handset — real iPhone proportions — with a dynamic island
  (118×34), status bar, home indicator and four hardware buttons.
- The app is **scaled, never reflowed**: `transform: scale(var(--scale))` with
  `transform-origin: top left`, and width/height set to match so the page still
  lays out around it. Side by side on a laptop the phone is bounded by height;
  stacked in a narrow window it is bounded by width and the page scrolls.
- The status bar and home indicator flip from cream to ink when the report
  opens, driven by a `MutationObserver` on `[hidden]`. It is a one-line trick
  and it is what makes the two-surface idea land in a screenshot.
- Layout switches to two columns at `min-width:1000px and min-height:820px` —
  copy left, phone spanning both rows right. Below that everything stacks with
  the phone second, so it is the first thing reached rather than the third.
- Grid columns are `minmax(0,1fr)`, not `auto`, or the fixed-width handset
  pushes the page wider than a narrow window.

## 11. Where to go deeper without breaking the model

Ordered by value, and each one is additive:

- **Close-up photo per device.** The pin sheet is the natural home; the report
  finding already has a body to hold it.
- **Annotated PNG export** so the quote can be texted, not just printed.
- **Compliance clause references.** Every one needs verifying against AS/NZS
  3000 by a person, and the wording is copyrighted — cite clause numbers, never
  reproduce the text.
- **A hosted report** behind a short link, with view tracking. The report is
  already a standalone document; it needs no tool state to render.
- **More of the catalogue.** Adding an issue is: one `ISSUES` entry with a
  `plain` explanation, pointed at an existing or new `FIXES` entry with
  `severity`, `tier`, `price`, `outcome` and `say`. No component changes, no
  new CSS. If a change needs new CSS, check first that it is not really a new
  `.opt` row.
- **Multi-board jobs, customer signature, deposit capture** — all downstream of
  the quote, none of them touch the classify → price → present spine.

## 12. Deliberate, do not "fix"

- The two surfaces not matching. See §1.
- Lime never carrying severity. See §2.
- The tool showing money in mono and the report showing it in Outfit. Different
  jobs: scanning versus reading.
- Tiers disappearing when they would duplicate each other. Fewer, honest options
  beat three that pretend to differ.
- Nothing auto-classified from the photo. See §7.
- Findings collapsed on screen and forced open on paper.
- The whole app being four files and no build step. It has to load off a
  service worker in a garage with no signal.

Known small inconsistency worth resolving if you touch it: the report's step
tiles are 56px in `app.css`, while the comment above them (and the website they
mirror) says 64px. Pick one.
