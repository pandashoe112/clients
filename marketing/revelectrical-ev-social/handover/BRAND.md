# Revelectrical — brand system

Everything below is lifted from the live site (`revelectrical.com.au`), not
invented for these posts. If you change one of these values, the posts stop
matching the site, which is the whole reason they look like they belong.

## The business

| | |
| --- | --- |
| Name | Revelectrical |
| Legal | Everything Electrification Pty Ltd |
| Trade | Licensed Melbourne residential electrician |
| Licence | REC 38205 |
| Phone | 0432 555 826 |
| Email | info@revelectrical.com.au |
| Site | https://www.revelectrical.com.au |
| Rating | 5.0 from 52 Google reviews |
| Established | 2016 |
| Based | Braybrook, VIC 3019 — service-area business, no shopfront |

Services: EV charging, solar batteries, heat pump hot water, switchboard
upgrades, LED lighting, induction cooktops.

**The differentiator, in the client's own words:** *"Any sparky can do chargers,
but we are battery and solar certified and can design and integrate your EV
charger to your existing solar and/or battery setup."* If a post needs a reason
to choose them, that is it.

## Colour

| Token | Hex | Role |
| --- | --- | --- |
| `--ink` | `#032F35` | The ground. Deep blue-green, near-black. |
| `--deep` | `#0B3A40` | A step up from ink, for raised surfaces on dark. |
| `--deep-card` | `#10484E` | Cards and chips on an ink ground. |
| `--cream` | `#F4F6EF` | Type on ink. Never pure white. |
| `--paper` | `#FFFFFF` | Cards on a light ground. |
| `--lime` | `#B6ED3E` | The accent. |
| `--muted` | `#4C6B6E` | Body text on light. |
| `--muted-light` | `rgba(244,246,239,.76)` | Body text on ink. |
| `--star` | `#F5B301` | Review stars only. Never as an accent. |

**The one rule about lime:** it marks action and emphasis, nothing else. A CTA,
a ticked item, a highlighted phrase in a headline. The moment it becomes
decoration the whole thing looks cheap. Spend it in one place per board and
keep everything around it quiet.

Cream on ink, ink on lime. Do not put lime type on cream — it fails contrast.

## Type

| Role | Face | Weights | Settings |
| --- | --- | --- | --- |
| Display | **Outfit** | 600 / 700 / 800 | `letter-spacing: -0.03em`, `line-height: 0.98–1.06` |
| Body | **Manrope** | 500 / 700 / 800 | `line-height: 1.5–1.65` |
| Eyebrow | Manrope 800 | | `letter-spacing: 0.19em`, uppercase |

Both are in `brand/fonts/` as woff2, committed so a rebuild needs no network.
Inline them as data URIs — a font that arrives late renders the whole board in
Arial, and you will not notice until the PNG is already posted.

Numbers that line up in a column get `font-variant-numeric: tabular-nums`.

## Logo

`brand/logo-ink.png` — dark, for light grounds.
`brand/logo-light.png` — cream, for ink grounds. This is the one the posts use.
Both also supplied as `.webp`. 800×125, transparent.

The wordmark is "rev" + "electrical" with a lime bolt worked into the V. Do not
recolour it, outline it, or set it on lime. Minimum width about 180px; below
that the bolt closes up.

## Motifs worth keeping

**The charge rule.** A 4–5px rounded bar, `--line-light` track with a lime fill.
It comes from the process steps on the service pages, where a wire between
steps fills as you scroll. On the four posts it doubles as the carousel
position: 25% / 50% / 75% / 100%, one quarter more lime per board. That is the
one thing making them read as a set rather than four separate images.

**The lime circle-tick.** A 34px lime disc with an ink check inside, used for
every proof point. Straight off the site hero.

**The radial glow.** On an ink ground, a soft lime bloom from the top-right:
`radial-gradient(120% 78% at 88% 6%, rgba(182,237,62,.17), transparent 58%)`.
Stops a flat dark board looking like a black rectangle.

## Writing

Plain, specific, no cleverness. The client rejected "clever" headings across the
whole site and he was right — a heading should say what the thing is to someone
with no context.

- "Dedicated 40A circuit on every install" — good.
- "The hardest suburb we work in, and we like it" — the kind of thing that got
  deleted.

Australian spelling. Never invent a figure, a rebate amount, or a review. Every
number on these boards traces to the live site or Google.
