/* The domain model. Kept apart from the app so it can be versioned, exported
   and re-imported as a price book without touching a line of logic.

   An issue is what the electrician SEES. A fix is what they DO about it.
   Several issues can share one fix - a Type AC RCBO, a missing RCD and a
   wrongly rated breaker all end in the same device - so the fix is charged
   once while every reason still prints on the quote. That mapping is the
   whole product; everything else is presentation. */

export const SEVERITY = {
  danger: { label: 'Immediate risk', color: '#FF4D4F' },
  warn:   { label: 'Not to standard', color: '#FFA83A' },
  improve:{ label: 'Worth upgrading', color: '#7C5CFF' }
};

export const TIERS = ['essential', 'recommended', 'complete'];

export const ISSUES = [
  { key: 'type_ac',      fix: 'rcbo',         label: 'Type AC safety switch',
    plain: 'The safety switch fitted here is an older type that can be blinded by the DC leakage modern appliances produce - solar, EV chargers, induction cooktops, LED drivers. When it is blinded it stops protecting the circuit and nobody knows.' },
  { key: 'no_rcd',       fix: 'rcbo',         label: 'No safety switch at all',
    plain: 'This circuit has overload protection but nothing protecting a person. A breaker trips to save the wiring; a safety switch trips to save someone getting a shock. Only one of those is fitted here.' },
  { key: 'wrong_rating', fix: 'rcbo',         label: 'Wrongly rated for the circuit',
    plain: 'The protection is rated higher than the cable behind it can carry. The cable can be overloaded and heat up without the breaker ever tripping.' },
  { key: 'ceramic',      fix: 'replace_fuse', label: 'Ceramic or rewirable fuse',
    plain: 'A rewirable fuse is a piece of wire in a ceramic holder. It is slow, it can be rewired with the wrong wire, and it offers no protection against electric shock at all.' },
  { key: 'doubled',      fix: 'separate',     label: 'Two circuits on one breaker',
    plain: 'Two circuits are sharing one protective device. Together they can draw more than the device is sized for, and turning one off means turning both off - which makes safe isolation for future work harder.' },
  { key: 'mains_noprot', fix: 'mains_cb',     label: 'Main switch with no protection',
    plain: 'The incoming mains have a switch but no overcurrent protection. A fault on the mains side has nothing in front of it inside the board.' },
  { key: 'no_labels',    fix: 'cleanup',      label: 'Unlabelled or wrongly labelled',
    plain: 'Circuits are not identified. In an emergency nobody can isolate the right one quickly, and the next electrician is guessing.' }
];

export const FIXES = {
  rcbo: {
    kind: 'breaker', severity: 'danger', tier: 'recommended', price: 150,
    name: 'Fit a compliant Type A safety switch',
    outcome: 'That circuit gets modern shock and overload protection that works with today’s appliances.',
    say: 'Point at the device, name it, then say what it cannot do. "This one is an older type - it protects the wiring, not you, once there is any solar or EV load on the house."'
  },
  replace_fuse: {
    kind: 'breaker', severity: 'danger', tier: 'essential', price: 150,
    name: 'Replace the fuse with a safety switch',
    outcome: 'The slowest and least safe device in the board is replaced with one that trips in milliseconds.',
    say: 'Show them the fuse wire. "This is the original 1960s protection. It will not save a person, and anybody can rewire it with the wrong gauge."'
  },
  separate: {
    kind: 'breaker', severity: 'warn', tier: 'recommended', price: 180,
    name: 'Split the doubled-up circuit',
    outcome: 'Each circuit gets its own correctly sized protection and can be isolated on its own.',
    say: 'Frame it as future work getting cheaper: "Right now half the house goes off to work on one room."'
  },
  mains_cb: {
    kind: 'breaker', severity: 'danger', tier: 'essential', price: 220,
    name: 'Add main switch overcurrent protection',
    outcome: 'The incoming mains are protected inside the board rather than relying on the street fuse.',
    say: 'This one is usually new information to the customer. Keep it factual, not dramatic.'
  },
  fireseal: {
    kind: 'board', severity: 'danger', tier: 'essential', price: 120,
    name: 'Fire-seal the board penetrations',
    outcome: 'Fire and smoke can no longer travel up the wall cavity through the cable entries.',
    say: 'Shine a torch into the gap. Nobody needs the theory once they have seen the hole.'
  },
  cleanup: {
    kind: 'board', severity: 'warn', tier: 'essential', price: 90,
    name: 'Clean up and label every circuit',
    outcome: 'Anyone can isolate the right circuit in seconds, including in an emergency.',
    say: 'Ask them which switch turns off the kitchen. The pause answers the question for you.'
  },
  asbestos: {
    kind: 'board', severity: 'danger', tier: 'essential', price: 0, tbc: true,
    name: 'Replace asbestos backing board',
    outcome: 'The hazardous backing is removed by a licensed remover before any board work begins.',
    say: 'Do not guess a price. Say it needs a licensed remover and you will confirm the figure.'
  },
  surge: {
    kind: 'board', severity: 'improve', tier: 'complete', price: 350,
    name: 'Whole-of-home surge protection',
    outcome: 'Solar, EV, appliances and electronics are shielded from grid spikes and nearby strikes.',
    say: 'Price it against one replaced fridge or inverter. That comparison does the selling.'
  },
  fullstd: {
    kind: 'board', severity: 'improve', tier: 'complete', price: 0, tbc: true,
    name: 'New board to current standard',
    outcome: 'Every circuit is brought to current standard, with room for solar, battery and EV.',
    say: 'Offer this when more than half the board needs work - it is usually cheaper than fixing each one.'
  }
};

export const ISSUE_BY_KEY = Object.fromEntries(ISSUES.map((i) => [i.key, i]));
export const BREAKER_FIXES = Object.keys(FIXES).filter((k) => FIXES[k].kind === 'breaker');
export const BOARD_FIXES = Object.keys(FIXES).filter((k) => FIXES[k].kind === 'board');
