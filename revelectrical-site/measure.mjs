import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(2500);
const d = await p.evaluate(() => {
  const r = s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().toJSON() : null; };
  const cs = s => { const e = document.querySelector(s); return e ? (({marginTop,marginBottom,paddingTop,paddingBottom}) => ({marginTop,marginBottom,paddingTop,paddingBottom}))(getComputedStyle(e)) : null; };
  const lastCard = [...document.querySelectorAll('.svcgrid > li')].pop();
  return {
    grid: r('.svcgrid'), gridCS: cs('.svcgrid'),
    lastCard: lastCard && lastCard.getBoundingClientRect().toJSON(),
    note: r('.svcnote'), noteCS: cs('.svcnote'),
    section: r('#services'), sectionCS: cs('#services'),
    panelSection: r('.promptpanel') && document.querySelector('.promptpanel').closest('section').getBoundingClientRect().toJSON(),
    panelSectionCS: (() => { const e=document.querySelector('.promptpanel')?.closest('section'); return e?(({paddingTop,paddingBottom})=>({paddingTop,paddingBottom}))(getComputedStyle(e)):null })()
  };
});
console.log(JSON.stringify(d, null, 1));
await b.close();
