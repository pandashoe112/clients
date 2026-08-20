# Prompt to hand to Claude

Paste the block below into a fresh Claude Code session opened in this folder.
Everything it refers to is here.

---

You are picking up a finished piece of design work and continuing it.

This folder contains four social media posts for **Revelectrical**, a licensed
Melbourne residential electrician, advertising home EV charger installation
across the suburbs they cover. The posts are built, exported and approved. Your
job is to be able to rebuild them, change them, and produce more in the same
system.

**Read these first, in this order:**

1. `HANDOVER.md` — how it is built, and every trap I hit building it
2. `BRAND.md` — the colours, type, logo and motifs, all taken from the live site
3. `src/template.html` — the four boards, in one file
4. `reference/` — the four approved PNGs. This is what good looks like.

**To rebuild exactly what is there now:**

```sh
npm install
npm run all      # crops -> build -> export
```

That regenerates `ev-charging-social-posts.html` and `png/01…04.png`. Compare
your output against `reference/` — they should be identical.

**Ground rules, which are not negotiable:**

- **Never invent a number.** Every figure on these boards traces to the live
  site or to Google: 5.0 from 52 reviews, REC 38205, the eleven suburbs and
  their postcodes, the review text. If you need a figure you do not have, ask
  for it or leave it out. Do not estimate.
- **The review is quoted verbatim.** Do not tidy the grammar.
- **Lime is for action and emphasis only.** One place per board. It is not
  decoration.
- **Headings say what the thing is.** No cleverness, no wordplay. The client
  has already rejected that across the whole website.
- **Check the crop before you ship it.** The photos are real jobs at real
  customers' houses. One had a visible number plate; it is cropped out on
  purpose. Look for plates, house numbers, faces and anything else that is not
  yours to publish.
- **Look at what you made.** Screenshot every board and actually read it before
  you say it is done. Most of the mistakes in `HANDOVER.md` were invisible in
  the code and obvious in the render.

**If you are asked for new posts rather than a rebuild:** copy an existing
board in `src/template.html` as the starting point, keep the charge rule and
the tick motif, and re-cut any new photo at the ratio the board actually
renders it at — see the crop trap in `HANDOVER.md`.
