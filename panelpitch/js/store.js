/* Everything lives on the device. No account, no network, no sync - the app
   has to work in a basement with no signal, so local storage is not a cache,
   it is the database. In-memory fallback for private browsing. */

const KEY = 'panelpitch.v1';

let mem = null;
function read() {
  if (mem) return mem;
  try {
    mem = JSON.parse(localStorage.getItem(KEY)) || null;
  } catch { mem = null; }
  if (!mem) mem = { business: {}, prices: {}, jobs: [], accepted: false };
  return mem;
}
function write() {
  try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch { /* memory only */ }
}

export const db = {
  all: () => read(),
  save: () => write(),

  business() { return read().business; },
  setBusiness(patch) { Object.assign(read().business, patch); write(); },

  // A price override is only stored when it differs, so the catalogue stays
  // the source of truth and an update to it reaches everyone who has not
  // deliberately changed that line.
  price(key, fallback) {
    const o = read().prices[key];
    return o === undefined ? fallback : o;
  },
  setPrice(key, value, fallback) {
    if (value === fallback) delete read().prices[key];
    else read().prices[key] = value;
    write();
  },

  jobs() { return read().jobs; },
  job(id) { return read().jobs.find((j) => j.id === id) || null; },
  upsert(job) {
    const jobs = read().jobs;
    const i = jobs.findIndex((j) => j.id === job.id);
    job.updated = Date.now();
    if (i === -1) jobs.unshift(job); else jobs[i] = job;
    write();
    return job;
  },
  remove(id) {
    const s = read();
    s.jobs = s.jobs.filter((j) => j.id !== id);
    write();
  },

  accepted() { return read().accepted; },
  accept() { read().accepted = true; write(); }
};

export function newJob() {
  return {
    id: 'j' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    ref: '',
    customer: '',
    site: '',
    photo: null,
    pins: [],        // { id, x, y, issues: [key], note }
    boardFixes: [],  // fix keys
    created: Date.now(),
    updated: Date.now()
  };
}
