// Which campaign an enquiry came from.
//
// The problem this solves: a visitor lands on an ad, reads three pages, then
// fills in the form on the fourth. By then the URL has no campaign parameters
// and document.referrer is our own site, so the form has no idea where the
// lead came from. This captures the answer on the landing page and carries it
// to whichever form the visitor eventually uses.
//
// Stored in sessionStorage, not localStorage, deliberately. A session is about
// the right window for one enquiry. localStorage would still be crediting an
// ad from March for a phone call in August, which is worse than not knowing.

var KEY = 'rev_attr';

// Campaign parameters, in the order they appear in a submission.
var UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

// Ad platforms stamp their own click id on the landing URL. Its presence is
// harder evidence of a paid click than utm_medium, which anyone can mistype.
var CLICK_IDS = [
  ['gclid', 'Google Ads'],
  ['gbraid', 'Google Ads'],
  ['wbraid', 'Google Ads'],
  ['msclkid', 'Microsoft Ads'],
  ['fbclid', 'Meta Ads'],
  ['ttclid', 'TikTok Ads'],
  ['li_fat_id', 'LinkedIn Ads']
];

var SEARCH = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|brave|startpage)\./;
var SOCIAL = /(^|\.)(facebook|instagram|threads|linkedin|twitter|x|t|tiktok|reddit|pinterest|youtube)\.(com|co|me)$/;
var PAID = /^(cpc|ppc|paid|paidsearch|paid_search|paid-search|cpm|display|retargeting)$/;

// A timestamp someone can read at a glance, in Melbourne time, rather than a
// UTC ISO string that has to be decoded mentally.
var stamp = function () {
  try {
    return new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Melbourne', dateStyle: 'medium', timeStyle: 'short'
    });
  } catch (e) {
    return new Date().toISOString();
  }
};

var host = function (url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
};

var titled = function (name) { return name.charAt(0).toUpperCase() + name.slice(1); };

// Reads the campaign off the current URL and referrer. Returns null when this
// page view carries no campaign evidence at all, which is how an internal
// click is told apart from a fresh arrival.
var read = function () {
  var params = new URLSearchParams(window.location.search);
  var data = { landing_page: window.location.href.split('#')[0], first_seen: stamp() };

  UTMS.forEach(function (k) {
    var v = params.get(k);
    if (v) data[k] = v.trim().slice(0, 120);
  });

  var clicked = null;
  CLICK_IDS.forEach(function (pair) {
    if (clicked) return;
    var v = params.get(pair[0]);
    if (v) { clicked = pair; data.ad_click_id = pair[0] + '=' + v.slice(0, 120); }
  });

  var ref = document.referrer || '';
  var refHost = host(ref);
  var external = refHost && refHost !== window.location.hostname.replace(/^www\./, '');
  if (external) data.came_from = ref.split('?')[0].slice(0, 200);

  var source = (data.utm_source || '').toLowerCase();
  var medium = (data.utm_medium || '').toLowerCase();

  // Most specific evidence first. A click id beats a utm_medium, and a
  // utm_medium beats a guess from the referrer.
  if (clicked) {
    data.channel = clicked[1];
  } else if (medium === 'email' || /mail|klaviyo|mailchimp/.test(source)) {
    data.channel = 'Email';
  } else if (source && PAID.test(medium)) {
    data.channel = source === 'google' ? 'Google Ads'
      : source === 'bing' ? 'Microsoft Ads'
      : /facebook|instagram|meta/.test(source) ? 'Meta Ads'
      : titled(source) + ' ads';
  } else if (medium === 'organic' || medium === 'seo') {
    // Analytics tooling and some link builders tag organic traffic explicitly.
    // Without this it lands in the campaign bucket and an SEO lead gets
    // reported as a campaign, which is the opposite of the point.
    data.channel = 'Organic SEO' + (source ? ' - ' + titled(source) : '');
  } else if (source) {
    // A campaign we tagged ourselves but did not label as paid - a QR code on a
    // van, a link in a quote, a partner listing.
    data.channel = 'Campaign - ' + source + (medium ? ' / ' + medium : '');
  } else if (external && SEARCH.test(refHost)) {
    // Spelled out as SEO rather than "organic search": the person reading the
    // notification wants to know instantly that this lead came free off the
    // rankings and not out of an ad budget.
    data.channel = 'Organic SEO - ' + titled(refHost.split('.')[0]);
  } else if (external && SOCIAL.test(refHost)) {
    data.channel = 'Organic Social - ' + titled(refHost.split('.')[0]);
  } else if (external) {
    data.channel = 'Referral - ' + refHost;
  } else {
    return null;
  }

  return data;
};

// Last non-direct click. A fresh campaign overwrites what is stored, because
// the ad someone clicked today is what earned the enquiry - but an internal
// page view, which carries no evidence, leaves the stored answer alone rather
// than overwriting it with "Direct".
var stored = null;
try {
  var found = read();
  if (found) {
    sessionStorage.setItem(KEY, JSON.stringify(found));
    stored = found;
  } else {
    stored = JSON.parse(sessionStorage.getItem(KEY) || 'null');
  }
} catch (e) {
  // Private browsing can throw on sessionStorage. Attribution is worth less
  // than the form working, so it fails quiet.
  stored = null;
}

// Someone who typed the address in, or arrived from a bookmark. Worth
// recording as an answer rather than leaving the field blank, which reads as
// "the tracking is broken".
if (!stored) {
  stored = {
    channel: 'Direct',
    landing_page: window.location.href.split('#')[0],
    first_seen: stamp()
  };
}

// The hidden field is called lead_source; the working key is channel. Map it
// once here rather than naming the concept twice through the file.
stored.lead_source = stored.channel;

// The short label the subject line uses: "Organic SEO - Google" reads well in
// the body of an email but "New Organic SEO - Google Lead on Revelectrical"
// does not, so the qualifier after the dash is dropped.
export var leadType = (stored.channel || 'Direct').split(' - ')[0];

export var attribution = stored;

// Stamps the hidden fields rendered by Attribution.astro. Called once per page
// rather than on submit, so the values are visible in devtools if a lead's tag
// ever needs checking against what the client swears they clicked.
export function fillAttribution(root) {
  (root || document).querySelectorAll('[data-attr]').forEach(function (el) {
    el.value = stored[el.getAttribute('data-attr')] || '';
  });
}
