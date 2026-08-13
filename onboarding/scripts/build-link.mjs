#!/usr/bin/env node
// Turn a client JSON file into a prefilled onboarding link.
//
//   node scripts/build-link.mjs clients/ch-secure.json
//
// The keys in the JSON are the short query params the form reads. Anything not
// in PARAMS is rejected loudly rather than silently dropped, because a typo'd
// key produces a link that looks fine and prefills nothing.

import { readFileSync } from 'node:fs';

const SITE = process.env.ONBOARDING_SITE_URL || 'https://dunk-client-onboarding.netlify.app';

// Free text fields, straight from the form's MAP.
const PARAMS = new Set([
  'client',
  'name', 'email', 'phone', 'biz', 'web',
  'adphone', 'inbox', 'loc', 'budget', 'start', 'services', 'exclude',
  'jobvalue', 'winrate', 'capacity',
  'products', 'catex', 'aov', 'shipping',
  'diff', 'hesitate', 'terms', 'offers', 'season',
  'volume', 'cpl', 'handling', 'badlead',
  'cid', 'platform', 'notes',
  'type', 'ads',
]);

// Radio groups only accept these, from the form's PICK.
const CHOICES = {
  type: ['leads', 'ecom', 'both'],
  ads: ['have', 'unsure', 'create'],
};

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/build-link.mjs <client.json>');
  process.exit(1);
}

const data = JSON.parse(readFileSync(file, 'utf8'));
const url = new URL(SITE);
const problems = [];

for (const [key, raw] of Object.entries(data)) {
  if (key.startsWith('_')) continue; // notes to ourselves
  if (!PARAMS.has(key)) {
    problems.push(`unknown param "${key}"`);
    continue;
  }
  const value = String(raw).trim();
  if (!value) continue;
  if (CHOICES[key] && !CHOICES[key].includes(value)) {
    problems.push(`"${key}" must be one of ${CHOICES[key].join(', ')}, got "${value}"`);
    continue;
  }
  url.searchParams.set(key, value);
}

if (problems.length) {
  console.error('Refusing to build the link:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (!data.client) {
  console.error('Warning: no "client" key. Drafts will not be scoped per client.');
}

console.log(url.toString());
