# dunk-site sources

`index.html` at the repo root of this folder is **generated**. Edit the files
here and rebuild:

    python3 src/gen.py        # src/* + assets.json -> index.html

| File | What it is |
| ---- | ---------- |
| `style.css` | The whole design system: tokens, chapters 00–09, responsive rules |
| `body1.html` | Nav, chapter rail, hero, the goal selector (01), the diagnosis (02) |
| `body2.html` | The plan (03), proof (04), what we run (05), who it's for (06) |
| `body3.html` | The strategy call (07), reviews (08), close, footer, mobile sheet |
| `app.js` | Reveal observer, goal selector, chapter-rail scroll spy, mobile sheet |
| `logo.svg` | The DUNK wordmark |
| `assets.json` | The seven woff2 faces and 24 photos, base64. `{{IMG0}}`–`{{IMG23}}` in the markup index into `images` |

The page ships as one self-contained file with every font and photo inlined,
which is why the markup is templated rather than edited directly.

`gen.py` asserts that no `{{PLACEHOLDER}}` survives substitution, so a typo in
an image key fails the build rather than shipping a broken `src`.

## Things worth knowing

- **`<figure>`, `<blockquote>` and `<dl>` are reset in `style.css`.** The UA
  `margin: 1em 40px` on `figure` showed up as 40px gaps in the review marquee.
- **The hero photo needs `height:auto`.** It carries `width`/`height`
  attributes to avoid layout shift, and those beat CSS `aspect-ratio` unless
  height is released.
- **The review marquee is the six reviews twice over.** The keyframe animates
  to `translateX(-50%)`, so the list must be exactly doubled or it jumps.
- **The chapter rail is `--rail` wide and `.shell` adds it to `padding-left`.**
  Anything full-bleed that must clear the rail needs `.shell`, not just padding.
- **The form is inert.** It cancels submit and swaps the button label. Wire it
  to Netlify Forms or a handler before this goes live.
