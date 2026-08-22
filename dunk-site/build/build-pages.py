"""Generate dunk-site/seo.html and dunk-site/ppc.html from index.html.

Everything the service pages share with the homepage (tokens, nav, dropdowns,
mobile panel, buttons, the logo marquee, case cards, the reviews component, the
why-us grid, FAQ, lead form, CTA, footer, script) is lifted out of index.html
verbatim so the pages cannot drift from it. The platform-tile CSS and the four
gradient art panels come out of archive/services-suite.html, which is why that
file has to stay valid even though it is off the homepage.

Everything below the extraction is page content: one CFG per page, and one set
of section builders both pages share.

    python3 build/build-pages.py
"""
import io, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC  = os.path.join(ROOT, 'index.html')

s = io.open(SRC, encoding='utf-8').read()
ARCHIVE = io.open(os.path.join(HERE, 'archive', 'services-suite.html'),
                  encoding='utf-8').read()

def css(a, b, src=None):
    src = s if src is None else src
    i = src.index(a); j = src.index(b, i)
    return src[i:j]

def div_block(src, start):
    """Full <div ...>...</div> from `start`, by counting depth. Indentation
    matching is not safe: the tiles nest deeper than the panel and some
    closers land on the panel's own indent."""
    i = start; depth = 0
    while True:
        o = src.find('<div', i)
        c = src.find('</div>', i)
        assert c != -1, 'unclosed div'
        if o != -1 and o < c:
            depth += 1; i = o + 4
        else:
            depth -= 1; i = c + 6
            if depth == 0:
                return src[start:i]

# ---- shared CSS ------------------------------------------------------------
head_links = css('<link rel="preconnect" href="https://fonts.googleapis.com">', '<style>').rstrip()
tokens     = css('<style>\n', '  /* ---------- shell ---------- */')[len('<style>\n'):]
# the carousel photographs are homepage-only and the token block is copied
# whole, so they would ride along as ~270KB these pages never paint
for _t in ('--photo-trade', '--photo-desk', '--photo-focus'):
    tokens = re.sub(r'^ *%s:url\("[^"]*"\);\n' % _t, '', tokens, flags=re.M)
assert '--photo-trade' not in tokens

navcss    = css('  /* ---------- nav ---------- */', '  /* ---------- hero content ---------- */')
marqcss   = css('  /* ---------- logo marquee ---------- */', '  /* ---------- channel picker ---------- */')
faqcss    = css('  /* ---------- faq ---------- */', '  @media (max-width:1280px){')
casecss   = css('  /* ---------- case studies ----------', '  /* ---------- why dunk ---------- */')
whycss    = css('  /* ---------- why dunk ---------- */', '  /* ---------- client reviews ----------')
voicescss = css('  /* ---------- client reviews ----------', '  /* ---------- lead form ---------- */')
leadcss   = css('  /* ---------- lead form ---------- */', '  /* ---------- footer ---------- */')
footcss   = css('  /* ---------- footer ---------- */', '  /* ---------- section placeholders ----------')
ctacss    = css('  /* ---------- footer CTA ---------- */', '</style>')
mobcss    = css('  .mobile{\n    position:fixed', '  @media (prefers-reduced-motion:reduce){')
rmcss     = css('  @media (prefers-reduced-motion:reduce){', '  /* ---------- services overview carousel ----------')
suitecss  = css('  /* ---------- service suite ---------- */', '</style>', ARCHIVE)

# ---- shared markup --------------------------------------------------------
nav     = css('<nav class="nav" aria-label="Main">', '</nav>') + '</nav>'
mobile  = css('<div class="mobile" id="mobile-nav">', '\n<script>').rstrip()
marquee = css('    <div class="marquee">', '    </div>\n  </section>').rstrip() + '\n    </div>'
cta     = css('  <section class="cta" id="contact">', '  <footer class="foot"').rstrip()
footer  = css('  <footer class="foot" id="footer">', '</footer>') + '</footer>'

# only the dropdown and mobile-panel half of the homepage script; the services
# carousel it also drives does not exist on these pages
script = ('<script>\n(function(){'
          + css('<script>\n(function(){', '  // ---- services rail').split('<script>\n(function(){', 1)[1]
          + css('  var burger = document.querySelector(\'.burger\');', '</script>')
          + '</script>')
assert 'svc-rail' not in script and 'setMenu' in script

art_offsets = [m.start() for m in re.finditer(r'<div class="suite__art">', ARCHIVE)]
assert len(art_offsets) == 4, len(art_offsets)
ART = dict(zip(('google', 'meta', 'seo', 'links'),
               [div_block(ARCHIVE, o) for o in art_offsets]))
for a in ART.values():
    assert 'class="ui' in a and a.rstrip().endswith('</div>')

# the winning organic result, and the Google mark its search bar carries
_i = ARCHIVE.index('<div class="serp serp--win">')
SERP_WIN = ARCHIVE[_i:ARCHIVE.index('</div>', ARCHIVE.index('serp__links', _i)) + 6]
GLOGO = re.search(r'<img class="ui__glogo" alt="" src="(data:image/webp;base64,[^"]+)">', ARCHIVE).group(1)
SERP_TILE = div_block(ART['seo'], ART['seo'].index('<div class="ui'))
ADS_TILE  = div_block(ART['google'], ART['google'].index('<div class="ui'))

logos = dict((m.group(1), m.group(2)) for m in
             re.finditer(r'<img alt="([^"]+)" src="(data:image/jpeg;base64,[^"]+)">', s))
LOGO = {'Pestline': logos['Pestline Pest Control'],
        'Solargain': logos['Solargain'],
        'Approved Electrix': logos['Approved Electrix']}

hero_b64 = io.open(os.path.join(HERE, 'hero-seo.b64')).read().strip()
proc_b64 = io.open(os.path.join(HERE, 'process-photo.b64')).read().strip()

def relink(frag):
    for a in ('#who-we-work-with', '#about', '#results', '#services-overview',
              '#get-started', '#why-dunk', '#testimonials', '#strategy-call'):
        frag = frag.replace('href="%s"' % a, 'href="/%s"' % a)
    return frag
nav, mobile, footer = relink(nav), relink(mobile), relink(footer)
nav = nav.replace('<nav class="nav" aria-label="Main">', '<nav class="nav nav--light" aria-label="Main">')
nav = nav.replace('<a class="btn btn--white" href="#contact">', '<a class="btn btn--ink" href="#contact">')

def mark_current(frag, href):
    """Flag the dropdown entry for the page being built."""
    return frag.replace('<a class="drop__link" href="%s">' % href,
                        '<a class="drop__link is-current" href="%s" aria-current="page">' % href, 1)

I = {
 'audit':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="8.5" stroke="currentColor" stroke-width="2.4"/><path d="M20.5 20.5 27 27" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 14.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'code':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M11.5 10 5 16l6.5 6M20.5 10 27 16l-6.5 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7l-4 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 'doc':    '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 5.5h12L25 12v14.5H7z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18.5 5.5V12H25" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 17h10M11 21h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 'pin':    '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 28s9-8.4 9-15a9 9 0 1 0-18 0c0 6.6 9 15 9 15z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="16" cy="13" r="3.4" stroke="currentColor" stroke-width="2.2"/></svg>',
 'link':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M13 19l6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M11.5 15 9 17.5a4.6 4.6 0 0 0 6.5 6.5L18 21.5M20.5 17 23 14.5A4.6 4.6 0 0 0 16.5 8L14 10.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'chart':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 27h22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="8" y="16" width="4.5" height="8" rx="1.2" stroke="currentColor" stroke-width="2.2"/><rect x="15" y="11" width="4.5" height="13" rx="1.2" stroke="currentColor" stroke-width="2.2"/><rect x="22" y="6" width="4.5" height="18" rx="1.2" stroke="currentColor" stroke-width="2.2"/></svg>',
 'cart':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 5h3.2l3.4 14.5h13" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 9.5h18l-2.4 8H10.8" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><circle cx="12" cy="25.5" r="2" fill="currentColor"/><circle cx="22" cy="25.5" r="2" fill="currentColor"/></svg>',
 'grid':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="4.5" y="4.5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.3"/><rect x="17.5" y="4.5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.3"/><rect x="4.5" y="17.5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.3"/><rect x="17.5" y="17.5" width="10" height="10" rx="2" stroke="currentColor" stroke-width="2.3"/></svg>',
 'play':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><rect x="3" y="6.5" width="26" height="19" rx="4.5" stroke="currentColor" stroke-width="2.4"/><path d="M13.5 12l6.5 4-6.5 4z" fill="currentColor"/></svg>',
 'spark':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 3.5l2.4 7.6 7.6 2.4-7.6 2.4L16 23.5l-2.4-7.6L6 13.5l7.6-2.4z" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><path d="M25 22.5l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
 'cycle':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M27 16a11 11 0 0 1-18.8 7.8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M5 16A11 11 0 0 1 23.8 8.2" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 3.5v5h-5M8 28.5v-5h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'arrow':  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M13 6.5 18.5 12 13 17.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'up':     '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V5.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M5 12.2 12 5l7 7.2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'tick':   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'chev':   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6.5 10 12 15.5 17.5 10" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'mag':    '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"/><path d="M15.5 15.5 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
 'person': '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="16" cy="11" r="5.2" stroke="currentColor" stroke-width="2.4"/><path d="M6.5 27c1.4-5.6 4.9-8.6 9.5-8.6s8.1 3 9.5 8.6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
 'split':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 4v24" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 3"/><rect x="4" y="9" width="8.5" height="14" rx="2.2" stroke="currentColor" stroke-width="2.3"/><rect x="19.5" y="12.5" width="8.5" height="10.5" rx="2.2" stroke="currentColor" stroke-width="2.3"/></svg>',
 'flow':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M4 24c4-1 6-4.5 7.5-9S15 6.5 20 6.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="4" cy="24" r="2.6" stroke="currentColor" stroke-width="2.2"/><circle cx="22.5" cy="6.5" r="2.6" stroke="currentColor" stroke-width="2.2"/><path d="M18 21.5l4 4 6-8" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'tag':    '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16.5 4H26a2 2 0 0 1 2 2v9.5L15.4 28.1a2 2 0 0 1-2.8 0L3.9 19.4a2 2 0 0 1 0-2.8z" stroke="currentColor" stroke-width="2.3" stroke-linejoin="round"/><circle cx="22" cy="10" r="2.1" fill="currentColor"/></svg>',
}
UPS = '&#8593;'

PAGE_CSS = io.open(os.path.join(HERE, 'page.css'), encoding='utf-8').read()
PAGE_CSS = PAGE_CSS.replace('HERO_SRC', hero_b64)

# ==========================================================================
#  section builders, shared by both pages
# ==========================================================================
def head(h2, lede, dark=False):
    return ('    <div class="band__head">\n'
            '      <h2>%s</h2>\n'
            '      <p class="band__lede">%s</p>\n'
            '    </div>\n' % (h2, lede))

def band(cls, idn, h2, lede, body):
    return ('  <section class="band band--%s" id="%s">\n%s\n%s  </section>\n'
            % (cls, idn, head(h2, lede), body))

def hero(cfg):
    proof = ''.join('        <span>%s%s</span>\n' % (I['tick'], p) for p in cfg['proof'])
    return ("""  <section class="phero">
    <div class="phero__media" role="img" aria-label="Three people working through a plan together at a table"></div>
    <div class="phero__scrim" aria-hidden="true"></div>
    <div class="phero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/#services-overview">What we do</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">%s</span>
      </nav>
      <h1>%s</h1>
      <p class="phero__lede">%s</p>
      <div class="phero__actions">
        <a class="btn btn--lime" href="#contact">%s<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>
        <a class="phero__call" href="tel:0396994585">or call 03 9699 4585</a>
      </div>
      <p class="phero__proof">
%s      </p>
    </div>
  </section>
""" % (cfg['crumb'], cfg['h1'], cfg['lede'], cfg['cta'], proof))

def trust():
    return ('  <section class="trust">\n'
            '    <p class="trust__label">Brands we have done this for</p>\n'
            '%s\n  </section>\n' % marquee)

def spec(items):
    """Hairline-separated spec sheet, two up. Not six identical icon cards."""
    out = []
    for ico, h, p, chips in items:
        lis = ''.join('<li>%s</li>' % c for c in chips)
        out.append('      <div class="inc__item">\n'
                   '        <span class="inc__ico">%s</span>\n'
                   '        <div>\n'
                   '          <h3>%s</h3>\n'
                   '          <p>%s</p>\n'
                   '          <ul>%s</ul>\n'
                   '        </div>\n'
                   '      </div>' % (I[ico], h, p, lis))
    return '    <div class="inc">\n' + '\n'.join(out) + '\n    </div>\n'

def process(steps, photo_alt, overlay):
    body = '\n'.join(
      '        <div class="step">\n'
      '          <span class="step__pin" aria-hidden="true">%s</span>\n'
      '          <p class="step__n">Step 0%d</p>\n'
      '          <h3>%s</h3>\n'
      '          <p>%s</p>\n'
      '          <span class="step__when">%s</span>\n'
      '        </div>' % (I['chev'], n, h, p, w) for n, (h, p, w) in enumerate(steps, 1))
    return ('    <div class="proc">\n'
            '      <div class="proc__steps">\n%s\n      </div>\n\n'
            '      <div class="proc__shot">\n'
            '        <img alt="%s" src="%s">\n%s'
            '      </div>\n'
            '    </div>\n' % (body, photo_alt, proc_b64, overlay))

def serp_overlay():
    return ('        <div class="proc__serp" aria-hidden="true">\n'
            '          <div class="ui__gbar">\n'
            '            <img class="ui__glogo" alt="" src="%s">\n'
            '            <p class="ui__search">%swindow cleaning melbourne</p>\n'
            '          </div>\n%s\n'
            '          <p class="proc__serpfoot"><b>%s 87</b> ranking keywords<span>412</span></p>\n'
            '        </div>\n' % (GLOGO, I['mag'], SERP_WIN, UPS))

def ads_overlay():
    return ('        <div class="proc__tile" aria-hidden="true">\n%s\n        </div>\n' % ADS_TILE)

def compare(rows, title, lede):
    out = ['    <div class="ct">',
           '      <div class="ct__row ct__head">',
           '        <span>Feature</span><span>DUNK</span><span>Typical agency</span>',
           '      </div>']
    for ico, feat, other in rows:
        out.append('      <div class="ct__row">\n'
                   '        <span class="ct__feat"><i>%s</i>%s</span>\n'
                   '        <span class="ct__yes">%s</span>\n'
                   '        <span class="ct__no">%s</span>\n'
                   '      </div>' % (I[ico], feat, I['tick'], other))
    out.append('    </div>\n')
    return '\n'.join(out)

def pricing(tiers, note):
    out = ['    <div class="tier">']
    for name, price, spend, desc, feat in tiers:
        cls = ' tier__card--pick' if feat else ''
        pick = '        <span class="tier__flag">Most taken</span>\n' if feat else ''
        out.append('      <div class="tier__card%s">\n%s'
                   '        <p class="tier__name">%s</p>\n'
                   '        <p class="tier__price">%s<span>/week</span></p>\n'
                   '        <p class="tier__spend">%s</p>\n'
                   '        <p class="tier__desc">%s</p>\n'
                   '        <a class="btn %s tier__btn" href="#contact">Get started</a>\n'
                   '      </div>' % (cls, pick, name, price, spend, desc,
                                     'btn--lime' if feat else 'btn--ink'))
    out.append('    </div>')
    out.append('    <p class="tier__note">%s</p>\n' % note)
    return '\n'.join(out)

def includes(h2, lede, items):
    out = []
    for ico, h, p in items:
        svg = I[ico].replace('<svg ', '<svg class="why__ico" ', 1)
        out.append('      <div class="why__item">\n        %s\n'
                   '        <h3>%s</h3>\n        <p>%s</p>\n      </div>' % (svg, h, p))
    return ('  <section class="whyus" id="includes">\n'
            '    <div class="whyus__head">\n'
            '      <h2>%s</h2>\n'
            '      <p class="whyus__lede">%s</p>\n'
            '    </div>\n\n'
            '    <div class="why">\n%s\n    </div>\n'
            '  </section>\n' % (h2, lede, '\n'.join(out)))

def cases(items):
    out = []
    for tint, name, trade, metric, label, text, tag, href in items:
        out.append('      <a class="ccard ccard--%s" href="%s">\n'
                   '        <div class="ccard__head">\n'
                   '          <span class="ccard__mark"><img alt="%s" src="%s"></span>\n'
                   '          <span class="ccard__id">\n'
                   '            <span class="ccard__name">%s</span>\n'
                   '            <span class="ccard__trade">%s</span>\n'
                   '          </span>\n'
                   '        </div>\n'
                   '        <div class="ccard__body">\n'
                   '          <p class="ccard__metric">%s%s</p>\n'
                   '          <p class="ccard__label">%s</p>\n'
                   '          <p class="ccard__text">%s</p>\n'
                   '          <div class="ccard__foot">\n'
                   '            <span class="ccard__tag">%s</span>\n'
                   '            <span class="ccard__go">Read it <span aria-hidden="true">%s</span></span>\n'
                   '          </div>\n'
                   '        </div>\n'
                   '      </a>' % (tint, href, name, LOGO[name], name, trade,
                                   I['up'], metric, label, text, tag, I['arrow']))
    return ('  <section class="cases" id="results">\n'
            '    <div class="cases__head">\n'
            '      <h2>How Australian businesses grow with DUNK</h2>\n'
            '      <a class="cases__all" href="/case-studies">All case studies %s</a>\n'
            '    </div>\n'
            '    <div class="cases__grid">\n%s\n    </div>\n'
            '  </section>\n' % (I['arrow'], '\n'.join(out)))

REVIEWS = [
 ('RS', 'a', 'Russell Smith', 'Strategic Regrouting',
  'After trying a few different SEO companies over the past 10 years, finding DUNK has been a complete game changer for my business. Since coming on board, my workload has tripled.'),
 ('MB', 'c', 'Matthew Behman', 'Google review &middot; a year ago',
  'They took the time to understand our goals and delivered a strategy that not only made sense but actually worked. The communication has been seamless and the results measurable.'),
 ('XL', 'b', 'Mic Cohen', 'Google review &middot; a year ago',
  'Their expertise and dedication have taken our work to the next level, and the results have been remarkable. Highly recommend DUNK for anyone looking to boost their online presence.'),
]

def reviews(extra=None):
    rows = (extra or []) + REVIEWS
    body = '\n'.join(
      '        <article class="vcard">\n'
      '          <div class="vcard__who">\n'
      '            <span class="vcard__av vcard__av--%s" aria-hidden="true">%s</span>\n'
      '            <div>\n'
      '              <p class="vcard__name">%s</p>\n'
      '              <p class="vcard__role"><i aria-hidden="true"></i>%s</p>\n'
      '            </div>\n'
      '          </div>\n'
      '          <p class="vcard__quote">&ldquo;%s&rdquo;</p>\n'
      '        </article>' % (tint, ini, name, role, q)
      for ini, tint, name, role, q in rows[:3])
    return ("""  <section class="voices" id="reviews">
    <div class="voices__head">
      <h2>Growth stories from our clients</h2>
      <p class="voices__lede">Real experiences from the Australian businesses we run search and paid
        for, in their own words.</p>
    </div>

    <div class="voices__stats">
      <div class="vstat">
        <p class="vstat__n">4.9 <span class="stars" aria-hidden="true">&#9733;&#9733;&#9733;&#9733;&#9733;</span></p>
        <p class="vstat__l">Average Google rating</p>
      </div>
      <div class="vstat">
        <p class="vstat__n">123</p>
        <p class="vstat__l">Google reviews</p>
      </div>
      <div class="vstat">
        <p class="vstat__n">300+</p>
        <p class="vstat__l">Australian businesses grown</p>
      </div>
    </div>

    <div class="voices__flat">
%s
    </div>
  </section>
""" % body)

def faq(items, side_h2, cta):
    rows = []
    for n, (q, a) in enumerate(items):
        rows.append('        <details class="qa" name="faq"%s>\n'
                    '          <summary>%s<span class="qa__icon" aria-hidden="true"></span></summary>\n'
                    '          <div class="qa__body"><p>%s</p></div>\n'
                    '        </details>' % (' open' if n == 0 else '', q, a))
    return ("""  <section class="faq" id="faq">
    <div class="faq__inner">
      <div class="faq__side">
        <h2>%s</h2>
        <p>If yours is not here, ask it on the call. We would rather answer it before you commit to
          anything than after.</p>
        <a class="btn btn--lime" href="#contact">%s<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>
        <a class="faq__tel" href="tel:0396994585">or call 03 9699 4585</a>
      </div>
      <div class="faq__list">
%s
      </div>
    </div>
  </section>
""" % (side_h2, cta, '\n'.join(rows)))

def others(h2, lede, pair):
    out = []
    for key, tag, title, body, href in pair:
        out.append('      <article class="ocard">\n%s\n'
                   '        <div class="ocard__body">\n'
                   '          <p class="ocard__tag">%s</p>\n'
                   '          <h3>%s</h3>\n'
                   '          <p>%s</p>\n'
                   '          <a class="ocard__go" href="%s">See how we run it <span aria-hidden="true">%s</span></a>\n'
                   '        </div>\n'
                   '      </article>' % (ART[key], tag, title, body, href, I['arrow']))
    return band('paper', 'other-services', h2, lede,
                '    <div class="others__grid">\n' + '\n'.join(out) + '\n    </div>\n')

# ==========================================================================
#  page content
# ==========================================================================
SEO_CASES = [
 ('a', 'Pestline', 'Pest control, Melbourne', '641%', 'more local organic traffic',
  'Learn how our local SEO experts helped Pestline dominate Melbourne&rsquo;s South Eastern suburbs.',
  'Local SEO', '/case-studies/pestline'),
 ('b', 'Solargain', 'Solar and battery installer', '220%', 'growth after a Google penalty',
  'See how we recovered Solargain from a Google penalty, then grew the site by 220% on top of it.',
  'Technical SEO', '/case-studies/solargain'),
 ('c', 'Approved Electrix', 'Electrical contractor', '318%', 'more keywords ranking top three',
  'Approved Electrix challenged us to scale their business fast. Here is how we met that challenge.',
  'SEO', '/case-studies/approved-electrix'),
]

CFG = {}

CFG['seo'] = dict(
  out='seo.html',
  title='SEO Melbourne | Search Engine Optimisation | DUNK',
  desc=('Melbourne SEO that earns rankings you do not pay per click for. Technical SEO, content, '
        'local SEO and link building for Australian businesses. No lock-in contracts.'),
  artifact_title='DUNK SEO Page',
  crumb='SEO',
  h1='SEO that earns the rankings you stop paying for',
  lede=('Rankings compound. We fix what is holding your site back, then build the pages that earn '
        'positions you do not have to buy again every time someone clicks. Melbourne based, working '
        'with businesses across Australia.'),
  cta='Get a free SEO audit',
  self='/services/seo',
  proof=['4.9 from 123 Google reviews', '300+ Australian businesses', 'No lock-in contracts'],
)

CFG['ppc'] = dict(
  out='ppc.html',
  title='Google Ads Melbourne | PPC Management | DUNK',
  desc=('Google Ads management for Melbourne businesses. Search, Shopping, Display, YouTube, '
        'Performance Max and remarketing, run by a Google Premier Partner. No lock-in contracts.'),
  artifact_title='DUNK Google Ads Page',
  crumb='Google Ads',
  h1='Google Ads that buy enquiries, not impressions',
  lede=('People are searching for what you sell right now. We put you in front of them, bid only on '
        'the terms that turn into work, and report on the number your business is actually measured '
        'on. Melbourne based, working with businesses across Australia.'),
  cta='Get a free paid audit',
  self='/services/google-ads',
  proof=['Google Premier Partner', '4.9 from 123 Google reviews', 'No lock-in contracts'],
)

# ---- SEO page content -----------------------------------------------------
SEO_WHAT = [
 ('The AI answer', 'Google now answers a lot of questions itself, citing the pages it trusts. Being one of the cited sources is the new top of the page.'),
 ('The organic results', 'The listings nobody pays for. They cost you nothing per click and they keep working after you stop spending.'),
 ('The map pack', 'For anything local, this is the whole game. Three results, and they get the calls.'),
 ('The things below', 'People also ask, images, related searches. Each one is a place to be, and most sites never turn up in any of them.'),
]

SEO_INC = [
 ('audit', 'Technical SEO',
  'Crawling, indexing, speed, structured data and the platform problems that quietly cap everything else. This is where most sites are losing before they start.',
  ['Site audit', 'Core Web Vitals', 'Indexation', 'Schema']),
 ('doc', 'Content that ranks',
  'The pages you do not have yet. We map what your buyers search, then write and structure the pages that answer it better than whatever is ranking now.',
  ['Keyword mapping', 'Page briefs', 'Copywriting', 'Internal links']),
 ('pin', 'Local SEO',
  'For anyone who sells to a suburb rather than a country. Google Business Profile, service-area pages, citations and the review flow that keeps the map pack yours.',
  ['Business Profile', 'Suburb pages', 'Citations', 'Reviews']),
 ('link', 'Link building',
  'Placements on real Australian sites with real audiences. No networks, no private blog farms, nothing you will be disavowing in a year.',
  ['Digital PR', 'Guest placements', 'Cleanup']),
 ('code', 'Migrations and recoveries',
  'Replatforming, or picking up after a drop. We map redirects before the switch and diagnose losses against the update history rather than guessing.',
  ['Redirect mapping', 'Penalty recovery', 'Update analysis']),
 ('chart', 'Reporting you can read',
  'Rankings matter less than what they earn. You get traffic, enquiries and revenue by page, and a plain-English note on what changed and why.',
  ['Monthly reporting', 'GSC and GA4', 'Call tracking']),
]

SEO_STEPS = [
 ('Audit', 'We go through the site, the analytics and the search results you are already in, then tell you what is capping growth. You get this whether you sign or not.', 'Week 1'),
 ('Plan', 'The order of work, priced, with the reasoning attached. Usually a mix of fixing what exists and building what does not.', 'Week 2'),
 ('Build', 'Technical fixes, then pages, then links. We work in a running order rather than doing a bit of everything and waiting.', 'Month 1 on'),
 ('Compound', 'Monthly reporting on traffic, enquiries and revenue, and a rolling plan for what is next. Rankings you keep without paying per click.', 'Ongoing'),
]

# neutralised from the proposal these came out of, which was written for a
# five-clinic dental group
SEO_COMPARE = [
 ('chart', 'Strategy built around enquiries', 'Rarely'),
 ('audit', 'Senior SEO specialists on the account', 'Sometimes'),
 ('doc',   'Reporting in plain language', 'Limited'),
 ('link',  'Link building done in house', 'Outsourced'),
 ('pin',   'A page set for every location you serve', 'One page for all'),
 ('code',  'Technical fixes implemented, not just listed', 'Report only'),
 ('grid',  'Conversion tracking set up per location', 'Extra cost'),
 ('spark', 'Direct access to your strategist', 'Often filtered'),
]

SEO_INCLUDES = [
 ('person', 'Dedicated strategist', 'Work directly with the specialist running your SEO, not an account manager relaying messages.'),
 ('chart',  'Clear reporting', 'Monthly reports you can read in two minutes, split by location, plus a call to walk through them.'),
 ('flow',   'Conversion tracking', 'Calls and enquiry forms tracked per location, so every number in the report means something.'),
 ('pin',    'Google Business Profiles', 'Every profile managed alongside the site, because that is where local enquiry starts.'),
 ('up',     'Rank tracking by area', 'Keyword positions tracked per location, so you can see which suburbs are moving and which need work.'),
 ('tag',    'No hidden extras', 'Content, technical fixes, schema and links all sit inside the monthly fee. Nothing quoted separately mid programme.'),
]

SEO_FAQ = [
 ('How long before SEO does anything?',
  'Technical fixes can move things in weeks. New pages ranking for anything competitive is three to six months, and the compounding happens after that. '
  'Anyone promising page one in a month is either bidding on your brand name or about to get you penalised.'),
 ('What does SEO cost?',
  'SEO is quoted on the work involved rather than a flat retainer, because a five-page trade site and a thousand-SKU store are not the same job. '
  'The audit tells us the scope, and the quote comes with the reasoning attached.'),
 ('Do I have to sign a twelve-month contract?',
  'No. Month to month, and you can always cancel. SEO does need runway to work, so we will tell you honestly if your budget and timeline do not add up, '
  'but we would rather you stayed because it is working.'),
 ('Who actually does the work?',
  'The person you meet on the call. There is no handover to a junior after you sign, and nothing is offshored to a content mill.'),
 ('Do I own the work if I leave?',
  'Yes. Your site, your analytics, your Google Business Profile, your content, your links. We work in your accounts, not ours, and we hand over everything.'),
 ('Should I be doing SEO or Google Ads?',
  'Usually both, in that order of patience. Ads buy you enquiries this week; SEO builds the traffic you are not paying for next year. '
  'If you can only run one, we will tell you which on the call.'),
]

# ---- PPC page content -----------------------------------------------------
PPC_TYPES = [
 ('mag',   'Google Search Ads',
  'We capture high-intent users searching for your products or services across Melbourne and Victoria.',
  ['Exact and phrase', 'Negatives', 'Ad extensions']),
 ('cart',  'Google Shopping Ads',
  'We connect your product feed to Shopping campaigns that surface your inventory with pricing, imagery and reviews at the top of search results.',
  ['Feed management', 'Merchant Center', 'Bidding']),
 ('grid',  'Google Display Ads',
  'We run visual campaigns across Google&rsquo;s Display Network to keep your brand visible during longer decision cycles.',
  ['Placements', 'Audiences', 'Creative sets']),
 ('play',  'YouTube Ads',
  'We manage video campaigns across skippable, non-skippable, bumper and Shorts formats.',
  ['Skippable', 'Bumper', 'Shorts']),
 ('spark', 'Performance Max',
  'We manage Performance Max campaigns that use Google&rsquo;s AI to serve ads across Search, Display, YouTube, Gmail and Maps from a single campaign.',
  ['Asset groups', 'Signals', 'Brand exclusions']),
 ('cycle', 'Remarketing and retargeting',
  'We re-engage the people who visited your site but did not convert. Dynamic remarketing pulls the specific products they viewed; standard remarketing keeps your brand in front.',
  ['Dynamic', 'Standard', 'Audience lists']),
]

PPC_STEPS = [
 ('Discovery audit', 'We review your existing account, your business model, your margins and your growth targets within the Melbourne market.', 'Week 1'),
 ('Keyword research', 'We map high-intent keywords across Melbourne and Victoria, analyse competitor bidding and define audience segments on local buyer behaviour.', 'Week 1'),
 ('Campaign structure', 'We architect campaigns with clean structures, tight ad groups and copy that speaks to Melbourne-specific buying intent.', 'Week 2'),
 ('Optimisation', 'We launch with proper conversion tracking in place and monitor daily. Bid adjustments, negative keywords, audience refinements and creative rotations happen continuously.', 'Ongoing'),
 ('Reporting', 'Clear monthly reports connecting ad performance to the metrics your business is measured on. Revenue, pipeline, CPA, ROAS.', 'Monthly'),
]

PPC_COMPARE = [
 ('chart', 'Strategy built around revenue', 'Rarely'),
 ('audit', 'Senior marketers on the account', 'Sometimes'),
 ('doc',   'Transparent reporting', 'Limited'),
 ('spark', 'Direct access to your strategist', 'Often filtered'),
 ('grid',  'Conversion tracking setup included', 'Extra cost'),
 ('code',  'Landing page recommendations', 'Rarely'),
 ('cycle', 'AI and AI search expertise', 'Limited'),
 ('link',  'Plain language reporting', 'Sometimes'),
]

PPC_TIERS = [
 ('Layup', '$139', 'Ad spend to $1,500 a month',
  '$30 to $40 a day sits inside this, with room to lift spend later without the fee changing.', False),
 ('Alley-oop', '$185', 'Ad spend to $3,000 a month',
  'The step up once the first months justify putting more behind it.', True),
 ('Slam DUNK', '$275', 'Ad spend to $5,000 a month',
  'The tier for scaling, once your cost per enquiry is proven.', False),
]

PPC_INCLUDES = [
 ('doc',    'No contracts', 'Flexible month-to-month agreements. Cancel any time with 60 days notice.'),
 ('person', 'Dedicated strategist', 'Work directly with a PPC expert who understands your business and your goals.'),
 ('chart',  'Clear reporting', 'Know where you stand, with monthly reports you can actually read.'),
 ('split',  'Brand vs non-brand', 'Strategic campaign separation, for better budget control and ROAS.'),
 ('spark',  'CRO recommendations', 'Data-driven landing page and funnel optimisation suggestions.'),
 ('flow',   'User journey heatmaps', 'See how people interact with your site, and convert more of them.'),
]

PPC_FAQ = [
 ('How much should I spend on Google Ads?',
  'Enough to buy a readable number of clicks in your market. For most Melbourne trade and service businesses that is $1,000 to $2,000 a month to start, '
  'and we would rather tell you the floor honestly than take a budget that cannot work.'),
 ('Is the ad spend on top of your fee?',
  'Yes. Management is a weekly fee billed monthly; ad spend goes straight to Google on your own card and never through us. '
  'You keep the account and the billing.'),
 ('How fast do Google Ads work?',
  'Clicks start the day you launch. Useful data takes two to four weeks, and the account is usually at its stride by month two or three once there is enough '
  'conversion data to bid on.'),
 ('Do I have to sign a contract?',
  'Month to month, cancel any time with 60 days notice. The notice period exists so an account is not abandoned mid-optimisation, not to trap anyone.'),
 ('Who owns the account?',
  'You do. We work inside your Google Ads account, not a reseller wrapper, so if we ever part ways you keep the campaigns, the history and the learning.'),
 ('Should I run Google Ads or SEO?',
  'Ads buy you enquiries this week. SEO builds the traffic you are not paying for next year. Most of our clients run one of each, and if you can only afford '
  'one we will tell you which on the call.')
]

PPC_CASES = SEO_CASES  # see the README: DUNK's paid case studies are not written up yet

# ==========================================================================
#  assembly
# ==========================================================================
def build(key):
    c = CFG[key]
    page_nav = mark_current(nav, c['self'])
    if key == 'seo':
        what = '\n'.join(
          '          <li>\n            <span class="what__n">0%d</span>\n'
          '            <div>\n              <h3>%s</h3>\n              <p>%s</p>\n            </div>\n'
          '          </li>' % (n, h, p) for n, (h, p) in enumerate(SEO_WHAT, 1))
        body = (
          hero(c) + '\n' + trust() + '\n'
          + band('paper', 'what-seo-does', 'What you are actually competing for',
                 'A search result is not a list of ten links any more. It is an answer, a map, a set of '
                 'questions and then the links, and SEO is the work of turning up in as many of those '
                 'places as your competitors do not.',
                 '    <div class="what">\n      <div class="what__art">\n%s\n      </div>\n'
                 '      <ul class="what__list">\n%s\n      </ul>\n    </div>\n' % (SERP_TILE, what))
          + '\n'
          + band('paper', 'included', 'What SEO with us includes',
                 'Not every engagement uses all six. The audit decides the order, and we would rather do '
                 'three of these properly than bill for all of them.', spec(SEO_INC))
          + '\n'
          + band('dark', 'process', 'How the work runs',
                 'Four stages, in this order, because doing them in any other order wastes your money. '
                 'You see the audit before you commit to anything.',
                 process(SEO_STEPS, "Two DUNK strategists working through a client's search plan",
                         serp_overlay()))
          + '\n'
          + band('dark', 'compare', 'Why our SEO wins',
                 'Here is exactly where we stack up against the agency you are probably comparing us to.',
                 compare(SEO_COMPARE, None, None))
          + '\n'
          + includes('Every package includes',
                     'The same six things, whatever the scope of the work is.', SEO_INCLUDES)
          + '\n' + cases(SEO_CASES) + '\n' + reviews() + '\n'
          + faq(SEO_FAQ, 'Questions people ask before starting SEO', 'Get a free SEO audit')
          + '\n'
          + others('What else we run alongside SEO',
                   'SEO builds the traffic you are not paying for. These two buy you enquiries while it '
                   'does. Most of our clients run one of them with it.',
                   [('google', 'Capture the demand that exists today', 'Google Advertising',
                     'People are already searching for what you sell. Search, Shopping and Performance Max put you in front of them at the moment they are looking.',
                     '/services/google-ads'),
                    ('meta', 'Create demand before anyone searches', 'Meta Advertising',
                     'Not everyone is ready to search yet. Facebook and Instagram put your best creative in front of the people who will be.',
                     '/services/meta-ads')]))
    else:
        body = (
          hero(c) + '\n' + trust() + '\n'
          + band('paper', 'ad-types', 'Google Ads services for Melbourne businesses',
                 'Six campaign types, and the account usually needs two or three of them rather than all '
                 'six. Which ones depends on what you sell and how people buy it.', spec(PPC_TYPES))
          + '\n'
          + band('dark', 'premier', 'An accredited Google Premier Partner in Melbourne',
                 'Premier Partner status puts us in the top 3% of Google Ads agencies in Australia.',
                 '    <div class="prem">\n'
                 '      <div class="prem__body">\n'
                 '        <p>For Melbourne clients that means access to beta features before they reach the '
                 'broader market, a dedicated Google support channel, and performance benchmarks against '
                 'other Melbourne advertisers.</p>\n'
                 '        <p>We earned the status through consistent campaign performance. We keep it by '
                 'delivering results that meet Google&rsquo;s standards year after year.</p>\n'
                 '        <a class="btn btn--lime" href="#contact">Get a free paid audit'
                 '<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>\n'
                 '      </div>\n'
                 '      <div class="prem__badge">\n'
                 '        <img alt="Google" src="%s">\n'
                 '        <p class="prem__pc">Top 3%%</p>\n'
                 '        <p class="prem__lab">of Google Ads agencies in Australia hold Premier Partner status</p>\n'
                 '      </div>\n    </div>\n' % GLOGO)
          + '\n'
          + band('dark', 'process', 'How we manage Google Ads campaigns',
                 'Five stages. You see the discovery audit before you commit to anything.',
                 process(PPC_STEPS, 'Two DUNK strategists working through a client account',
                         ads_overlay()))
          + '\n'
          + band('dark', 'compare', 'Why our ads win',
                 'Here is exactly where we stack up against the agency you are probably comparing us to.',
                 compare(PPC_COMPARE, None, None))
          + '\n'
          + band('paper', 'pricing', 'Management pricing by monthly ad spend',
                 'Management is the same at every level. The difference is how much ad spend we are '
                 'running on your behalf, so you only step up when the results justify it.',
                 pricing(PPC_TIERS,
                         'Ad spend is separate and goes straight to Google on your own card, never '
                         'through us. Billed monthly, cancel any time with 60 days notice.'))
          + '\n'
          + includes('Every package includes',
                     'The same six things, whatever you are spending.', PPC_INCLUDES)
          + '\n' + cases(PPC_CASES) + '\n' + reviews() + '\n'
          + faq(PPC_FAQ, 'Questions people ask before starting Google Ads', 'Get a free paid audit')
          + '\n'
          + others('What else we run alongside Google Ads',
                   'Ads buy you enquiries this week. These two build the demand you capture next year, '
                   'and the audience that has already heard of you.',
                   [('seo', 'Build the demand you capture next year', 'Search Engine Optimisation',
                     'Rankings compound. We fix what is holding your site back, then build the pages that earn positions you do not pay per click for.',
                     '/services/seo'),
                    ('meta', 'Create demand before anyone searches', 'Meta Advertising',
                     'Not everyone is ready to search yet. Facebook and Instagram put your best creative in front of the people who will be.',
                     '/services/meta-ads')]))

    doc = ('<!DOCTYPE html>\n<html lang="en-AU">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
           '<title>%s</title>\n<meta name="description" content="%s">\n' % (c['title'], c['desc'])
           + head_links + '\n<style>\n'
           + tokens
           + '  /* ---------- shell ---------- */\n  .shell{padding:var(--shell);}\n\n'
           + navcss + marqcss + faqcss + suitecss + casecss + whycss + voicescss
           + leadcss + footcss + ctacss + mobcss + rmcss + PAGE_CSS
           + '</style>\n</head>\n<body>\n\n<div class="shell">\n\n'
           '  <header class="topbar">\n' + page_nav + '\n  </header>\n\n'
           + body + '\n' + cta + '\n\n' + footer + '\n\n</div>\n\n'
           + mobile + '\n\n' + script + '\n\n</body>\n</html>\n')

    for bad in ('HERO_SRC', '{', '}'):
        if bad in ('{', '}'):
            continue
        assert bad not in doc, bad
    assert '—' not in doc, 'em dash in ' + key
    assert doc.count('<nav class="nav nav--light"') == 1
    assert doc.count('id="mobile-nav"') == 1
    out = os.path.join(ROOT, c['out'])
    io.open(out, 'w', encoding='utf-8').write(doc)
    print('wrote', c['out'], round(len(doc) / 1024), 'KB')

build('seo')
build('ppc')
