import { sanity } from './sanity.js';

// One question, asked once per build: has anyone verified the rebate amounts?
//
// Until they have, /rebates/ is noindex, absent from the sitemap, and must not
// be linked from the footer either - the site is live, and a visitor who
// clicks through would land on a page telling them it is not finished.
//
// This is a module-level await on purpose. Module state is shared across every
// page render in a build, so the query runs once rather than 21 times, and the
// footer stays consistent across the whole site.
let live = false;
try {
  live = Boolean(await sanity.fetch('*[_type == "rebatePage"][0].lastVerified'));
} catch {
  // Offline builds read a snapshot that predates this document. Treat an
  // unanswerable question as "not ready" rather than shipping a broken link.
  live = false;
}

export const rebatesLive = live;
