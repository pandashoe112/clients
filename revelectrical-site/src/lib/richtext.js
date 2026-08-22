// Inline links inside CMS plain-text fields.
//
// The brand copy arrives with cross-links written into the middle of sentences
// - "we also install Fox ESS and GoodWe" - and a plain string field cannot
// carry those. Portable Text can, but it turns every paragraph in the Studio
// into a rich-text editor for the sake of two links a page.
//
// So: markdown link syntax in the plain field, split out here. The href is
// matched, not merely tested, so nothing but an in-site path, an https URL, a
// mailto or a tel can become one - a `javascript:` href simply does not match
// and stays as literal text. Astro escapes the text of each segment itself.
const LINK = /\[([^\]\n]+)\]\((\/[^)\s]*|https:\/\/[^)\s]+|mailto:[^)\s]+|tel:[^)\s]+)\)/g;

export function segments(input) {
  const str = typeof input === 'string' ? input : '';
  const out = [];
  let last = 0;
  for (const m of str.matchAll(LINK)) {
    if (m.index > last) out.push({ text: str.slice(last, m.index) });
    out.push({ text: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < str.length) out.push({ text: str.slice(last) });
  return out;
}

// The same string with the links flattened to their label. For meta
// descriptions, structured data and anywhere else the markup cannot go.
export function plain(input) {
  return segments(input).map((s) => s.text).join('');
}
