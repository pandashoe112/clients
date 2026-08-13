# DUNK Design System

Brand book and component library. Two CSS files, no build step, no dependencies.

```
dunk-ds/
├── dunk-fonts.css   128 KB — Sahar + Manrope, base64 woff2, latin subsets
├── dunk.css          20 KB — tokens + every component
├── index.html        36 KB — the brand book (open this first)
└── README.md
```

## Use it

```html
<link rel="stylesheet" href="dunk-fonts.css">
<link rel="stylesheet" href="dunk.css">

<body class="dk">
  <section class="dk-band dk-paper">
    <div class="dk-wrap">
      <p class="dk-eyebrow">Services</p>
      <h2 class="dk-h2">Our digital marketing services.</h2>
      <p class="dk-lead">One or two sentences.</p>
    </div>
  </section>
</body>
```

Open `index.html` in a browser to see every component with its class names.

## The short version

**Colour.** Violet is the brand. Lime (`--dk-signal`) is a *signal* — the thing you want
clicked or read, never decoration. Pale lime (`--dk-wash`) is the quiet version: eyebrows,
highlighter, ticker. Gold is star ratings only.

**Grounds.** Alternate them. No two adjacent sections may share a background — it is the
single easiest way to keep a long page legible.

**Type.** Sahar for headings, big numbers and the wordmark. Manrope for everything else.
No third face.

**Copy.** Headings are objective and literal — they say what the section is. The eyebrow is
the boring category label above it; never swap the two. No wordplay headings. Use the
client's exact words when they supply them. Every claim must be defensible.

**Motion.** One curve `cubic-bezier(.2,.7,.3,1)`, three durations (.22s / .3s / .6s).
Cards lift 5px, buttons 2px. Reduced motion is honoured globally.

## Components

| Class | What it is |
| --- | --- |
| `.dk-wrap` `.dk-band` | Container and section padding |
| `.dk-ink` `.dk-paper` `.dk-mist` `.dk-violet` … | Section grounds |
| `.dk-h1` `.dk-h2` `.dk-h3` `.dk-lead` `.dk-body` | Type scale |
| `.dk-em` `.dk-mark` | Accent word, highlighter |
| `.dk-eyebrow` | Section label pill |
| `.dk-btn--signal` `--violet` `--outline` `--block` | Buttons |
| `.dk-link` | Underlined text link |
| `.dk-pill` `.dk-tags` | Pills and tag lists |
| `.dk-card` `.dk-card--dark` | Cards |
| `.dk-photocard` `.dk-frame` | Photo card, framed image |
| `.dk-stats` `.dk-stat` | Icon + stat row |
| `.dk-rows` `.dk-row` | Numbered process rows |
| `.dk-faq` | Accordion (native `<details>`) |
| `.dk-ticker` `.dk-rail` | Marquee, review rail |
| `.dk-form` `.dk-panel` | Form fields, glass panel |
| `.dk-avatars` | Overlapping avatar cluster |
| `.dk-mark-glitch` `-star` `-arrow` + `.dk-tl` `.dk-tr` `.dk-br` `.dk-bl` | Brand marks on corners |
| `.dk-rv` + `.is-in` | Scroll reveal |

## Rebranding for another client

Override the tokens in `:root`. Nothing else needs touching:

```css
:root{
  --dk-violet:#0F62FE;
  --dk-signal:#00E5A0;
  --dk-ink:#0A1628;
  --dk-display:'YourDisplay',sans-serif;
}
```

Swap `dunk-fonts.css` for the new faces and the whole system re-skins.

## Notes

- `.dk` on `<body>` sets the base font, colour and ground.
- Fonts are embedded, so there is no network request and no flash of unstyled text.
- Reveal script (optional, ~8 lines) is at the bottom of `index.html`.
- Everything scales with `clamp()`; there are no breakpoint-only font sizes.
- Verified with no horizontal overflow at 360 / 390 / 768 / 1024 / 1440px.
