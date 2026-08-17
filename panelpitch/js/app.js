import { ISSUES, FIXES, ISSUE_BY_KEY, BOARD_FIXES, SEVERITY, TIERS } from './catalogue.js';
import { db, newJob } from './store.js';
import { tiers, priceOf, money } from './quote.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TICK = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';

let job = null;
let screen = 'jobs';
let activePin = null;

/* ---------- severity of a pin: worst issue wins ---------- */
const RANK = { danger: 3, warn: 2, improve: 1 };
function pinSeverity(pin) {
  let worst = null;
  pin.issues.forEach((k) => {
    const s = FIXES[ISSUE_BY_KEY[k].fix].severity;
    if (!worst || RANK[s] > RANK[worst]) worst = s;
  });
  return worst;
}
const pinColor = (pin) => (pinSeverity(pin) ? SEVERITY[pinSeverity(pin)].color : null);

/* ---------- navigation ---------- */
function go(next) {
  screen = next;
  ['scJobs', 'scBoard', 'scReview'].forEach((id) => { $(id).hidden = true; });
  $({ jobs: 'scJobs', board: 'scBoard', review: 'scReview' }[next]).hidden = false;
  $('backBtn').hidden = next === 'jobs';
  render();
}

$('backBtn').onclick = () => {
  if (screen === 'review') go('board');
  else { job = null; go('jobs'); }
};
$('settingsBtn').onclick = openSettings;

/* ---------- render ---------- */
function render() {
  if (screen === 'jobs') return renderJobs();
  if (screen === 'board') return renderBoard();
  if (screen === 'review') return renderReview();
}

function renderJobs() {
  $('barTitle').textContent = 'Panel Pitch';
  const biz = db.business().name;
  $('barSub').textContent = biz ? biz : 'Switchboard safety quoting';
  const jobs = db.jobs();
  $('jobsEmpty').hidden = jobs.length > 0;
  $('jobList').innerHTML = jobs.map((j) => {
    const t = tiers(j, db.business().discount || 0);
    return `<li><button class="jobcard" data-open="${j.id}">
      ${j.photo ? `<img class="jobcard__thumb" src="${j.photo}" alt="">` : '<div class="jobcard__thumb"></div>'}
      <span class="jobcard__main">
        <span class="jobcard__name">${esc(j.customer || j.site || 'Untitled board')}</span>
        <span class="jobcard__meta">${j.pins.length} marked · ${new Date(j.updated).toLocaleDateString('en-AU')}</span>
      </span>
      <span class="jobcard__val">${t.top.ex ? money(t.top.inc) : '—'}</span>
    </button></li>`;
  }).join('');
  $('jobList').querySelectorAll('[data-open]').forEach((b) => {
    b.onclick = () => { job = db.job(b.dataset.open); go('board'); };
  });
  dock(jobs.length ? [{ label: 'New board', cls: 'btn--primary', fn: startJob }] : []);
}

function renderBoard() {
  $('barTitle').textContent = job.customer || 'New board';
  $('barSub').textContent = job.site || 'Tap each device with a problem';

  const wrap = $('boardWrap');
  if (!job.photo) {
    wrap.innerHTML = `<div class="empty" style="padding:40px 12px">
      <h2>Photograph the board</h2>
      <p>Straight on, door open, whole board in frame. You will tap the devices next.</p>
      <button class="btn btn--primary btn--lg" id="shootBtn">Take photo</button></div>`;
    $('shootBtn').onclick = () => $('photoInput').click();
  } else {
    wrap.innerHTML = `<div class="board" id="boardImg"><img src="${job.photo}" alt="Switchboard">
      ${job.pins.map((p, i) => {
        const c = pinColor(p);
        return `<button class="pin ${c ? '' : 'pin--empty'}" data-pin="${i}"
          style="left:${p.x}%;top:${p.y}%;${c ? `background:${c}` : ''}">${i + 1}</button>`;
      }).join('')}
      <span class="boardhint">${job.pins.length ? 'Tap a marker to edit · tap the board to add' : 'Tap each device that has a problem'}</span>
    </div>`;
    $('boardImg').onclick = (e) => {
      const hit = e.target.closest('[data-pin]');
      const r = $('boardImg').getBoundingClientRect();
      if (hit) return openPin(Number(hit.dataset.pin));
      job.pins.push({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, issues: [], note: '' });
      save();
      openPin(job.pins.length - 1);
    };
  }

  const t = tiers(job, db.business().discount || 0);
  $('tPins').textContent = job.pins.length;
  $('tIssues').textContent = job.pins.reduce((a, p) => a + p.issues.length, 0) + job.boardFixes.length;
  $('tValue').textContent = t.top.ex ? money(t.top.inc) : '$0';

  $('boardOpts').innerHTML = BOARD_FIXES.map((k) => {
    const f = FIXES[k], on = job.boardFixes.includes(k);
    return `<button class="opt ${on ? 'is-on' : ''}" data-bfix="${k}">
      <span class="opt__tick">${TICK}</span>
      <span class="opt__body">
        <span class="opt__name"><span class="dot" style="background:${SEVERITY[f.severity].color}"></span>${esc(f.name)}</span>
        <span class="opt__why">${esc(f.outcome)}</span>
      </span>
      <span class="opt__price">${f.tbc || !priceOf(k) ? 'TBC' : money(priceOf(k))}</span>
    </button>`;
  }).join('');
  $('boardOpts').querySelectorAll('[data-bfix]').forEach((b) => {
    b.onclick = () => {
      const k = b.dataset.bfix;
      job.boardFixes = job.boardFixes.includes(k) ? job.boardFixes.filter((x) => x !== k) : [...job.boardFixes, k];
      save(); renderBoard();
    };
  });

  dock(job.photo ? [
    { label: 'Job details', cls: 'btn--ghost', fn: openJobDetails },
    { label: 'See the options', cls: 'btn--primary', fn: () => go('review') }
  ] : []);
}

function renderReview() {
  $('barTitle').textContent = 'The options';
  $('barSub').textContent = job.customer || 'Ready to present';
  const disc = db.business().discount || 0;
  const t = tiers(job, disc);
  const names = { essential: 'Essential', recommended: 'Recommended', complete: 'Complete' };

  const pick = t.shown.includes('recommended') ? 'recommended' : t.shown[t.shown.length - 1];

  // The heading counts the options that are actually on screen. Two identical
  // tiers get collapsed upstream, so "three" is not always true.
  const WORD = ['No', 'One', 'Two', 'Three'];
  $('tierHead').textContent = `${WORD[t.shown.length] || t.shown.length} way${t.shown.length === 1 ? '' : 's'} to fix it`;
  $('tierSub').textContent = t.shown.length > 1
    ? 'Each option includes everything in the one before it.'
    : 'Everything found on this board, in one job.';
  $('tierList').innerHTML = (t.shown.length ? t.shown : []).map((k) => {
    const d = t[k];
    return `<button class="tier ${k === pick ? 'is-pick' : ''}" data-tier="${k}">
      <span class="tier__top">
        <span class="tier__name">${names[k]}</span>
        <span class="tier__price">${d.ex ? money(d.inc) : '—'}${d.tbc ? '<span style="font-size:.75rem;color:var(--warn)"> +TBC</span>' : ''}</span>
      </span>
      <span class="tier__note">${d.lines.length} item${d.lines.length === 1 ? '' : 's'} · inc GST${
        d.discount ? `<span class="tier__save">−${disc}% bundled</span>` : ''}</span>
    </button>`;
  }).join('');

  const lines = t.complete.lines;
  $('lineCount').textContent = `${lines.length} item${lines.length === 1 ? '' : 's'}`;
  $('lineList').innerHTML = lines.length ? lines.map((l) => `
    <div class="opt" style="cursor:default">
      <span class="opt__body">
        <span class="opt__name"><span class="dot" style="background:${SEVERITY[l.fix.severity].color}"></span>${esc(l.fix.name)}${l.count > 1 ? ` × ${l.count}` : ''}</span>
        <span class="opt__why">${l.pins.length ? `Device ${l.pins.join(', ')} — ` : ''}${esc(l.reasons.join(' · ') || l.fix.outcome)}</span>
      </span>
      <span class="opt__price">${l.tbc ? 'TBC' : money(l.amount)}</span>
    </div>`).join('')
    : '<p class="note">Nothing marked yet. Go back and tap the devices with problems.</p>';

  dock([
    { label: 'Coaching', cls: 'btn--ghost', fn: openCoaching },
    { label: 'Present to customer', cls: 'btn--primary', fn: openPresent }
  ]);
}

/* ---------- dock ---------- */
function dock(buttons) {
  const d = $('dock');
  d.hidden = buttons.length === 0;
  d.innerHTML = '';
  buttons.forEach((b) => {
    const el = document.createElement('button');
    el.className = 'btn ' + b.cls;
    el.textContent = b.label;
    el.onclick = b.fn;
    d.appendChild(el);
  });
}

/* ---------- sheets ---------- */
function sheet(html, after) {
  $('sheetBody').innerHTML = html;
  $('sheet').hidden = false;
  if (after) after();
}
function closeSheet() { $('sheet').hidden = true; activePin = null; render(); }
$('sheet').querySelector('[data-close]').onclick = closeSheet;

function openPin(i) {
  activePin = i;
  const pin = job.pins[i];
  sheet(`
    <h2>Device ${i + 1}</h2>
    <p class="sheet__sub">Tick everything wrong with this one. Problems that share a fix are only charged once.</p>
    <div class="opts">
      ${ISSUES.map((is) => {
        const on = pin.issues.includes(is.key);
        const f = FIXES[is.fix];
        return `<button class="opt ${on ? 'is-on' : ''}" data-issue="${is.key}">
          <span class="opt__tick">${TICK}</span>
          <span class="opt__body">
            <span class="opt__name"><span class="dot" style="background:${SEVERITY[f.severity].color}"></span>${esc(is.label)}</span>
            <span class="opt__why">${esc(f.name)}</span>
          </span>
          <span class="opt__price">${money(priceOf(is.fix))}</span>
        </button>`;
      }).join('')}
    </div>
    <div style="display:flex;gap:10px;margin-top:18px">
      <button class="btn btn--ghost" id="pinDel">Remove</button>
      <button class="btn btn--primary" style="flex:1" id="pinDone">Done</button>
    </div>`, () => {
    $('sheetBody').querySelectorAll('[data-issue]').forEach((b) => {
      b.onclick = () => {
        const k = b.dataset.issue;
        pin.issues = pin.issues.includes(k) ? pin.issues.filter((x) => x !== k) : [...pin.issues, k];
        save(); openPin(i);
      };
    });
    $('pinDel').onclick = () => { job.pins.splice(i, 1); save(); closeSheet(); };
    $('pinDone').onclick = closeSheet;
  });
}

function openJobDetails() {
  sheet(`
    <h2>Job details</h2>
    <p class="sheet__sub">Appears on the customer's report.</p>
    <div class="field"><label>Customer</label><input class="input" id="fCust" value="${esc(job.customer)}" placeholder="Name"></div>
    <div class="field"><label>Site address</label><input class="input" id="fSite" value="${esc(job.site)}" placeholder="Street and suburb"></div>
    <div class="field"><label>Your reference</label><input class="input" id="fRef" value="${esc(job.ref)}" placeholder="Optional"></div>
    <button class="btn btn--primary btn--block" id="fSave">Save</button>
    <button class="btn btn--quiet btn--block" id="fDel" style="margin-top:8px;color:var(--danger)">Delete this board</button>`, () => {
    $('fSave').onclick = () => {
      job.customer = $('fCust').value.trim();
      job.site = $('fSite').value.trim();
      job.ref = $('fRef').value.trim();
      save(); closeSheet();
    };
    $('fDel').onclick = () => {
      if (!confirm('Delete this board and its quote?')) return;
      db.remove(job.id); job = null; $('sheet').hidden = true; go('jobs');
    };
  });
}

function openCoaching() {
  const t = tiers(job, db.business().discount || 0);
  sheet(`
    <h2>What to say</h2>
    <p class="sheet__sub">One line per item. Say the problem, then the consequence, then stop talking.</p>
    ${t.complete.lines.length ? t.complete.lines.map((l) => `
      <div class="note" style="margin-bottom:10px">
        <strong style="color:var(--text);display:block;margin-bottom:5px">${esc(l.fix.name)}</strong>
        ${esc(l.fix.say)}
      </div>`).join('') : '<p class="note">Mark some devices first.</p>'}`);
}

function openSettings() {
  const b = db.business();
  sheet(`
    <h2>Your business</h2>
    <p class="sheet__sub">Appears on every report. Prices are yours to set and verify.</p>
    <div class="field"><label>Business name</label><input class="input" id="sName" value="${esc(b.name || '')}" placeholder="e.g. Smith Electrical"></div>
    <div class="field">
      <label>Logo on the report</label>
      <div class="logorow">
        <span class="logorow__prev" id="sLogoPrev">${b.logo ? `<img src="${b.logo}" alt="">` : 'No logo'}</span>
        <button class="btn btn--ghost btn--sm" id="sLogoPick" type="button">${b.logo ? 'Replace' : 'Upload'}</button>
        ${b.logo ? '<button class="btn btn--quiet btn--sm" id="sLogoClear" type="button">Remove</button>' : ''}
      </div>
      <input type="file" id="sLogoFile" accept="image/*" hidden>
    </div>
    <div class="row2">
      <div class="field"><label>Licence</label><input class="input" id="sLic" value="${esc(b.licence || '')}" placeholder="REC 00000"></div>
      <div class="field"><label>Phone</label><input class="input" id="sPhone" value="${esc(b.phone || '')}" placeholder="Optional"></div>
    </div>
    <div class="field"><label>Review line on the report</label><input class="input" id="sRating" value="${esc(b.rating || '')}" placeholder="e.g. 5.0 from 48 Google reviews"></div>
    <div class="field"><label>Bundle discount on the top option (%)</label><input class="input" id="sDisc" type="number" min="0" max="40" value="${b.discount || 0}"></div>
    <div class="sectionhead"><h2>Price book</h2><span>excluding GST</span></div>
    <div class="opts">
      ${Object.keys(FIXES).map((k) => `
        <div class="opt" style="cursor:default">
          <span class="opt__body"><span class="opt__name">${esc(FIXES[k].name)}</span></span>
          <input class="input" style="width:104px;text-align:right;padding:9px 11px" type="number" data-price="${k}" value="${priceOf(k)}">
        </div>`).join('')}
    </div>
    <p class="note warnnote" style="margin-top:16px">Every figure, classification and compliance decision in this app is yours as the licensed electrician. Nothing here is advice.</p>
    <button class="btn btn--primary btn--block" style="margin-top:14px" id="sSave">Save</button>`, () => {
    // Choosing a logo redraws this sheet, so anything typed and not yet saved
    // has to be banked first or it silently disappears.
    const commit = () => {
      db.setBusiness({
        name: $('sName').value.trim(), licence: $('sLic').value.trim(),
        phone: $('sPhone').value.trim(), rating: $('sRating').value.trim(),
        discount: Number($('sDisc').value) || 0
      });
      $('sheetBody').querySelectorAll('[data-price]').forEach((inp) => {
        db.setPrice(inp.dataset.price, Number(inp.value) || 0, FIXES[inp.dataset.price].price);
      });
    };

    // The logo is stored inline with everything else, so a report still carries
    // the brand with no network and no asset host.
    $('sLogoPick').onclick = () => $('sLogoFile').click();
    $('sLogoFile').onchange = async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      commit();
      db.setBusiness({ logo: await downscale(f, 480, 'image/png') });
      openSettings();
    };
    if ($('sLogoClear')) $('sLogoClear').onclick = () => { commit(); db.setBusiness({ logo: null }); openSettings(); };

    $('sSave').onclick = () => { commit(); closeSheet(); };
  });
}

/* ---------- the customer report ----------------------------------------
   Built out of the website's own sections - ink hero, cream board, paper
   findings, ink options, cream next-steps, ink footer - so the homeowner
   recognises it as the same business they found on Google. */

const I = {
  check: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M8.2 12.3l2.6 2.6 5-5.2"/></svg>',
  shield: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5l7.5 3v6c0 4.6-3.1 8.6-7.5 10-4.4-1.4-7.5-5.4-7.5-10v-6z"/></svg>',
  phone: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 3h3l1.5 4-2 1.4a12 12 0 006.6 6.6l1.4-2 4 1.5v3a2 2 0 01-2.2 2A17 17 0 014.5 5.2 2 2 0 016.5 3z"/></svg>',
  pin: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.5s7-6.1 7-11.1a7 7 0 10-14 0c0 5 7 11.1 7 11.1z"/><circle cx="12" cy="10.2" r="2.5"/></svg>',
  tool: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 6.5a4 4 0 105.2 5.2L21 21l-3 .5L9.3 12.8A5.2 5.2 0 013 6l3.2 3.2 2.8-.6.6-2.8L6.4 2.6a5.2 5.2 0 018.1 3.9z"/></svg>',
  chat: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5a2.5 2.5 0 01-2.5 2.5H8l-4 3.5V5.5A2.5 2.5 0 016.5 3h11A2.5 2.5 0 0120 5.5z"/></svg>',
  cal: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4M9.5 15l1.8 1.8 3.4-3.6"/></svg>',
  doc: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/></svg>'
};

function openPresent() {
  const b = db.business();
  const disc = b.discount || 0;
  const t = tiers(job, disc);
  const names = { essential: 'Essential', recommended: 'Recommended', complete: 'Complete' };
  const pick = t.shown.includes('recommended') ? 'recommended' : t.shown[t.shown.length - 1];
  const who = b.name || 'Your electrician';

  const findings = [];
  job.pins.forEach((p, i) => p.issues.forEach((k) => findings.push({ no: i + 1, issue: ISSUE_BY_KEY[k], fix: FIXES[ISSUE_BY_KEY[k].fix] })));
  job.boardFixes.forEach((k) => findings.push({ no: null, issue: null, fix: FIXES[k] }));

  const urgent = findings.filter((f) => f.fix.severity === 'danger').length;
  // The headline names the worst thing found, because that is the sentence the
  // customer will repeat to their partner tonight.
  const headline = urgent
    ? ['Your switchboard has ', `${urgent} thing${urgent === 1 ? '' : 's'} to fix now`]
    : findings.length
      ? ['Your switchboard is safe, ', 'but not up to standard']
      : ['We checked your switchboard, ', 'and it is in good shape'];

  // Only the severities actually present get a legend row.
  const present = [...new Set(findings.map((f) => f.fix.severity))];
  const today = new Date();
  const until = new Date(today.getTime() + 30 * 864e5);
  const dfmt = (d) => d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

  $('presentBiz').innerHTML = b.logo
    ? `<img class="rbar__logo" src="${b.logo}" alt="${esc(who)}">`
    : `<span class="rbar__name">${esc(who)}</span>`;

  $('presentBody').innerHTML = `
    <div class="rprintmark">${b.logo
      ? `<img src="${b.logo}" alt="${esc(who)}">`
      : `<strong>${esc(who)}</strong>`}</div>
    <section class="rsec rsec--ink">
      <div class="rwrap">
        <p class="reyebrow reyebrow--light">Switchboard safety report</p>
        <h1 class="rh1">${esc(headline[0])}<span class="rhl">${esc(headline[1])}</span></h1>
        <p class="rlede rlede--light">${esc(who)} checked every device in the board${job.site ? ` at ${esc(job.site)}` : ''} on ${dfmt(today)}. Everything found is below, in plain English, with what it costs to put right.</p>
        <ul class="rtrust">
          ${b.licence ? `<li>${I.shield} Licence ${esc(b.licence)}</li>` : ''}
          ${b.rating ? `<li><span class="rstars">★★★★★</span> ${esc(b.rating)}</li>` : ''}
          ${b.phone ? `<li>${I.phone} ${esc(b.phone)}</li>` : ''}
        </ul>
      </div>
    </section>

    ${job.photo ? `<section class="rsec rsec--cream">
      <div class="rwrap">
        <p class="reyebrow">Your board</p>
        <h2 class="rh2">This is the photo we took today</h2>
        <p class="rlede">Every marker is a device we looked at and found a problem with. Tap one to jump to what it means.</p>
        <div style="margin-top:26px">
          <div class="rboard" id="pBoard"><img src="${job.photo}" alt="Your switchboard">
            ${job.pins.map((p, i) => { const c = pinColor(p); return c
              ? `<button class="ppin" data-find="${i + 1}" aria-label="Finding ${i + 1}" style="left:${p.x}%;top:${p.y}%;background:${c}">${i + 1}</button>` : ''; }).join('')}
          </div>
          <ul class="rlegend">
            ${present.map((s) => `<li><span class="dot" style="background:${SEVERITY[s].color}"></span>${esc(SEVERITY[s].label)}</li>`).join('')}
          </ul>
        </div>
      </div>
    </section>` : ''}

    <section class="rsec rsec--paper">
      <div class="rwrap">
        <p class="reyebrow">What we found</p>
        <h2 class="rh2">${findings.length} thing${findings.length === 1 ? '' : 's'} worth knowing about</h2>
        <ul class="pfindings" id="pFindings">
          ${findings.map((f, idx) => `<li class="pfind" data-card="${f.no || ''}">
            <button class="pfind__head" data-toggle="${idx}" aria-expanded="false" aria-controls="pb${idx}">
              <span class="pfind__no" style="background:${SEVERITY[f.fix.severity].color}">${f.no || '•'}</span>
              <span class="pfind__t">${esc(f.issue ? f.issue.label : f.fix.name)}</span>
              <svg class="pfind__chev" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
            <div class="pfind__body" id="pb${idx}" hidden>
              <p>${esc(f.issue ? f.issue.plain : f.fix.outcome)}</p>
              <div class="fix">${I.tool}<span><b>What we would do:</b> ${esc(f.fix.name.toLowerCase())}. ${esc(f.fix.outcome)}</span></div>
            </div>
          </li>`).join('')}
        </ul>
      </div>
    </section>

    <section class="rsec rsec--ink">
      <div class="rwrap">
        <p class="reyebrow reyebrow--light">Your options</p>
        <h2 class="rh2">Choose <span class="rhl">how far</span> to take it</h2>
        <p class="rlede rlede--light">${t.shown.length > 1 ? 'Each option includes everything in the one before it. There is no wrong answer — safety first is a perfectly good place to stop.' : 'Everything found on your board, done in one visit.'}</p>
        <div class="ptiers">
          ${t.shown.map((k) => { const d = t[k];
            return `<div class="ptier ${k === pick ? 'is-mid' : ''}">
              ${k === pick && t.shown.length > 1 ? '<span class="ptier__flag">Our recommendation</span>' : ''}
              <div class="ptier__n">${names[k]}</div>
              <div class="ptier__p">${d.ex ? money(d.inc) : 'On application'}${d.tbc ? '+' : ''}<span class="ptier__gst">inc GST</span></div>
              <ul class="ptier__l">${d.lines.map((l) => `<li>${I.check}<span>${esc(l.fix.name)}${l.count > 1 ? ` × ${l.count}` : ''}</span></li>`).join('')}</ul>
              ${d.discount ? `<p class="ptier__save">Includes ${disc}% off for doing it all in one visit</p>` : ''}
            </div>`; }).join('')}
        </div>
        <p class="rnote">Prices hold until ${dfmt(until)}. ${t.complete.tbc ? 'Items marked + need a closer look before they can be priced. ' : ''}Nothing is booked until you say so.</p>
      </div>
    </section>

    <section class="rsec rsec--cream">
      <div class="rwrap">
        <p class="reyebrow">What happens next</p>
        <h2 class="rh2">Three steps, and it is done</h2>
        <div class="rsteps">
          <div class="rstep"><span class="rstep__wire"></span>
            <span class="rstep__tile">${I.chat}</span>
            <div><h3>You tell us which option</h3><p>Today, tomorrow, or next month. Take the report away and think about it — the price holds for 30 days.</p></div>
          </div>
          <div class="rstep"><span class="rstep__wire"></span>
            <span class="rstep__tile">${I.cal}</span>
            <div><h3>We book a time that suits</h3><p>Most switchboard work is done in a single visit, with the power off for a couple of hours.</p></div>
          </div>
          <div class="rstep"><span class="rstep__wire"></span>
            <span class="rstep__tile">${I.doc}</span>
            <div><h3>You get a certificate</h3><p>A Certificate of Electrical Safety for the work, plus photos of the finished board.</p></div>
          </div>
        </div>
      </div>
    </section>

    <footer class="rfoot">
      <div class="rwrap">
        <strong>${esc(who)}</strong>
        ${b.licence ? `Licensed electrical contractor, licence ${esc(b.licence)}.` : 'Licensed electrical contractor.'}
        ${b.phone ? ` Questions about anything in this report: ${esc(b.phone)}.` : ''}
        <p class="rfoot__meta">Every classification and price in this report was made on site by ${esc(who)}, who is responsible for the work quoted. Prices include GST.${job.ref ? ` Reference ${esc(job.ref)}.` : ''}</p>
      </div>
    </footer>`;

  $('presentBody').querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.onclick = () => {
      const body = $('pb' + btn.dataset.toggle);
      const open = body.hidden;
      body.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.closest('.pfind').classList.toggle('is-open', open);
    };
  });

  // Tapping a marker opens its finding and lifts the card for a beat, so the
  // customer's eye lands where their finger sent it.
  $('presentBody').querySelectorAll('[data-find]').forEach((p) => {
    p.onclick = () => {
      const card = $('presentBody').querySelector(`.pfind[data-card="${p.dataset.find}"]`);
      if (!card) return;
      if (!card.classList.contains('is-open')) card.querySelector('.pfind__head').click();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('is-lit');
      setTimeout(() => card.classList.remove('is-lit'), 1600);
    };
  });

  $('present').scrollTop = 0;
  $('present').hidden = false;
}
$('presentClose').onclick = () => { $('present').hidden = true; };
$('presentPrint').onclick = () => window.print();

/* ---------- photo ---------- */
$('photoInput').onchange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  job.photo = await downscale(file, 1600);
  save(); renderBoard();
  e.target.value = '';
};

// Phone cameras produce 4000px images; a board only needs enough to see the
// devices, and localStorage is measured in single-digit megabytes.
function downscale(file, max, type = 'image/jpeg') {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL(type, 0.82));
    };
    img.src = URL.createObjectURL(file);
  });
}

/* ---------- lifecycle ---------- */
function save() { db.upsert(job); }
function startJob() { job = db.upsert(newJob()); go('board'); }
$('firstJobBtn').onclick = startJob;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});

go('jobs');
