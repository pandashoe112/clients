// Renders each board to a 1080x1350 PNG.
//
//   node --experimental-default-type=module src/export.mjs
// Playwright and sharp live in revelectrical-site/node_modules, so this
// resolves them from there rather than expecting a second install.
import path from 'node:path';
import fs from 'node:fs';
import { createRequire } from 'node:module';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.resolve(HERE, '../../../revelectrical-site/package.json'));
const { chromium } = require('playwright');
const sharp = require('sharp');

const SRC = path.resolve(HERE, '../ev-charging-social-posts.html');
const OUT = path.resolve(HERE, '../png');
fs.mkdirSync(OUT, { recursive: true });

const NAMES = ['01-offer', '02-service-areas', '03-review', '04-whats-included'];

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1400, height: 1500 }, deviceScaleFactor: 1 });
await p.goto('file://' + SRC, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);

// The page scales the boards down to fit their frame, and the frame clips.
// Open both up so the screenshot is the artwork at true size. Run it twice:
// the page re-fits on fonts.ready, which can land after the first pass.
const unscale = () =>
  p.evaluate(() => {
    document.querySelectorAll('.frame__inner').forEach((el) => (el.style.transform = 'none'));
    document.querySelectorAll('.frame').forEach((el) => {
      Object.assign(el.style, {
        overflow: 'visible', height: 'auto', width: '1080px',
        maxWidth: 'none', boxShadow: 'none', borderRadius: '0'
      });
    });
  });
await unscale();
await p.waitForTimeout(300);
await unscale();

const posts = await p.$$('.post');
for (let i = 0; i < posts.length; i++) {
  // Element screenshots round a fractional page offset up, so a board can come
  // out a pixel tall. Trim back to the exact canvas the platforms expect.
  const shot = await posts[i].screenshot();
  await sharp(shot)
    .extract({ left: 0, top: 0, width: 1080, height: 1350 })
    .png()
    .toFile(path.join(OUT, NAMES[i] + '.png'));
}
await b.close();
console.log(fs.readdirSync(OUT).join(' '));
