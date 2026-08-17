import sharp from 'sharp';
import { readdirSync, writeFileSync } from 'node:fs';

const TOKEN = process.env.SANITY_TOKEN;
const D = '/tmp/claude-0/-home-user-clients/cd84dca0-4247-55f9-af76-f5ba6a1195a0/scratchpad/newpics/';
const URL = 'https://mt5betow.api.sanity.io/v2024-10-01/assets/images/production';

// Phone originals are 12MP. The largest slot on the site renders at 1100px, so
// 2400 on the long edge is generous headroom and keeps the CDN payload sane.
const files = readdirSync(D).filter((f) => f.endsWith('.webp')).sort();
const map = {};

for (const [i, f] of files.entries()) {
  const buf = await sharp(D + f)
    .rotate()
    .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = 'rev-' + f.replace(/^PXL_/, '').replace(/\.MP/, '');
  const res = await fetch(`${URL}?filename=${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/webp' },
    body: buf
  });
  if (!res.ok) { console.error(i, f, res.status, await res.text()); continue; }
  const j = await res.json();
  map[i] = { id: j.document._id, file: f, w: j.document.metadata.dimensions.width, h: j.document.metadata.dimensions.height };
  console.log(String(i).padStart(2), j.document._id);
}
writeFileSync('/tmp/claude-0/-home-user-clients/cd84dca0-4247-55f9-af76-f5ba6a1195a0/scratchpad/assets.json', JSON.stringify(map, null, 2));
console.log('uploaded', Object.keys(map).length, 'of', files.length);
