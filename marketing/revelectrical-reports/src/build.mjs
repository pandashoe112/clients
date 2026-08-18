// Builds the search performance report into one self-contained HTML file.
// Fonts are inlined so the page renders identically wherever it is opened, and
// the table rows are generated from the figures below rather than hand-typed
// into markup - the bars and the percentages then cannot disagree with them.
//
//   node src/build.mjs
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.resolve(HERE, '../revelectrical-search-report.html');

const b64 = (f) =>
  `data:font/woff2;base64,${fs.readFileSync(path.join(HERE, 'fonts', f)).toString('base64')}`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Section 02 - terms present in both weeks. Bars are scaled against the largest
// non-brand term so a +217% on six impressions cannot look like the headline.
const GREW = [
  ['solar battery installers melbourne', 6, 19],
  ['solar power battery storage melbourne', 5, 13],
  ['solar battery storage melbourne', 6, 13],
  ['ev charger electrician', 10, 16],
  ['electrician airport west', 15, 22],
  ['electricians campbellfield', 6, 8],
  ['induction cooktop installation', 25, 33],
  ['electricians williamstown', 14, 17],
  ['electrical williamstown', 15, 18],
  ['licenced electrician newport', 15, 18],
  ['electrician newport', 87, 104],
  ['revelectrical', 13, 15],
  ['heat pump installation melbourne', 32, 36],
  ['residential electrician newport', 23, 25],
  ['certified electrician newport', 15, 16]
];
const MAX = Math.max(...GREW.map((r) => r[2]));

const rows02 = GREW.map(([term, was, now]) => {
  const pct = Math.round(((now - was) / was) * 100);
  return `<tr>
    <td class="termcell">
      <span class="term">${esc(term)}</span>
      <span class="bar"><i style="width:${((now / MAX) * 100).toFixed(1)}%"></i></span>
    </td>
    <td class="num">${was}</td>
    <td class="num">${now}</td>
    <td class="num"><span class="pill">+${pct}%</span></td>
  </tr>`;
}).join('\n');

// Section 03 - terms that climbed. Lower position is better, so the gain is
// old minus new.
const MOVED = [
  ['electrician essendon area', 48.9, 37.9],
  ['heat pump hot water installers near me', 63.2, 55.9],
  ['residential electrician newport', 22.7, 21.0],
  ['electricians williamstown', 12.6, 11.8],
  ['electrician newport', 34.8, 34.5]
];
const rows03 = MOVED.map(([term, was, now]) => `<tr>
    <td class="termcell"><span class="term">${esc(term)}</span></td>
    <td class="num">${was.toFixed(1)}</td>
    <td class="num">${now.toFixed(1)}</td>
    <td class="num"><span class="pill">&uarr; ${(was - now).toFixed(1)}</span></td>
  </tr>`).join('\n');

// Section 04 - terms with no recorded appearances the week before.
const NEW = [
  ['electrician essendon', 'Essendon service area page', 72],
  ['solar battery installation melbourne', 'Solar battery installation', 55],
  ['electrician williamstown', 'Williamstown service area', 50],
  ['ev charger installation', 'EV charging solutions', 39],
  ['switchboard upgrades melbourne', 'Switchboard upgrade', 31],
  ['switchboard upgrade melbourne', 'Switchboard upgrade', 22],
  ['home ev charger installation', 'EV charging solutions', 14],
  ['ev charger installation richmond', 'EV charging solutions', 12],
  ['switchboard upgrade cost melbourne', 'Switchboard upgrade', 9],
  ['switchboard replacement', 'Switchboard upgrade', 8]
];
const NEWMAX = Math.max(...NEW.map((r) => r[2]));
const rows04 = NEW.map(([term, page, n]) => `<tr>
    <td class="termcell">
      <span class="term">${esc(term)}</span>
      <span class="bar"><i style="width:${((n / NEWMAX) * 100).toFixed(1)}%"></i></span>
    </td>
    <td>${esc(page)}</td>
    <td class="num">${n}</td>
  </tr>`).join('\n');

// Section 05 - the terms that were already ranking, to show they held.
const HELD = [
  ['electrician newport', 34.8, 34.5],
  ['electrician airport west', 15.3, 15.4],
  ['electricians williamstown', 12.6, 11.8],
  ['heat pump installation melbourne', 57.2, 57.1]
];
const rows05 = HELD.map(([term, was, now]) => {
  const d = was - now;
  const label = d > 0 ? `&uarr; ${d.toFixed(1)}` : d < 0 ? `&darr; ${Math.abs(d).toFixed(1)}` : 'no change';
  return `<tr>
    <td class="termcell"><span class="term">${esc(term)}</span></td>
    <td class="num">${was.toFixed(1)}</td>
    <td class="num">${now.toFixed(1)}</td>
    <td class="num"><span class="pill${d > 0 ? '' : ' pill--flat'}">${label}</span></td>
  </tr>`;
}).join('\n');

const MAP = {
  __F_O6__: b64('outfit-latin-600-normal.woff2'),
  __F_O7__: b64('outfit-latin-700-normal.woff2'),
  __F_O8__: b64('outfit-latin-800-normal.woff2'),
  __F_M5__: b64('manrope-latin-500-normal.woff2'),
  __F_M7__: b64('manrope-latin-700-normal.woff2'),
  __F_M8__: b64('manrope-latin-800-normal.woff2'),
  __ROWS_02__: rows02,
  __ROWS_03__: rows03,
  __ROWS_04__: rows04,
  __ROWS_05__: rows05
};

let html = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
for (const [k, v] of Object.entries(MAP)) html = html.split(k).join(v);

const left = html.match(/__[A-Z0-9_]+__/g);
if (left) throw new Error('unsubstituted: ' + [...new Set(left)].join(', '));

fs.writeFileSync(OUT, html);
console.log(OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB');
