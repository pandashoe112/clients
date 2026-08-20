// Cuts the four photo crops the boards need.
//
// Each crop is taken at the ratio the board actually renders it at. A squarer
// source gets cover-cropped a second time in the browser, which is how you end
// up with someone's head sliced off.
//
//   npm run crops
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const PHOTOS = path.resolve(HERE, '../photos');
const OUT = path.join(HERE, 'crops');
fs.mkdirSync(OUT, { recursive: true });

const src = (f) => path.join(PHOTOS, f);
const dst = (f) => path.join(OUT, f + '.webp');

// 1. Full-bleed hero. Framed so the charger sits in the top third, clear of
//    the headline block, with the cable coil left to fall behind the scrim.
await sharp(src('ev-brick-vine.webp'))
  .extract({ left: 52, top: 227, width: 1096, height: 1370 })
  .resize(1080, 1350).webp({ quality: 78 }).toFile(dst('p1-bg'));

// 2. Service-areas strip. Renders 936x330, so it is cut at 2.84:1 and offset
//    down the frame to keep the driver's head in shot.
await sharp(src('evnex_09.webp'))
  .extract({ left: 0, top: 180, width: 1600, height: 564 })
  .resize(1872, 660).webp({ quality: 80 }).toFile(dst('p2-inset'));

// 3. Review photo. Cropped above the number plate - a customer's rego does not
//    belong on a social post.
await sharp(src('ev-garage-car.webp'))
  .extract({ left: 6, top: 0, width: 1587, height: 970 })
  .resize(1080, 660).webp({ quality: 80 }).toFile(dst('p3-photo'));

// 4. Tall column showing the charger beside the board it is wired back to,
//    which is the point the copy next to it is making.
await sharp(src('ev-and-board.webp'))
  .extract({ left: 245, top: 0, width: 557, height: 1600 })
  .resize(470, 1350).webp({ quality: 80 }).toFile(dst('p4-photo'));

console.log(fs.readdirSync(OUT).join(' '));
