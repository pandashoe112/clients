// Inlines the fonts, photos and icons into template.html so the deliverable is
// one portable file: no CDN, no relative asset paths, and nothing that can
// silently fail to load when the boards are screenshotted to PNG.
//
//   npm run build
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(HERE, '..');
const OUT = path.join(ROOT, 'ev-charging-social-posts.html');

const b64 = (file, mime) =>
  `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

const font = (fam, w) =>
  b64(path.join(ROOT, 'brand/fonts', `${fam}-latin-${w}-normal.woff2`), 'font/woff2');

const crop = (name) => b64(path.join(HERE, 'crops', `${name}.webp`), 'image/webp');

const TICK =
  '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#032F35" ' +
  'stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

const STAR =
  '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
  '<path d="M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.11 6.47L12 17.43l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95z"/></svg>';

const MAP = {
  __F_OUTFIT600__: font('outfit', 600),
  __F_OUTFIT700__: font('outfit', 700),
  __F_OUTFIT800__: font('outfit', 800),
  __F_MANROPE500__: font('manrope', 500),
  __F_MANROPE700__: font('manrope', 700),
  __F_MANROPE800__: font('manrope', 800),
  __IMG_P1BG__: crop('p1-bg'),
  __IMG_P2__: crop('p2-inset'),
  __IMG_P3__: crop('p3-photo'),
  __IMG_P4__: crop('p4-photo'),
  __IMG_LOGO__: b64(path.join(ROOT, 'brand/logo-light.webp'), 'image/webp'),
  __IMG_LOGO_DARK__: b64(path.join(ROOT, 'brand/logo-ink.webp'), 'image/webp'),
  __SVG_TICK__: TICK,
  __SVG_STARS__: STAR.repeat(5)
};

let html = fs.readFileSync(path.join(HERE, 'template.html'), 'utf8');
for (const [key, val] of Object.entries(MAP)) html = html.split(key).join(val);

const left = html.match(/__[A-Z0-9_]+__/g);
if (left) throw new Error('unsubstituted placeholders: ' + [...new Set(left)].join(', '));

fs.writeFileSync(OUT, html);
console.log(OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB');
