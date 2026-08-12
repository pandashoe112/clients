# DUNK client onboarding

One Netlify site serves every client. The client is identified by query params on
the link we send them, so onboarding someone new is *building a link*, not
deploying a site. Nothing here needs a rebuild per client.

| What | Where |
| ---- | ----- |
| Site | https://dunk-client-onboarding.netlify.app |
| Netlify project | `dunk-client-onboarding` (id `948685e8-8264-40c4-9742-a6c4d57de500`) |
| Team | DUNK Agency (`oliver-vcctkmu`) |
| Submissions | Netlify → the project → Forms → `dunk-google-ads-onboarding` |
| Repo | `pandashoe112/clients`, folder `onboarding/` |

## Preparing onboarding for a client

1. Find them in Pipedrive. Organization, the primary person, the won deal, and
   the web form note attached to the deal — that note carries the answers they
   already gave us, so read it before asking for anything twice.
2. Write `clients/<slug>.json` with what the CRM actually holds. Keys are the
   short params in `scripts/build-link.mjs`. Leave a field out rather than
   guessing it: a wrong prefill is worse than a blank one, because the client
   reads it as us having got it wrong.
3. Build and send the link:
   ```
   node scripts/build-link.mjs clients/<slug>.json
   ```
4. Commit the JSON. It is the record of what we claimed to know and when.

The client sees a "Prefilled" chip on every answer that came from us, and the
chip flips to "You changed this" the moment they edit it, so the submission tells
you which of our CRM values they corrected.

## What to prefill, and what not to

Prefill anything the CRM states as fact — name, email, phone, business, website.

Do not prefill a number that only looks right. The web form's "Monthly Marketing
Spend" is the client's whole marketing budget across every channel, and the deal
value is our fee. Neither is the Google Ads budget the form is asking for.

`type` (leads vs online store) decides which half of the form the client sees, so
it is the one worth getting right. If the CRM does not make it obvious, leave it
out and let them pick.

## Deploying a change to the form

```
cd onboarding
npx -y @netlify/mcp@latest --site-id 948685e8-8264-40c4-9742-a6c4d57de500 --proxy-path "<proxy path from the Netlify MCP deploy-site tool>"
```

The proxy path is short lived — get a fresh one from the Netlify MCP `deploy-site`
operation each time. The site is not wired to git yet, so a push alone does not
deploy; see "Still to do".

## Things that will bite

- **New Netlify projects default to requiring SSO team login.** A client opening
  the link would hit a Netlify login wall. It is off for this project. If you
  clone the setup, turn it off again and confirm with an anonymous request.
- **Netlify only registers fields present in the deployed HTML.** Add a field to
  the form and it will not appear in submissions until the site is redeployed.
- **Drafts are held in `localStorage`, scoped per `client` param.** Without a
  `client` param every client shares one draft key, so opening client B's link on
  a browser that already answered client A's restores A's answers over the top.
  Always include `client`.
- **The saved draft wins over the prefill.** If a client has already opened their
  link and you then send a corrected one, their stored draft loads over your new
  values. Change the `client` slug (e.g. `ch-secure-v2`) to force a clean start.
- **Prefilled links carry client details in the query string.** The site is
  `noindex` and the URL is unguessable, but treat the link as you would the CRM
  record it came from. Do not paste it anywhere public.

## Still to do

- Wire the Netlify project to the `pandashoe112/clients` repo (base directory
  `onboarding`, publish directory `onboarding/public`, no build command) so a
  push to `main` deploys instead of the manual CLI step.
- Point a tidy domain at it, e.g. `start.dunk.agency`, so the link we send does
  not read as `*.netlify.app`.
- Decide where submissions should land — Netlify's form inbox only emails. A
  notification into Pipedrive against the deal would close the loop.
