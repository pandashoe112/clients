# Revelectrical

Working repo for the **Revelectrical** website (Melbourne residential
electrician) and its Sanity CMS.

## The two halves

| Half | Where it lives | Can Claude edit it now? |
| ---- | -------------- | ----------------------- |
| **Content** (reviews, services, suburbs, hero copy, business details) | Sanity project `mt5betow`, dataset `production` | ✅ Yes — directly, this session |
| **Site code** (Astro components, pages, styling) | `revelectrical-site` (not yet in this repo) | ⚠️ Not until the site source is added to a repo |

## Making regular edits

**Content edits** — just ask in plain English, e.g.:
- "Change the phone number to …"
- "Add a new 5-star review from …"
- "Update the hero heading to …"
- "Add Preston (3072) to the service areas."

Claude edits the Sanity content and can publish it live or stage it as a draft
for you to approve in the Studio.

**Site / design edits** — to change how the site looks or works (layout,
components, new sections), the Astro source needs to be in a repo Claude can
reach. See `CLAUDE.md` → "Known gaps".

## Sanity Studio

- Project: https://www.sanity.io/organizations/oKIL2aLz6/project/mt5betow
- Studio: workspace `revelectrical`

## Folders

- `pending-updates/homepage-update/` — a partial frontend patch you uploaded,
  kept here in version control. It applies to the `revelectrical-site` project,
  not to this repo. See its `WHAT-CHANGED.txt`.

See `CLAUDE.md` for full technical context.
