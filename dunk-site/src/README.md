# dunk-site sources

`../index.html` is **generated**. Edit these files, then:

    python3 src/gen.py        # src/* + assets.json -> index.html

| File | What it is |
| ---- | ---------- |
| `style.css` | The design system: DUNK's palette + Sahar, the Setrex structure, and the SaleUnion component layer at the bottom |
| `body1.html` | Announcement bar, nav + sheet, DUNK split hero, pastel stat trio + testimonial, bento, tall photo cards |
| `body2.html` | Feature grid, integrations (mint), dark stat panel, pricing (light) |
| `body3.html` | FAQ, recent work (light), final CTA, footer |
| `app.js` | Reveal observer, canvas starfield, FAQ accordion, pricing toggle, mobile sheet |
| `logo.svg` | The DUNK wordmark |
| `assets.json` | Seven woff2 faces and 24 photos, base64. `{{IMG0}}`–`{{IMG23}}` index into `images` |

`gen.py` also builds the two team marquees and the integration rail from lists
at the top of the file, and asserts no `{{PLACEHOLDER}}` survives — a bad image
key fails the build instead of shipping a broken `src`.

## Needs your input before this goes live

- **Pricing figures are invented.** `from $1,900` / `from $4,500` exist to make
  the component read correctly. Search `PLACEHOLDER PRICES` in `body2.html`.
- **The client portrait is a reused site avatar.** Search
  `PLACEHOLDER PORTRAIT` in `body1.html`.
- **The team marquee names and roles are invented** (`PEOPLE` in `gen.py`).
  Real names, roles and headshots should replace them.
- **Neither reference's face is embedded.** Setrex's `BDO Grotesk` and
  SaleUnion's `Aspekta` and `Geist Mono` all load from Webflow CDNs this build
  can't reach. Headings use DUNK's own Sahar, body copy Manrope, and the mono
  labels IBM Plex Mono — all three already inlined.

## Where each reference shows up

Three references are layered, deliberately:

- **DUNK** — the palette (`#150A2E`, `#1D0F3E`, `#D7F24C`, violets), Sahar on
  every heading, the split hero with its avatar cluster, checkerboard burst,
  asterisk, ratepill and arrow-badge pill CTA.
- **Setrex** — the page structure and section order, the floating pill nav,
  the bento, the pricing pair with its period toggle, the FAQ accordion.
- **SaleUnion** — the type scale (h1 76 / h2 64 / h3 54 / h4 44 / h5 32 /
  h6 24 at 100–130% with per-heading tracking), the container at 81rem, the
  mono uppercase section eyebrow that replaced the bordered pill, the
  announcement bar, the pastel stat trio, the tall photo cards with their
  category labels, the circular arrow button, and the dark stat panel. Its
  turquoise `#A4F7D2` and the pink/blue pastels sit alongside DUNK's lime as
  a secondary set. Its `--su-*` tokens are grouped in `:root`.

## Section rhythm

Dark by default. Light sections, in order: the proof block straight after the
hero (`sec--light`), integrations (`sec--mint`), pricing (`sec--light`) and
recent work (`sec--light`).

## Traps worth knowing

- **Watch specificity against `.sec--light .card`.** It is `(0,2,0)`, so a
  single-class modifier like `.plan--hi` loses to it and the yellow plan
  renders white. Modifiers are written `.plan.plan--hi` for that reason.
- **Base rules must come *before* the media queries that override them.**
  `.nav__burger{display:grid}` sitting after its own `min-width:1000px`
  override is why the burger kept appearing on desktop.
- **Grid tracks need `minmax(0,1fr)`.** Plain `1fr` can't shrink below
  `min-content`, which is how the logo row pushed the page 18px wide.
- **`.orbit` positions its nodes by class, not `nth-child`.** The inline
  `<svg>` counts as a child and shifts every index by one.
- **`<figure>`/`<blockquote>`/`<dl>` are reset in `style.css`** — the UA
  `margin: 1em 40px` on `figure` breaks any flex row it sits in.
- **Muted text and hairlines come from `--muted` and `--stroke`, not
  `--colors--white-70` / `--colors--stroke-white` directly.** Those two flip on
  `.sec--light` / `.sec--mint` / `.sec--butter`. Hardcoding the white tokens is
  how the proof block rendered lavender-on-paper when it moved to a light
  ground. Always-dark surfaces (nav, sheet, footer, hero, final CTA, the dark
  plan, the review rail) pin them back at the bottom of the file.
- **The section eyebrow is `.tag`, and it is no longer a pill.** The bordered
  version lives on as `.pill` where it still earns its place.
- **`.arw` inherits `currentColor` and fills on parent hover.** Nest it inside
  the `<a>`/`.wcard`/`.tall` you want driving it, not beside.
- **Marquee lists must be exactly doubled.** The keyframe ends at
  `translateX(-50%)`, so an odd count makes it jump.
