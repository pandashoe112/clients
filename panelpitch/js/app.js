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
    <div class="row2">
      <div class="field"><label>Licence</label><input class="input" id="sLic" value="${esc(b.licence || '')}" placeholder="REC 00000"></div>
      <div class="field"><label>Phone</label><input class="input" id="sPhone" value="${esc(b.phone || '')}" placeholder="Optional"></div>
    </div>
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
    $('sSave').onclick = () => {
      db.setBusiness({
        name: $('sName').value.trim(), licence: $('sLic').value.trim(),
        phone: $('sPhone').value.trim(), discount: Number($('sDisc').value) || 0
      });
      $('sheetBody').querySelectorAll('[data-price]').forEach((inp) => {
        db.setPrice(inp.dataset.price, Number(inp.value) || 0, FIXES[inp.dataset.price].price);
      });
      closeSheet();
    };
  });
}

/* ---------- present ---------- */
function openPresent() {
  const b = db.business();
  const disc = b.discount || 0;
  const t = tiers(job, disc);
  const names = { essential: 'Essential', recommended: 'Recommended', complete: 'Complete' };
  const pick = t.shown.includes('recommended') ? 'recommended' : t.shown[t.shown.length - 1];

  const findings = [];
  job.pins.forEach((p, i) => p.issues.forEach((k) => findings.push({ no: i + 1, issue: ISSUE_BY_KEY[k], fix: FIXES[ISSUE_BY_KEY[k].fix] })));
  job.boardFixes.forEach((k) => findings.push({ no: null, issue: null, fix: FIXES[k] }));

  $('presentBiz').textContent = b.name || 'Your switchboard';
  $('presentBody').innerHTML = `
    <h3>Your switchboard, and what we found</h3>
    <p class="lede">${esc(b.name || 'Your electrician')} looked at every device in the board${job.site ? ` at ${esc(job.site)}` : ''}. Tap any marker to see what it means.</p>
    ${job.photo ? `<div class="pboard" id="pBoard"><img src="${job.photo}" alt="Your switchboard">
      ${job.pins.map((p, i) => { const c = pinColor(p); return c
        ? `<button class="ppin" data-find="${i + 1}" style="left:${p.x}%;top:${p.y}%;background:${c}">${i + 1}</button>` : ''; }).join('')}
    </div>` : ''}
    <ul class="pfindings" id="pFindings">
      ${findings.map((f, idx) => `<li class="pfind" data-card="${f.no || ''}">
        <button class="pfind__head" data-toggle="${idx}">
          <span class="pfind__no" style="background:${SEVERITY[f.fix.severity].color}">${f.no || '•'}</span>
          <span class="pfind__t">${esc(f.issue ? f.issue.label : f.fix.name)}</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4C6B6E" stroke-width="2.4" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
        </button>
        <div class="pfind__body" id="pb${idx}" hidden>
          <p>${esc(f.issue ? f.issue.plain : f.fix.outcome)}</p>
          <div class="fix"><strong>The fix:</strong> ${esc(f.fix.name)}. ${esc(f.fix.outcome)}</div>
        </div>
      </li>`).join('')}
    </ul>
    <div class="ptiers">
      ${t.shown.map((k) => { const d = t[k];
        return `<div class="ptier ${k === pick ? 'is-mid' : ''}">
          <div class="ptier__n">${names[k]}</div>
          <div class="ptier__p">${d.ex ? money(d.inc) : 'On application'}${d.tbc ? ' +' : ''}</div>
          <ul class="ptier__l">${d.lines.map((l) => `<li>✓ ${esc(l.fix.name)}${l.count > 1 ? ` × ${l.count}` : ''}</li>`).join('')}</ul>
          ${d.discount ? `<p style="margin:12px 0 0;font-size:.8125rem;color:#3E7A0E;font-weight:700">Includes ${disc}% off for doing it all at once</p>` : ''}
        </div>`; }).join('')}
    </div>
    <p class="pfoot">Prices include GST and hold for 30 days. Every classification here was made on site by ${esc(b.name || 'your electrician')}${b.licence ? `, licence ${esc(b.licence)}` : ''}, who is responsible for the work quoted.${b.phone ? ` Questions: ${esc(b.phone)}.` : ''}</p>`;

  $('presentBody').querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.onclick = () => {
      const body = $('pb' + btn.dataset.toggle);
      body.hidden = !body.hidden;
      btn.querySelector('svg').style.transform = body.hidden ? '' : 'rotate(180deg)';
    };
  });
  $('presentBody').querySelectorAll('[data-find]').forEach((p) => {
    p.onclick = () => {
      const card = $('presentBody').querySelector(`.pfind[data-card="${p.dataset.find}"]`);
      if (!card) return;
      card.querySelector('.pfind__head').click();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
  });

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
function downscale(file, max) {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      res(c.toDataURL('image/jpeg', 0.82));
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
