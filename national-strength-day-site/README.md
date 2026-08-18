# National Strength Day

Australians sharing stories of strength across every age. An initiative of
Strong Australia.

| What | Where |
| ---- | ----- |
| Site | https://nationalstrengthday.org.au |
| Netlify project | `national-strength-day-v2` (id `d677db2b-0a6a-48a7-926f-009cb892215f`) |
| Netlify team | `69b63e196810d75434d119e3` |

Two other Netlify projects, `national-strength-day` and `national-strength`,
are earlier attempts. Neither carries the domain. `national-strength-day` is
password protected. Do not deploy to either.

## Read this before changing anything

**There is no source project.** The live site was deployed by a Netlify
**agent runner**, not from a git repository. The deploy record says
`deploy_source: "agent_runner"`, `manual_deploy: false`, `commit_url: null`,
`public_repo: false`; the `commit_ref` it carries is internal to Netlify and
resolves to nothing on GitHub. The agent runner's workspace is ephemeral and
is gone.

`site/` is the deployed artifact, downloaded from Netlify and committed here
byte for byte. It is now the only surviving copy of this site, and therefore
the source of truth. Nothing will overwrite it on the next build, because
there is no next build — the project is not linked to a repo.

`pandashoe112/strong-australia` is **not** the source. It holds pitch decks
and intelligence reports for the same client, nothing from this site.

## What the site is

A React app built by Vite, served as static files. Two routes, hash-based:
`/` and `/#/story/:id`. The router is deliberately hash-based so the site
needs no catch-all rewrite — see the comment in `site/_redirects`, which
explains why adding one would be a security regression.

Only the built output exists, so the app's components live in
`site/assets/index-8bfigk2a.js`, minified. There is no sourcemap.

## Where the stories live

Two places, and both have to change together.

1. **`site/assets/index-8bfigk2a.js`** — the real data, an array the minifier
   renamed to `la`. This is what the app renders.
2. **`site/index.html`** — a stale pre-rendered snapshot of the homepage
   inside `<div id="root">`. The app mounts with `createRoot().render()`, not
   `hydrateRoot()`, so React discards this markup on mount. It is what
   crawlers and a first paint see, so it still matters for SEO.

`data/stories.json` is that array extracted and pretty-printed. It is working
data, not wired into anything, and it is not deployed — it sits outside
`site/` for that reason.

### Record shape

```
id, name, fullName, location, locationFull, yearBorn,
ageCategory, photo, headline, excerpt,
q1, q2, q3, q4, published, winner
```

`q1` to `q4` answer, in order:

1. How do you build your physical strength?
2. What does "being strong" mean to you?
3. Are there other people involved in motivating you to be strong?
4. If so, who are they and what role do they play?

Age categories are fixed: `18-30`, `31-45`, `46-60`, `61-75`, `76-90`,
`91plus`.

### Published stories

| Story | Category |
| ----- | -------- |
| Jordan Kidd | 18-30 |
| Maddie Dryland | 31-45 |
| Oliver | 31-45 |
| Nicole | 46-60 |
| Jeffo | 61-75 |
| Coralie | 61-75 |
| Judith Murray | 61-75 |
| Fiona Hodson | 61-75 |
| Peter McKinn | 76-90 |

Array order is display order: `bc()` filters by category and does not sort, so
records sit in category order, and by ascending year of birth inside each one.

Nothing in `91plus`. No story has `winner: true`.

Photos are jpgs in `site/images/stories/`, referenced as
`/images/stories/<name>.jpg`. `placeholder.svg` covers a story with no photo — the app tests
`photo.includes("placeholder")` and draws the person's initials on a gradient
instead of an `<img>`, so it is a designed state, not a broken image. An empty
`q3`/`q4` is likewise skipped rather than rendered as an empty block.

## Deploying

The project has no repo link, so pushing here does not deploy. A change
reaches the live site by deploying the contents of `site/` to project
`national-strength-day-v2`.

## Things worth knowing

- **Forms are not enabled** on any of the three Netlify projects. Story
  submissions go through a **Typeform** embed (`embed.typeform.com`, form id
  `01KPSE764SX7QMQBPKCWP94DPW`), so submissions land in Typeform, not Netlify.
  New stories therefore arrive as Typeform responses, and adding one to the
  site is a manual edit here.
- **The CSP is report-only.** `site/_headers` sends
  `Content-Security-Policy-Report-Only`, so violations are reported, never
  blocked. Tightening it to an enforcing header is a separate decision.
- **`site/index.html` opens with a `saved from url=` comment.** It is the
  fingerprint of a browser "Save Page As", which is how that pre-rendered
  snapshot was produced. It is inert, but it is a reminder that the snapshot
  is a copy of an older render and drifts from the bundle unless updated.
- **`site/sitemap.xml` lists only `/` and `/sponsors.html`.** Story pages are
  hash routes, so they are not separately crawlable and are correctly absent.
