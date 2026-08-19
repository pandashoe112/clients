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
// Zero margins: the masthead and footer are full-bleed bands, and the print
// stylesheet puts the 14mm gutter on the content instead.
await p.pdf({
  path: OUT,
  format: 'A4',
  printBackground: true,
  margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' }
});
await b.close();
console.log(OUT);
