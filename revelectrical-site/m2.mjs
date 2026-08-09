import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(1500);
const d = await p.evaluate(() => {
  const note = document.querySelector('.svcnote').getBoundingClientRect();
  const svc  = document.querySelector('#services').getBoundingClientRect();
  const card = document.querySelector('.promptpanel').getBoundingClientRect();
  const sect = document.querySelector('.promptpanel').closest('section').getBoundingClientRect();
  return {
    'note bottom -> dark ends': Math.round(svc.bottom - note.bottom),
    'WHITE space above card':   Math.round(card.top - svc.bottom),
    'WHITE space below card':   Math.round(sect.bottom - card.bottom)
  };
});
console.log(JSON.stringify(d, null, 1));
await b.close();
