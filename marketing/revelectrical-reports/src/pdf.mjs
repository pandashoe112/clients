// Renders the report to an A4 PDF.
//
//   node src/pdf.mjs
//
// Chromium and Playwright are resolved from revelectrical-site/node_modules
// rather than expecting a second install in this folder.
import path from 'node:path';
import { createRequire } from 'node:module';

const HERE = path.dirname(new URL(import.meta.url).pathname);
const require = createRequire(path.resolve(HERE, '../../../revelectrical-site/package.json'));
const { chromium } = require('playwright');

const SRC = 'file://' + path.resolve(HERE, '../revelectrical-search-report.html');
const OUT = path.resolve(HERE, '../Revelectrical-search-report-19-Aug-2026.pdf');

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
// Light scheme: this goes on paper or into an email, not onto a dark screen.
const p = await b.newPage({ viewport: { width: 1100, height: 1400 }, colorScheme: 'light' });
await p.goto(SRC, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
// The methodology is a disclosure on screen. Nothing can be clicked in a PDF,
// so it has to be opened first or it is simply missing from the document.
await p.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
await p.emulateMedia({ media: 'print' });
await p.waitForTimeout(300);
// One continuous page, not A4 sheets. The page height is measured from the
// document itself after print styles are applied, so the PDF is a single tall
// page with nothing split across a break.
//
// Width is A4's 794px at 96dpi, which keeps the three stat cards on one row
// and the type at a sensible measure; only the height is unusual.
const WIDTH = 794;
await p.setViewportSize({ width: WIDTH, height: 1400 });
await p.waitForTimeout(200);
const height = await p.evaluate(() => Math.ceil(document.documentElement.scrollHeight));

await p.pdf({
  path: OUT,
  width: WIDTH + 'px',
  height: height + 'px',
  printBackground: true,
  pageRanges: '1',
  margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
});
await b.close();
console.log(OUT, WIDTH + 'x' + height + 'px, one page');
