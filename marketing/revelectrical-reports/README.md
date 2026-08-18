# Revelectrical — search performance reports

Client-facing reports on how the site is performing in Google, built from the
site's own brand tokens so a report and the site it reports on are the same
green rather than two similar ones.

| File | What it is |
| ---- | ---------- |
| `revelectrical-search-report.html` | First week on the new site, 10–16 Aug 2026 vs 3–9 Aug 2026 |

The HTML is fully self-contained: fonts are inlined, there is no network call,
and it prints straight to PDF from the browser. It is theme-aware — the same
file reads correctly whether the viewer's OS is set to light or dark.

## Regenerating

```sh
node src/build.mjs      # src/template.html + the figures in build.mjs -> the HTML
```

Figures live as arrays at the top of `src/build.mjs`, not in the markup. The
bars and the percentages are computed from them, so the chart and the number
beside it cannot end up disagreeing. To report a new week, edit those arrays
and the prose in `src/template.html`.

`src/fonts/` holds the Outfit and Manrope weights, committed so a rebuild does
not need the network.

## A note on the numbers

Old-week figures come from the previous Wix dashboard, which double-lists some
terms and whose rows do not sum to its own totals. The weekly summary figures
are reliable; the term-level ones are indicative. That caveat is stated in
Section 07 of the report itself and should stay there.
