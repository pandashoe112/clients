import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const read = async (path) => {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto(`http://localhost:4321${path}`, { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(900);
  const d = await p.evaluate(() => {
    const h = document.querySelector('.siteheader');
    const logo = document.querySelector('.siteheader__logo img');
    const inner = document.querySelector('.siteheader__inner');
    const cs = getComputedStyle(h);
    return {
      bg: cs.backgroundColor,
      headerH: Math.round(h.getBoundingClientRect().height),
      innerMinH: getComputedStyle(inner).minHeight,
      logoW: Math.round(logo.getBoundingClientRect().width),
      logoH: Math.round(logo.getBoundingClientRect().height),
      navLeft: Math.round(document.querySelector('.sitenav').getBoundingClientRect().left),
      wrapW: Math.round(inner.getBoundingClientRect().width)
    };
  });
  await p.close();
  return d;
};
const home = await read('/');
const svc = await read('/services/ev-charging');
console.log('homepage:', JSON.stringify(home));
console.log('service :', JSON.stringify(svc));
console.log('IDENTICAL:', JSON.stringify(home) === JSON.stringify(svc));
await b.close();
