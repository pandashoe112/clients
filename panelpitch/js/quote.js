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

  const sum = (t) => rows[t].reduce((a, r) => a + r.amount, 0);
  const cum = { essential: ['essential'], recommended: ['essential', 'recommended'], complete: TIERS };

  const out = {};
  TIERS.forEach((t) => {
    const lines = cum[t].flatMap((tt) => rows[tt]);
    const gross = cum[t].reduce((a, tt) => a + sum(tt), 0);
    const disc = t === 'complete' ? gross * (discountPct / 100) : 0;
    const ex = gross - disc;
    out[t] = { lines, gross, discount: disc, ex, gst: ex * 0.1, inc: ex * 1.1, tbc: lines.some((l) => l.tbc) };
  });
  return { rows, ...out };
}

export const money = (n) => '$' + Math.round(n).toLocaleString('en-AU');
