# dunk-site sources

`../index.html` is **generated**. Edit these files, then:

    python3 src/gen.py        # src/* + assets.json -> index.html

| File | What it is |
| ---- | ---------- |
| `style.css` | The design system. Tokens at the top mirror the reference build's names and values |
| `body1.html` | Nav + sheet, hero, logo bar, proof cards, bento, team marquees |
| `body2.html` | Feature grid (light), integrations (mint), client feedback, pricing (light) |
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
- **`BDO Grotesk` is not embedded.** The reference loads it from a Webflow CDN,
  which this build can't reach, so the stack falls back to the already-inlined
  Manrope. Drop a woff2 in and add a `@font-face` to get the real face.

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
- **Marquee lists must be exactly doubled.** The keyframe ends at
  `translateX(-50%)`, so an odd count makes it jump.
