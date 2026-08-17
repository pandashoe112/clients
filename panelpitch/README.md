# Panel Pitch

A switchboard safety quoting tool for licensed electricians. Photograph an open
board, tap the devices with problems, tick what is wrong, and walk out with a
tiered quote plus a customer-facing report that explains each hazard in plain
English.

**This is a separate product.** It shares nothing with `revelectrical-site/` or
`detailsplash-site/` — no build, no Sanity project, no Netlify project. It is
not deployed anywhere yet.

## Running it

Any static server from this folder:

    npx http-server . -p 4400

There is no build step and no dependency to install.

## How it is put together

| File | What it holds |
| ---- | ------------- |
| `js/catalogue.js` | The domain model — issues, fixes, coaching lines, tiers |
| `js/store.js` | Local persistence. No account, no network |
| `js/quote.js` | Issues → fixes → cumulative tiers → money |
| `js/app.js` | Screens and interaction |
| `app.css` | Dark tool, light customer report |
| `sw.js` | Precaches everything so it works with no signal |

The catalogue is deliberately separate from the logic: it is the part with
years of trade knowledge in it, and it should be editable and versionable
without touching code.

### Two design decisions worth keeping

**The tool is dark, the customer report is light.** The electrician uses this
at an open board in a garage; the homeowner reads a document. Making them look
the same would compromise both.

**Nothing is auto-detected from the photo.** The electrician classifies, the
app prices and presents. A model guessing at a compliance call would put a
licensed person's signature behind it.

## Not done yet

- Compliance clause references (every one needs verifying against AS/NZS 3000
  by a person, and the wording is copyrighted — cite numbers, do not reproduce)
- Close-up photos per device
- Annotated PNG export (present mode prints to PDF today)
- Hosted customer report with a short link and view tracking
- Licensing and payment
