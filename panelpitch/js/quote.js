/* Turning taps into money.

   Tiers are cumulative: recommended includes essential, complete includes
   both. That is what makes good/better/best read as one decision rather than
   three separate quotes, and it is why the top tier can carry a discount
   without undercutting the middle one. */

import { FIXES, TIERS, ISSUE_BY_KEY } from './catalogue.js';
import { db } from './store.js';

export const priceOf = (key) => db.price(key, FIXES[key].price);

export function fixesFor(job) {
  // key -> { count, reasons: Set, pins: [n] }
  const out = {};
  const add = (key, reason, pinNo) => {
    const e = out[key] || (out[key] = { count: 0, reasons: new Set(), pins: [] });
    e.count += 1;
    if (reason) e.reasons.add(reason);
    if (pinNo) e.pins.push(pinNo);
  };

  job.pins.forEach((pin, i) => {
    // One pin with three problems that share a fix is still one device to buy
    // and fit, so the fix is counted once and all three reasons are kept.
    const keys = new Set(pin.issues.map((k) => ISSUE_BY_KEY[k].fix));
    keys.forEach((fk) => {
      const reasons = pin.issues.filter((k) => ISSUE_BY_KEY[k].fix === fk).map((k) => ISSUE_BY_KEY[k].label);
      add(fk, reasons.join(' · '), i + 1);
    });
  });
  job.boardFixes.forEach((fk) => add(fk, null, null));
  return out;
}

export function tiers(job, discountPct = 0) {
  const fx = fixesFor(job);
  const rows = { essential: [], recommended: [], complete: [] };

  Object.entries(fx).forEach(([key, e]) => {
    const f = FIXES[key];
    const unit = priceOf(key);
    rows[f.tier].push({
      key, fix: f, count: e.count, unit,
      amount: unit * e.count,
      tbc: !!f.tbc || unit === 0,
      reasons: [...e.reasons],
      pins: e.pins
    });
  });

  const cum = { essential: ['essential'], recommended: ['essential', 'recommended'], complete: TIERS };

  const out = {};
  TIERS.forEach((t) => {
    const lines = cum[t].flatMap((tt) => rows[tt]);
    out[t] = { lines, gross: lines.reduce((a, r) => a + r.amount, 0) };
  });

  // A tier that adds nothing to the one below it is not a second choice, it is
  // the same choice printed twice - and with a discount on the top one it would
  // read as "Complete, for less than Recommended, for identical work". Only
  // tiers that actually differ are offered. Empty tiers are never offered.
  const shown = [];
  let prev = -1;
  TIERS.forEach((t) => {
    const n = out[t].lines.length;
    if (n > 0 && n !== prev) shown.push(t);
    prev = n;
  });

  // The bundle discount belongs to the largest real option, and only when
  // there is a smaller one to weigh it against.
  const top = shown.length > 1 ? shown[shown.length - 1] : null;

  TIERS.forEach((t) => {
    const o = out[t];
    o.discount = t === top ? o.gross * (discountPct / 100) : 0;
    o.ex = o.gross - o.discount;
    o.gst = o.ex * 0.1;
    o.inc = o.ex * 1.1;
    o.tbc = o.lines.some((l) => l.tbc);
    o.offered = shown.includes(t);
  });

  // `top` is the biggest option actually being offered - the number to show on
  // a job card or a running total. It is not always `complete`, because
  // `complete` may be a duplicate that is never put in front of the customer.
  return { rows, shown, top: shown.length ? out[shown[shown.length - 1]] : out.complete, ...out };
}

export const money = (n) => '$' + Math.round(n).toLocaleString('en-AU');
