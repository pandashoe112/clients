# DUNK homepage — improvement plan

From a dual-agent Impeccable critique of `dunk-site/index.html` (design review +
measured detector evidence, Playwright at 1440x900 and 390x844). Design health
scored **14/32** on Nielsen's heuristics. Everything below is measured, not
estimated. Nothing here has been applied yet.

## P0 — three lines of missing `<head>` cause most of the damage

1. **No `<meta name="viewport">`.** At 390x844 with real device emulation,
   `documentElement.clientWidth` reports **980px** and `visualViewport.scale` is
   **0.3979**. Every phone renders the desktop layout at 40%: body text displays
   at ~6.4px, the h1 at ~14.2px. All sixteen `@media (min-width: …)` breakpoints
   between 520px and 1340px evaluate against 980px, so the whole responsive
   system is dead code on mobile. The mobile layout has never actually been seen.
2. **No `<meta charset>`.** 61 non-ASCII sequences in the file (42 `★`, 5 `→`,
   9 `—`). Without a charset header the browser decodes windows-1252:
   `★★★★★` renders `â˜…â˜…â˜…â˜…â˜…` in the hero pill, the Google-review badge and
   all eight review cards. The Impeccable detector itself crashed on this page
   with a SyntaxError from the same cause.
3. **No `<!DOCTYPE>`** — `document.compatMode` is `BackCompat`, i.e. quirks mode.
   Note the file is written to publish as an artifact, which supplies its own
   doctype wrapper, so this hits the deployed site, not the preview. Also no
   `lang` attribute.

## P0 — my own bug from the heading rewrite

`<br>` with no surrounding space joins words for screen readers and crawlers:
- h1 reads `Google Ads, Meta Ads and SEOfor Australian small businesses.`
- `What you can expectfrom us.`

## P0 — the form cannot capture a lead

`#ctaForm` has no `action` and no `method`. The script calls `preventDefault()`
then `location.href='mailto:sales@dunk.agency?…'`. No success state, no error
path, no conversion event. On a device with no mail client configured the
enquiry evaporates silently. The page belongs to an agency whose own case study
copy says it "fixed conversion tracking so bidding had real signal".

Plan: POST to Netlify Forms via fetch (the sibling `detailsplash-site` already
does this), render an inline success panel inside `.cta__body` keeping the phone
and Calendly fallbacks visible, and fall back to `mailto:` if the POST fails so
the page still works before it is deployed. **Needs a Netlify project for
dunk-site, which does not exist yet — decision required.**

## P1 — flow

- **Delete `.whyus`.** It and `.hww` are one argument told twice: "No lock-in
  contracts" is verbatim in `.whyus` and `.statband`; "We plan it and we run it"
  restates `.hww` rows 01 and 03. Together 2,451px desktop / 3,369px mobile —
  16% of the page — with no proof and no CTA, sitting immediately after the case
  studies where conviction peaks. Fold "SEO and Google Ads planned together"
  into `.hww` as a sixth row, add one CTA at the foot of `.hww`. Also resolves
  the duplicate `id="how-we-work"` (lines 1237 and 1472).
  **Decision required — this deletes client-facing copy.**
- **CTAs: 16 of them, 9 labels, 2 destinations.** Both `.study__cta` buttons and
  "See all case studies" resolve to `#contact`, so three promises of proof
  deliver a form. All three `.pcard` buttons resolve to the identical Calendly
  URL, so the page's one well-sized decision point ignores the decision — append
  a channel parameter and prefill.
- Header "BOOK A FREE QUOTE" (`#contact`) sits beside hero "BOOK A FREE GROWTH
  CALL" (Calendly) on the same screen. Pick one primary action per viewport.

## P1 — styling

- **Delete the eight `<p class="slash">` kickers** (lines 1144, 1240, 1307,
  1349, 1427, 1476, 1562, 1585) and the `.slash` rule at line 67. An eyebrow
  above a heading is a flat ban in the craft floor, and now that the headings
  describe their sections the labels are redundant twice over. Two more `.slash`
  uses elsewhere need checking first.
- `.hero h1{white-space:nowrap}` (line 269) is unconditional — gate to
  `min-width:960px` and drop the `<br>` below that.
- `.hero__split{padding-block:clamp(150px,16vw,210px)}` gives 210px of dead
  space above the h1 at 1440px under a fixed nav; hero reads bottom-heavy.
- `.btn--primary` "All services" is the only purple primary among lime ones.
- `.svc` cards: tag-pill rows wrap to different heights so the four "Explore →"
  links land at four different y-positions and the services cannot be scanned as
  a set. Equalise.
- `.statband` item 4 has a 1-line heading where the others have 2 — set a
  `min-height` on `.stat h3`.
- `.cta__shot` — 448px of decorative collage between decision and action on
  mobile. Hide below 980px.
- `.dash__main` (lines 965-966, 974, 1791) is a fully written line-draw chart
  animation wired into the IntersectionObserver that **no markup ever uses**. On
  15,000px of a performance-marketing homepage there is no chart, no account
  view, no number in motion. Either place it or delete it.

## P1 — colour and contrast

Failing WCAG AA:
- `#f9ce34` stars: **1.51:1** on white (12 review cards), **1.28:1** on `#ecebf3`
- `.logos__row .lg`: **4.35:1** at 390px (six client names)
- `.disco__card b.is-off`: **2.42:1**

Everything else measures well and must not be disturbed: `.cta__copy` 13.3:1,
`.why__item p` 11.0:1, `.study__copy` 10.7:1, `.hero__sub` 9.8:1, lowest passing
element 5.24:1.

## P1 — accessibility

- **36 of 81 interactive elements under 44x44 at 390px.** Real ones (excluding
  WCAG 2.5.8 inline-text exemptions): social icons 38x38, back-to-top 34x34,
  newsletter input 245x37 and Join button 65x37, `.nav__mark` 46.6x30, four
  `.tlink` service links 27px tall.
- **Review marquees cannot be paused on touch** — `:hover`/`:focus-within` only,
  neither exists on a phone, and they run 52s and 78s. WCAG 2.2.2 failure. Needs
  a real pause control.
- Two skipped heading levels: h1 → h3, and h2 → h4 in the footer.
- 32 of 79 SVGs have no `aria-hidden`, no `<title>`, no label.
- Privacy Policy and Terms are both `href="#"`, directly beneath a form
  collecting name, phone, email and website. Social links point at bare
  `facebook.com` / `linkedin.com` / `instagram.com` — root domains, not
  profiles. **Real URLs needed, or the pages written.**

## Performance

965,302 bytes in one document, **87.8% base64**: 31 images (717KB) and 7 fonts
(130KB) inlined. Nothing can be lazy-loaded, cached across pages or served
responsively, and all of it blocks first paint. For an agency selling Google
Ads, its own LCP is the strongest argument against hiring it.

## What is already good — do not regress it

- Reduced motion is properly engineered: not just animations killed but the
  finished state forced (`.rv,.seq>*{opacity:1;transform:none}`,
  `stroke-dashoffset:0`), mirrored in the JS.
- `:focus-visible` gives a 2px `--signal` outline at 3px offset on all 16 first
  tab stops.
- 31/31 images have alt. 8/8 form controls labelled, correct `type` and
  `autocomplete`. 72/72 links and buttons have accessible names.
- Mobile menu is `<details>/<summary>` — keyboard-accessible with zero JS.
- CLS 0.036.
- The pre-form reassurance (`.cform__who`, three real faces, "One of us replies
  personally, usually same business day") is the best-designed moment on the
  page. The peak-end problem is what happens after the button, not before it.
