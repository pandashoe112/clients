// A picture for the two sections that would otherwise be text on their own:
// the how-we-do-it steps and the why-us grid.
//
// These are chosen rather than taken off the front of the service's install
// strip, so the same photo does not appear twice on one page. Where a service
// has a shot with one of the crew in it, that is the one used - a page of
// nothing but hardware reads as a catalogue.
const EDITORIAL = {
  'ev-charging': {
    steps: { src: '/photos/ev-driveway.webp', alt: 'A home charger mounted inside a garage, cable holstered' },
    why: { src: '/photos/ev-white-wall.webp', alt: 'A wall charger on a rendered wall, cable coiled' }
  },
  'solar-battery': {
    steps: { src: '/photos/battery-wiring.webp', alt: 'One of our electricians wiring a battery into the switchboard' },
    why: { src: '/photos/battery-stack.webp', alt: 'A stacked battery system, labelled and signed off' }
  },
  'switchboard-upgrade': {
    steps: { src: '/photos/switchboard-test.webp', alt: 'Testing a switchboard before sign-off' },
    why: { src: '/photos/team.webp', alt: 'Two of our electricians on site' }
  },
  'heat-pump-hot-water': {
    steps: { src: '/photos/heat-pump.webp', alt: 'A heat pump hot water unit installed outside' },
    why: { src: '/photos/team.webp', alt: 'Two of our electricians on site' }
  },
  'led-lighting': {
    steps: { src: '/photos/downlight-install.webp', alt: 'Fitting a downlight into the ceiling' },
    why: { src: '/photos/downlight.webp', alt: 'Ceiling work finished and made good' }
  },
  'induction-cooking': {
    steps: { src: '/photos/induction-cooktop.webp', alt: 'An induction cooktop installed in a finished kitchen' },
    why: { src: '/photos/team.webp', alt: 'Two of our electricians on site' }
  },
  evnex: {
    steps: { src: '/photos/evnex-boxes.webp', alt: 'Evnex chargers on site, ready to go on' },
    why: { src: '/photos/evnex-white.webp', alt: 'An Evnex charger on a white wall, commissioned' }
  }
};

// `slot` is 'steps' or 'why'. Returns null where there is no photo for that
// page, and the section falls back to running full width.
export function sectionPhoto(slug, slot) {
  return (EDITORIAL[slug] && EDITORIAL[slug][slot]) || null;
}
