"""Generate dunk-site/seo.html from index.html.

Everything shared (tokens, nav, dropdowns, mobile panel, buttons, the service
suite's art panels and mock platform tiles, case cards, reviews, FAQ, CTA,
lead form, footer, script) is lifted out of index.html verbatim so the two
pages cannot drift. Only page-specific CSS and markup is authored here.
"""
import io, re

import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC  = os.path.join(ROOT, 'index.html')
OUT  = os.path.join(ROOT, 'seo.html')

s = io.open(SRC, encoding='utf-8').read()

# The four service rows were archived off the homepage, but this page still
# needs their platform-tile CSS and two of their art panels. Both come out of
# the archive partial now; index.html no longer carries them.
ARCHIVE = io.open(os.path.join(HERE, 'archive', 'services-suite.html'),
                  encoding='utf-8').read()

def css(a, b):
    i = s.index(a); j = s.index(b, i)
    return s[i:j]

def one(pat, flags=re.S):
    m = re.search(pat, s, flags)
    assert m, pat[:60]
    return m.group(0)

head_links = css('<link rel="preconnect" href="https://fonts.googleapis.com">', '<style>').rstrip()
tokens     = css('<style>\n', '  /* ---------- shell ---------- */')[len('<style>\n'):]
# the carousel photographs are homepage-only, and the token block is copied
# whole, so they would ride along as ~270KB this page never paints
for _t in ('--photo-trade', '--photo-desk', '--photo-focus'):
    tokens = re.sub(r'^ *%s:url\("[^"]*"\);\n' % _t, '', tokens, flags=re.M)
assert '--photo-trade' not in tokens
navcss     = css('  /* ---------- nav ---------- */', '  /* ---------- hero content ---------- */')
marqcss    = css('  /* ---------- logo marquee ---------- */', '  /* ---------- channel picker ---------- */')
faqcss     = css('  /* ---------- faq ---------- */', '  @media (max-width:1280px){')
suitecss   = ARCHIVE[ARCHIVE.index('  /* ---------- service suite ---------- */'):ARCHIVE.index('</style>')]
casecss    = css('  /* ---------- case studies ----------', '  /* ---------- why dunk ---------- */')
voicescss  = css('  /* ---------- client reviews ----------', '  /* ---------- lead form ---------- */')
leadcss    = css('  /* ---------- lead form ---------- */', '  /* ---------- footer ---------- */')
footcss    = css('  /* ---------- footer ---------- */', '  /* ---------- section placeholders ----------')
ctacss     = css('  /* ---------- footer CTA ---------- */', '</style>')
mobcss     = css('  .mobile{\n    position:fixed', '  @media (prefers-reduced-motion:reduce){')
rmcss      = css('  @media (prefers-reduced-motion:reduce){', '  /* ---------- split hero ---------- */')

# ---- shared markup ---------------------------------------------------------
nav      = css('<nav class="nav" aria-label="Main">', '</nav>') + '</nav>'
mobile   = css('<div class="mobile" id="mobile-nav">', '\n<script>').rstrip()
script   = '<script>\n(function(){' + css('<script>\n(function(){', '</script>').split('<script>\n(function(){', 1)[1] + '</script>'
marquee  = css('    <div class="marquee">', '    </div>\n  </section>').rstrip() + '\n    </div>'
cta      = css('  <section class="cta" id="contact">', '  <footer class="foot"').rstrip()
footer   = css('  <footer class="foot" id="footer">', '</footer>') + '</footer>'

def div_block(src, start):
    """Return the full <div ...>...</div> beginning at `start` by counting depth.
    Indentation matching is not safe here: the tiles nest deeper than the panel
    and some closers land on the panel's own indent."""
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

art_offsets = [m.start() for m in re.finditer(r'<div class="suite__art">', ARCHIVE)]
assert len(art_offsets) == 4, len(art_offsets)
arts = [div_block(ARCHIVE, o) for o in art_offsets]
art_google, art_meta, art_seo = arts[0], arts[1], arts[2]
for a in (art_google, art_meta, art_seo):
    assert 'class="ui' in a and a.rstrip().endswith('</div>'), a[:120]

# case-study logos, reused for the SEO results row
logos = dict((m.group(2), m.group(1)) for m in
             re.finditer(r'src="(data:image/jpeg;base64,[^"]+)"><\/span>\s*\n\s*<span class="ccard__id">\s*\n\s*<span class="ccard__name">([^<]+)<', s))
if not logos:
    logos = dict((m.group(1), m.group(2)) for m in
                 re.finditer(r'<img alt="([^"]+)" src="(data:image/jpeg;base64,[^"]+)">', s))
    logos = {'Pestline': logos['Pestline Pest Control'],
             'Solargain': logos['Solargain'],
             'Approved Electrix': logos['Approved Electrix']}

hero_b64 = io.open(os.path.join(HERE, 'hero-seo.b64')).read().strip()
proc_b64 = io.open(os.path.join(HERE, 'process-photo.b64')).read().strip()

# the winning organic result out of the homepage's SERP tile, reused whole as
# the overlay on the process photograph
_i = ARCHIVE.index('<div class="serp serp--win">')
serp_win = ARCHIVE[_i:ARCHIVE.index('</div>', ARCHIVE.index('serp__links', _i)) + 6]
assert 'serp__title' in serp_win

# the Google mark the overlay's search bar carries, and the two glyphs the
# homepage draws in that tile
glogo = re.search(r'<img class="ui__glogo" alt="" src="(data:image/webp;base64,[^"]+)">', ARCHIVE).group(1)
MAG = ('<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'
       '<circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2"/>'
       '<path d="M15.5 15.5 20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>')
UPS = '&#8593;'

# in-page anchors on the homepage become homepage links from a service page
def relink(frag):
    for a in ('#who-we-work-with', '#about', '#results', '#services-overview', '#get-started'):
        frag = frag.replace('href="%s"' % a, 'href="/%s"' % a)
    return frag
nav, mobile, footer = relink(nav), relink(mobile), relink(footer)
nav = nav.replace('<nav class="nav" aria-label="Main">', '<nav class="nav nav--light" aria-label="Main">')
nav = nav.replace('<a class="btn btn--white" href="#contact">', '<a class="btn btn--ink" href="#contact">')
# the SEO entry in both menus is the page you are on
nav = nav.replace('<a class="drop__link" href="/services/seo">',
                  '<a class="drop__link is-current" href="/services/seo" aria-current="page">')

ICON = {
 'audit':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><circle cx="14" cy="14" r="8.5" stroke="currentColor" stroke-width="2.4"/><path d="M20.5 20.5 27 27" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M10.5 14.5l2.5 2.5 4.5-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'code':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M11.5 10 5 16l6.5 6M20.5 10 27 16l-6.5 6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7l-4 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 'doc':    '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M7 5.5h12L25 12v14.5H7z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M18.5 5.5V12H25" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11 17h10M11 21h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
 'pin':    '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M16 28s9-8.4 9-15a9 9 0 1 0-18 0c0 6.6 9 15 9 15z" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="16" cy="13" r="3.4" stroke="currentColor" stroke-width="2.2"/></svg>',
 'link':   '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M13 19l6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M11.5 15 9 17.5a4.6 4.6 0 0 0 6.5 6.5L18 21.5M20.5 17 23 14.5A4.6 4.6 0 0 0 16.5 8L14 10.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'chart':  '<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 27h22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><rect x="8" y="16" width="4.5" height="8" rx="1.2" stroke="currentColor" stroke-width="2.2"/><rect x="15" y="11" width="4.5" height="13" rx="1.2" stroke="currentColor" stroke-width="2.2"/><rect x="22" y="6" width="4.5" height="18" rx="1.2" stroke="currentColor" stroke-width="2.2"/></svg>',
 'arrow':  '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4.5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M13 6.5 18.5 12 13 17.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'up':     '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V5.5" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M5 12.2 12 5l7 7.2" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
 'tick':   '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12.5 9.5 18 20 6.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

PAGE_CSS = """
  /* ---------- service page chrome ----------
     A white bar rather than a transparent nav over a hero: this page opens on
     the page ground, so the header has to be its own surface. It bleeds past
     the shell padding and sticks, and the wordmark svg is currentColor so it
     turns black off the body colour with no override. */
  body{background:var(--page);color:var(--ink-dark);}

  .topbar{
    position:sticky;top:0;z-index:50;
    margin:calc(var(--shell) * -1) calc(var(--shell) * -1) var(--shell);
    background:rgba(255,255,255,.88);
    -webkit-backdrop-filter:saturate(180%) blur(20px);
    backdrop-filter:saturate(180%) blur(20px);
    border-bottom:1px solid rgba(0,0,0,.09);
  }
  /* the bar is sticky, so anchored jumps have to land below it rather than
     underneath it */
  .shell > section[id],.shell > footer[id]{scroll-margin-top:6.5rem;}
  .nav--light{color:var(--ink-dark);}
  .nav--light .nav__logo{color:var(--ink-dark);}
  /* the lime asterisk all but vanishes on white, so on light grounds it
     deepens to the olive end of the same hue */
  .nav--light .nav__star{color:#A8BE22;}
  .nav--light .nav__link{
    border-color:transparent;background:transparent;box-shadow:none;
    backdrop-filter:none;-webkit-backdrop-filter:none;
    color:#40404a;font-weight:500;
  }
  .nav--light .nav__link:hover{background:#F2F2EE;color:var(--ink-dark);}
  .nav--light .nav__item.is-open .nav__link{
    background:var(--ink-dark);color:#fff;border-color:transparent;box-shadow:none;
  }
  .nav--light .callus__label{color:#6b6b73;}
  .nav--light .callus__number{color:var(--ink-dark);}
  .nav--light .callus:hover .callus__number{color:#5B7A00;}
  .nav--light .callus__dot{background:#A8BE22;box-shadow:0 0 0 0 rgba(168,190,34,.6);}
  .nav--light .nav__right::before{background:rgba(0,0,0,.13);}
  .nav--light .burger{border-color:rgba(0,0,0,.14);background:#fff;}
  .nav--light .burger span,
  .nav--light .burger span::before,
  .nav--light .burger span::after{background:var(--ink-dark);}
  .nav--light .drop{
    background:#fff;border-color:rgba(0,0,0,.08);
    box-shadow:0 26px 60px rgba(0,0,0,.16);
  }
  .nav--light .drop::before{background:#fff;border-left-color:rgba(0,0,0,.08);border-top-color:rgba(0,0,0,.08);}
  .nav--light .drop__link:hover{background:#F3F3F0;}
  /* lime on white is unreadable, so every accent in the panel shifts olive */
  .nav--light .drop__link::before{background:#5B7A00;}
  .nav--light .drop__title{color:var(--ink-dark);}
  .nav--light .drop__title span:last-child{color:#5B7A00;}
  .nav--light .drop__desc{color:#6b6b73;}
  .nav--light .drop__foot{color:#5B7A00;border-top-color:rgba(0,0,0,.09);}
  .nav--light .drop__link.is-current{background:#F3F3F0;}
  .nav--light .drop__link.is-current .drop__title span:last-child{opacity:1;transform:none;}

  .btn--ink{background:var(--ink-dark);color:#fff;}
  .btn--ink:hover{background:#2b2b33;}
  .nav__right .btn{order:2;}

  @media (max-width:1180px){
    .nav{gap:1rem;padding:1.25rem var(--edge);}
    .nav__link{padding:.6rem .7rem;font-size:.9375rem;}
  }
  @media (max-width:1024px){
    .nav__menu,.callus,.nav__right .btn{display:none;}
    .burger{display:flex;}
    .nav__right{margin-left:auto;}
  }

  /* ---------- hero ---------- */
  .phero{
    position:relative;isolation:isolate;overflow:hidden;
    border-radius:var(--radius-main);
    min-height:min(40rem,78svh);
    display:flex;align-items:flex-end;
    color:#fff;
  }
  .phero__media{
    position:absolute;inset:0;z-index:-2;
    background-image:url("HERO_SRC");
    /* the faces sit in the upper middle of the frame, so the crop pulls up
       and the empty foreground is what the copy sits on */
    background-position:50% 30%;background-size:cover;background-repeat:no-repeat;
  }
  .phero__scrim{
    position:absolute;inset:0;z-index:-1;
    background:
      linear-gradient(0deg,
        rgba(var(--scrim),.93) 0%, rgba(var(--scrim),.82) 24%,
        rgba(var(--scrim),.5) 48%, rgba(var(--scrim),.18) 72%, rgba(var(--scrim),0) 92%),
      linear-gradient(90deg,
        rgba(var(--scrim),.6) 0%, rgba(var(--scrim),.22) 44%, rgba(var(--scrim),0) 74%);
  }
  .phero__body{
    position:relative;z-index:1;
    width:100%;max-width:var(--max);margin-inline:auto;
    padding:clamp(2.25rem,5vw,4rem) clamp(1.75rem,4vw,3.5rem);
  }
  .crumbs{
    display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;
    margin:0 0 1.35rem;
    /* the crop under the breadcrumb lands around rgb(101,89,85), where .7
       white came out at 3.9:1 */
    font-size:.9375rem;color:rgba(255,255,255,.84);
  }
  .crumbs a{transition:color .16s ease;}
  .crumbs a:hover{color:#fff;}
  .crumbs [aria-current]{color:#fff;}
  .phero h1{
    margin:0;max-width:20ch;
    font-family:var(--font-head);
    font-size:clamp(2.5rem,5.2vw,4.5rem);
    line-height:1.02;letter-spacing:-.042em;font-weight:600;
    text-wrap:balance;
  }
  .phero__lede{margin:1.5rem 0 0;max-width:46rem;font-size:1.0625rem;line-height:1.6;color:var(--grey-100);}
  .phero__actions{display:flex;flex-wrap:wrap;align-items:center;gap:1.25rem;margin:2.25rem 0 0;}
  .phero__call{font-size:.9375rem;color:var(--grey-200);}
  .phero__call:hover{color:#fff;}
  /* the proof line rides the bottom of the photograph rather than starting a
     section of its own */
  .phero__proof{
    display:flex;flex-wrap:wrap;align-items:center;gap:.6rem 1.75rem;
    margin:2.5rem 0 0;padding-top:1.75rem;
    border-top:1px solid rgba(255,255,255,.18);
    font-size:.9375rem;color:var(--grey-100);
  }
  .phero__proof span{display:inline-flex;align-items:center;gap:.5rem;}
  .phero__proof svg{width:1.05rem;height:1.05rem;color:var(--lime);flex:0 0 auto;}

  /* ---------- shared light-section furniture ---------- */
  .band{
    margin-top:var(--shell);
    padding:clamp(3.5rem,6vw,6rem) var(--edge);
    border-radius:var(--radius-main);
  }
  .band--paper{background:var(--paper);color:var(--ink-dark);}
  .band--dark{
    background:
      radial-gradient(ellipse 70% 60% at 8% 0%, rgba(var(--purple-accent),.24) 0%, rgba(var(--purple-accent),0) 62%),
      #1C1729;
    color:#fff;
  }
  .band__head{
    display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);
    gap:clamp(1.5rem,4vw,4rem);align-items:end;
    margin:0 0 clamp(2.5rem,4vw,3.5rem);
    padding-bottom:clamp(1.75rem,3vw,2.5rem);
    border-bottom:1px solid rgba(0,0,0,.11);
  }
  .band--dark .band__head{border-bottom-color:var(--hairline);}
  .band__head h2{
    margin:0;
    font-family:var(--font-head);
    font-size:clamp(1.875rem,3.4vw,3rem);
    line-height:1.06;letter-spacing:-.035em;font-weight:600;
    text-wrap:balance;
  }
  .band__lede{margin:0;max-width:38rem;font-size:1.0625rem;line-height:1.62;color:#54545a;}
  .band--dark .band__lede{color:var(--grey-100);}
  @media (max-width:900px){
    .band__head{grid-template-columns:minmax(0,1fr);align-items:start;gap:1.5rem;}
  }

  /* ---------- what SEO does: the SERP tile, annotated ----------
     Two columns rather than a card grid: the mock search page on one side and
     what each part of it is worth on the other. */
  .what{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(2rem,4vw,4rem);align-items:center;}
  .what__art{
    position:relative;overflow:hidden;
    border-radius:1.5rem;
    padding:2.5rem 1.5rem;
    display:flex;align-items:center;justify-content:center;
    background:
      radial-gradient(72% 80% at 84% 14%, #FF6FC4 0%, rgba(255,111,196,0) 62%),
      radial-gradient(66% 72% at 12% 26%, #8A5CFF 0%, rgba(138,92,255,0) 60%),
      radial-gradient(86% 74% at 40% 100%, #4B4BE8 0%, rgba(75,75,232,0) 64%),
      linear-gradient(200deg,#3A1C74 0%,#2A1458 100%);
  }
  .what__art > .ui{width:min(30rem,100%);}
  .what__list{list-style:none;margin:0;padding:0;display:grid;gap:0;}
  .what__list li{
    display:grid;grid-template-columns:auto minmax(0,1fr);gap:1rem;
    padding:1.35rem 0;
    border-top:1px solid rgba(0,0,0,.1);
  }
  .what__list li:last-child{border-bottom:1px solid rgba(0,0,0,.1);}
  .what__n{
    font-family:var(--font-head);
    font-size:.8125rem;font-weight:700;letter-spacing:.04em;color:#8a8a92;
    padding-top:.2rem;
  }
  .what__list h3{
    margin:0;
    font-family:var(--font-head);
    font-size:1.125rem;font-weight:600;letter-spacing:-.02em;
  }
  .what__list p{margin:.4rem 0 0;font-size:1rem;line-height:1.6;color:#54545a;}
  @media (max-width:900px){
    .what{grid-template-columns:minmax(0,1fr);}
  }

  /* ---------- what is included ----------
     A spec sheet, not six identical icon cards: one hairline-separated row per
     deliverable, two up, so the list scans as a list. */
  .inc{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(2rem,5vw,4.5rem);}
  .inc__item{
    display:grid;grid-template-columns:auto minmax(0,1fr);gap:1.15rem;
    padding:1.85rem 0;
    border-top:1px solid rgba(0,0,0,.1);
  }
  .inc__item:nth-child(-n+2){border-top:0;}
  .inc__ico{
    display:flex;align-items:center;justify-content:center;
    width:2.9rem;height:2.9rem;flex:0 0 auto;
    border-radius:.85rem;
    background:#EFEAFC;color:#4C1D95;
  }
  .inc__ico svg{width:1.5rem;height:1.5rem;}
  .inc__item h3{
    margin:.2rem 0 0;
    font-family:var(--font-head);
    font-size:1.1875rem;font-weight:600;letter-spacing:-.022em;
  }
  .inc__item p{margin:.5rem 0 0;font-size:1rem;line-height:1.62;color:#54545a;}
  .inc__item ul{list-style:none;margin:.9rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.45rem;}
  .inc__item li{
    padding:.3rem .65rem;border-radius:var(--radius-full);
    border:1px solid rgba(0,0,0,.1);background:#fff;
    font-size:.8125rem;font-weight:500;color:#3f3f46;
  }
  @media (max-width:860px){
    .inc{grid-template-columns:minmax(0,1fr);}
    .inc__item:nth-child(2){border-top:1px solid rgba(0,0,0,.1);}
  }

  /* ---------- process ----------
     Steps down the left against a photograph on the right, with the rail and
     its markers drawn inside the steps column. Putting the markers in the
     middle grid track meant aligning them to rows they were not in; drawn on
     each step, every marker lands on its own step by construction. */
  .proc{
    display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
    gap:clamp(2rem,5vw,5rem);
    align-items:start;
  }
  .proc__steps{position:relative;padding-right:4rem;}
  /* the connector, behind the markers */
  .proc__steps::before{
    content:"";
    position:absolute;right:1.55rem;top:1.1rem;bottom:1.1rem;
    width:1px;background:var(--hairline);
  }
  .step{position:relative;padding:0 0 clamp(2.25rem,4vw,3.25rem);}
  .step:last-child{padding-bottom:0;}
  .step__pin{
    position:absolute;top:.1rem;right:0;
    display:flex;align-items:center;justify-content:center;
    width:2.1rem;height:2.1rem;
    border-radius:50%;
    background:var(--lime);color:var(--ink-dark);
    box-shadow:0 0 0 5px #1C1729;
  }
  .step__pin svg{width:.85rem;height:.85rem;}
  .step__n{
    margin:0;
    font-size:.875rem;color:var(--grey-200);
  }
  .step h3{
    margin:.5rem 0 0;
    font-family:var(--font-head);
    font-size:1.3125rem;font-weight:600;letter-spacing:-.024em;color:#fff;
  }
  .step p{margin:.6rem 0 0;max-width:34rem;font-size:1rem;line-height:1.62;color:var(--grey-100);}
  .step__when{
    display:inline-flex;align-items:center;
    margin-top:.9rem;padding:.25rem .6rem;
    border-radius:var(--radius-full);
    border:1px solid var(--hairline);
    font-size:.75rem;font-weight:600;color:var(--grey-200);
  }

  /* the photograph, with the result it produced lapping its bottom-right */
  .proc__shot{position:relative;padding:0 0 clamp(3rem,6vw,5rem) 0;}
  /* direct child only: the SERP overlay nested inside carries an <img> of its
     own, and an unscoped rule here stretched the Google mark to the frame */
  .proc__shot > img{
    display:block;width:100%;height:auto;
    aspect-ratio:4 / 3;object-fit:cover;
    border-radius:1.25rem;
    box-shadow:0 2px 4px rgba(0,0,0,.2), 0 24px 60px rgba(0,0,0,.4);
  }
  /* 58% wide and pulled 12% past the frame: the lap is deep enough to read as
     one object and shallow enough that no line of the result is clipped */
  .proc__serp{
    position:absolute;right:-3%;bottom:0;
    width:min(58%,20rem);
    border-radius:.85rem;
    background:#fff;
    overflow:hidden;
    box-shadow:0 2px 4px rgba(0,0,0,.16), 0 20px 44px rgba(0,0,0,.38);
  }
  .proc__serp .serp{margin:0 .55rem .55rem;}
  .proc__serp .ui__gbar{padding:.7rem .7rem .5rem;}
  .proc__serpfoot{
    display:flex;align-items:center;gap:.5rem;
    padding:.55rem .8rem .65rem;
    border-top:1px solid rgba(0,0,0,.07);
    font-size:.6875rem;color:#5f5f68;
  }
  .proc__serpfoot b{
    display:inline-flex;align-items:center;gap:.2rem;
    padding:.15rem .4rem;border-radius:.3rem;
    background:#E8FCA6;color:#2F3D00;font-size:.625rem;font-weight:700;
  }
  .proc__serpfoot span{margin-left:auto;font-weight:600;color:var(--ink-dark);}

  @media (max-width:960px){
    .proc{grid-template-columns:minmax(0,1fr);gap:2.75rem;}
    .proc__shot{order:-1;padding-bottom:3.5rem;}
    .proc__steps{padding-right:3.25rem;}
  }
  @media (max-width:560px){
    /* the photo is only about 270px tall here, so a lapping overlay covers
       most of it. Below this width it drops into flow and laps the bottom
       edge by a margin instead. */
    .proc__shot{padding-bottom:0;}
    .proc__serp{
      position:static;
      width:88%;margin:-1.75rem 0 0 auto;
    }
  }

  /* ---------- other services ----------
     The art is the homepage's own panel markup, not a picture of it, so the
     tiles cannot drift out of step with the homepage. */
  .others__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:clamp(1.5rem,3vw,2.5rem);}
  .ocard{
    display:flex;flex-direction:column;
    border:1px solid rgba(0,0,0,.09);
    border-radius:1.5rem;
    background:#fff;
    overflow:hidden;
    box-shadow:0 1px 2px rgba(0,0,0,.05), 0 12px 32px rgba(0,0,0,.07);
    transition:transform .22s ease, box-shadow .22s ease;
  }
  .ocard:hover{transform:translateY(-4px);box-shadow:0 2px 4px rgba(0,0,0,.06), 0 22px 50px rgba(0,0,0,.12);}
  /* the panel is the homepage component untouched apart from its corners.
     Two cards at this width give the stack the same 592px it gets on the
     homepage, so the tiles render identically: shrinking the stack was what
     made the ad copy wrap a word to a line. */
  .ocard .suite__art{
    border-radius:0;
    border-bottom:1px solid rgba(0,0,0,.06);
  }
  .ocard__body{display:flex;flex-direction:column;flex:1 1 auto;padding:1.85rem;}
  .ocard__tag{margin:0;font-size:.9375rem;font-weight:500;color:#5B7A00;}
  .ocard h3{
    margin:.5rem 0 0;
    font-family:var(--font-head);
    font-size:clamp(1.375rem,2.2vw,1.875rem);
    line-height:1.12;letter-spacing:-.028em;font-weight:700;
  }
  .ocard p{margin:1rem 0 1.5rem;font-size:1rem;line-height:1.62;color:#4f4f4f;}
  .ocard__go{
    display:inline-flex;align-items:center;gap:.6rem;align-self:flex-start;
    margin-top:auto;
    font-size:.9375rem;font-weight:700;color:var(--ink-dark);
  }
  .ocard__go span{
    display:inline-flex;align-items:center;justify-content:center;
    width:1.8rem;height:1.8rem;border-radius:50%;
    background:var(--lime);
    transition:transform .18s ease;
  }
  .ocard__go svg{width:.9rem;height:.9rem;}
  .ocard:hover .ocard__go span{transform:translateX(.2rem);}
  @media (max-width:860px){
    .others__grid{grid-template-columns:minmax(0,1fr);}
  }

  /* ---------- reviews, static ----------
     The homepage runs these on three auto-scrolling rails. A service page has
     one job, so here it is three cards and the proof bar, nothing moving. */
  /* white rather than --paper: the case-study band directly above is already
     --paper, and two of them in a row read as one long panel */
  .voices{background:#fff;}
  .voices__head{
    display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);
    gap:clamp(1.5rem,4vw,4rem);align-items:end;text-align:left;
    max-width:none;
    padding-bottom:clamp(1.75rem,3vw,2.5rem);
    border-bottom:1px solid rgba(0,0,0,.11);
  }
  .voices__head h2{font-size:clamp(1.875rem,3.4vw,3rem);}
  .voices__lede{margin:0;max-width:38rem;}
  .voices__flat{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem;}
  .voices__flat .vcard{background:#FBFBF9;}
  @media (max-width:900px){
    .voices__head{grid-template-columns:minmax(0,1fr);align-items:start;gap:1.25rem;}
    .voices__flat{grid-template-columns:minmax(0,1fr);}
  }

  /* the marquee sits on the page ground here, not inside a dark section */
  .trust{
    padding:clamp(2rem,3.5vw,3rem) 0 clamp(.5rem,1vw,1rem);
  }
  .trust__label{
    margin:0 auto 1.75rem;
    text-align:center;
    font-size:.8125rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;
    color:#6b6b73;
  }
  .trust .logo img{filter:brightness(0);opacity:.5;}
  .trust .marquee{max-width:74rem;margin-inline:auto;}

  @media (max-width:640px){
    :root{--shell:.65rem;--radius-main:1.25rem;}
    .phero{min-height:0;}
    .phero__body{padding:2rem 1.35rem;}
    .phero h1{font-size:2.375rem;letter-spacing:-.03em;}
    .phero__lede{font-size:1rem;}
    .phero__actions .btn{width:100%;}
    .phero__call{width:100%;text-align:center;}
    .band{padding:2.75rem 1.35rem 3rem;}
  }
"""
PAGE_CSS = PAGE_CSS.replace('HERO_SRC', hero_b64)

# ------------------------------------------------------------------ markup --
INC = [
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

STEPS = [
 ('Audit', 'We go through the site, the analytics and the search results you are already in, then tell you what is capping growth. You get this whether you sign or not.', 'Week 1'),
 ('Plan', 'The order of work, priced, with the reasoning attached. Usually a mix of fixing what exists and building what does not.', 'Week 2'),
 ('Build', 'Technical fixes, then pages, then links. We work in a running order rather than doing a bit of everything and waiting.', 'Month 1 on'),
 ('Compound', 'Monthly reporting on traffic, enquiries and revenue, and a rolling plan for what is next. Rankings you keep without paying per click.', 'Ongoing'),
]

WHAT = [
 ('The AI answer', 'Google now answers a lot of questions itself, citing the pages it trusts. Being one of the cited sources is the new top of the page.'),
 ('The organic results', 'The listings nobody pays for. They cost you nothing per click and they keep working after you stop spending.'),
 ('The map pack', 'For anything local, this is the whole game. Three results, and they get the calls.'),
 ('The things below', 'People also ask, images, related searches. Each one is a place to be, and most sites never turn up in any of them.'),
]

FAQ = [
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

CASES = [
 ('a', 'Pestline', 'Pest control, Melbourne', '641%', 'more local organic traffic', 'Local SEO', '/case-studies/pestline',
  'Learn how our local SEO experts helped Pestline dominate Melbourne&rsquo;s South Eastern suburbs.'),
 ('b', 'Solargain', 'Solar and battery installer', '220%', 'growth after a Google penalty', 'Technical SEO', '/case-studies/solargain',
  'See how we recovered Solargain from a Google penalty, then grew the site by 220% on top of it.'),
 ('c', 'Approved Electrix', 'Electrical contractor', '318%', 'more keywords ranking top three', 'SEO', '/case-studies/approved-electrix',
  'Approved Electrix challenged us to scale their business fast. Here is how we met that challenge.'),
]

REVIEWS = [
 ('RS', 'a', 'Russell Smith', 'Strategic Regrouting',
  'After trying a few different SEO companies over the past 10 years, finding DUNK has been a complete game changer for my business. Since coming on board, my workload has tripled.'),
 ('PA', 'c', 'Pirk Au', 'Google review &middot; a year ago',
  'They upgraded our website&rsquo;s backend to support a more effective SEO structure and we are already seeing the benefits. Straightforward, honest and truly dedicated to their craft.'),
 ('KO', 'b', 'Kevin Omoro', 'Google review &middot; 2 years ago',
  'They have an impressive portfolio of quality publishers that helped elevate our site&rsquo;s visibility and organic rankings.'),
]

def inc_items():
    out = []
    for ico, h, p, chips in INC:
        lis = ''.join('<li>%s</li>' % c for c in chips)
        out.append(
          '        <div class="inc__item">\n'
          '          <span class="inc__ico">%s</span>\n'
          '          <div>\n'
          '            <h3>%s</h3>\n'
          '            <p>%s</p>\n'
          '            <ul>%s</ul>\n'
          '          </div>\n'
          '        </div>' % (ICON[ico], h, p, lis))
    return '\n'.join(out)

def steps():
    chev = ('<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'
            '<path d="M6.5 10 12 15.5 17.5 10" stroke="currentColor" stroke-width="2.6" '
            'stroke-linecap="round" stroke-linejoin="round"/></svg>')
    return '\n'.join(
      '        <div class="step">\n'
      '          <span class="step__pin" aria-hidden="true">%s</span>\n'
      '          <p class="step__n">Step 0%d</p>\n'
      '          <h3>%s</h3>\n'
      '          <p>%s</p>\n'
      '          <span class="step__when">%s</span>\n'
      '        </div>' % (chev, i, h, p, w) for i, (h, p, w) in enumerate(STEPS, 1))

def whatlist():
    return '\n'.join(
      '          <li>\n'
      '            <span class="what__n">0%d</span>\n'
      '            <div>\n'
      '              <h3>%s</h3>\n'
      '              <p>%s</p>\n'
      '            </div>\n'
      '          </li>' % (i, h, p) for i, (h, p) in enumerate(WHAT, 1))

def faqlist():
    out = []
    for i, (q, a) in enumerate(FAQ):
        op = ' open' if i == 0 else ''
        out.append(
          '        <details class="qa" name="faq"%s>\n'
          '          <summary>%s<span class="qa__icon" aria-hidden="true"></span></summary>\n'
          '          <div class="qa__body"><p>%s</p></div>\n'
          '        </details>' % (op, q, a))
    return '\n'.join(out)

def caselist():
    out = []
    for tint, name, trade, metric, label, tag, href, text in CASES:
        out.append(
          '        <a class="ccard ccard--%s" href="%s">\n'
          '          <div class="ccard__head">\n'
          '            <span class="ccard__mark"><img alt="%s" src="%s"></span>\n'
          '            <span class="ccard__id">\n'
          '              <span class="ccard__name">%s</span>\n'
          '              <span class="ccard__trade">%s</span>\n'
          '            </span>\n'
          '          </div>\n'
          '          <div class="ccard__body">\n'
          '            <p class="ccard__metric">%s%s</p>\n'
          '            <p class="ccard__label">%s</p>\n'
          '            <p class="ccard__text">%s</p>\n'
          '            <div class="ccard__foot">\n'
          '              <span class="ccard__tag">%s</span>\n'
          '              <span class="ccard__go">Read it <span aria-hidden="true">%s</span></span>\n'
          '            </div>\n'
          '          </div>\n'
          '        </a>' % (tint, href, name, logos[name], name, trade,
                           ICON['up'], metric, label, text, tag, ICON['arrow']))
    return '\n'.join(out)

def reviewlist():
    return '\n'.join(
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
      for ini, tint, name, role, q in REVIEWS)

BODY = """
<div class="shell">

  <header class="topbar">
    {NAV}
  </header>

  <section class="phero">
    <div class="phero__media" role="img" aria-label="Three people working through a plan together at a table"></div>
    <div class="phero__scrim" aria-hidden="true"></div>
    <div class="phero__body">
      <nav class="crumbs" aria-label="Breadcrumb">
        <a href="/">Home</a>
        <span aria-hidden="true">/</span>
        <a href="/#services-overview">What we do</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">SEO</span>
      </nav>
      <h1>SEO that earns the rankings you stop paying for</h1>
      <p class="phero__lede">Rankings compound. We fix what is holding your site back, then build the pages
        that earn positions you do not have to buy again every time someone clicks. Melbourne based,
        working with businesses across Australia.</p>
      <div class="phero__actions">
        <a class="btn btn--lime" href="#contact">Get a free SEO audit<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>
        <a class="phero__call" href="tel:0396994585">or call 03 9699 4585</a>
      </div>
      <p class="phero__proof">
        <span>{TICK}4.9 from 123 Google reviews</span>
        <span>{TICK}300+ Australian businesses</span>
        <span>{TICK}No lock-in contracts</span>
      </p>
    </div>
  </section>

  <section class="trust">
    <p class="trust__label">Brands we have done this for</p>
    {MARQUEE}
  </section>

  <section class="band band--paper" id="what-seo-does">
    <div class="band__head">
      <h2>What you are actually competing for</h2>
      <p class="band__lede">A search result is not a list of ten links any more. It is an answer, a map, a
        set of questions and then the links, and SEO is the work of turning up in as many of those places
        as your competitors do not.</p>
    </div>

    <div class="what">
      <div class="what__art">
        {SERP}
      </div>
      <ul class="what__list">
{WHATLIST}
      </ul>
    </div>
  </section>

  <section class="band band--paper" id="included">
    <div class="band__head">
      <h2>What SEO with us includes</h2>
      <p class="band__lede">Not every engagement uses all six. The audit decides the order, and we would
        rather do three of these properly than bill for all of them.</p>
    </div>
    <div class="inc">
{INCITEMS}
    </div>
  </section>

  <section class="band band--dark" id="process">
    <div class="band__head">
      <h2>How the work runs</h2>
      <p class="band__lede">Four stages, in this order, because doing them in any other order wastes your
        money. You see the audit before you commit to anything.</p>
    </div>

    <div class="proc">
      <div class="proc__steps">
{STEPS}
      </div>

      <div class="proc__shot">
        <img alt="Two DUNK strategists working through a client's search plan" src="PROC_SRC">
        <div class="proc__serp" aria-hidden="true">
          <div class="ui__gbar">
            <img class="ui__glogo" alt="" src="GLOGO">
            <p class="ui__search">{MAG}window cleaning melbourne</p>
          </div>
{SERPWIN}
          <p class="proc__serpfoot"><b>{UPS} 87</b> ranking keywords<span>412</span></p>
        </div>
      </div>
    </div>
  </section>

  <section class="cases" id="results">
    <div class="cases__head">
      <h2>What that has looked like</h2>
      <a class="cases__all" href="/case-studies">All case studies {ARROW}</a>
    </div>
    <div class="cases__grid">
{CASELIST}
    </div>
  </section>

  <section class="voices" id="reviews">
    <div class="voices__head">
      <h2>What clients say about the SEO work</h2>
      <p class="voices__lede">Reviews left on Google by the businesses whose search traffic we look after.</p>
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
{REVIEWLIST}
    </div>
  </section>

  <section class="faq" id="faq">
    <div class="faq__inner">
      <div class="faq__side">
        <h2>Questions people ask before starting SEO</h2>
        <p>If yours is not here, ask it on the call. We would rather answer it before you commit to
          anything than after.</p>
        <a class="btn btn--lime" href="#contact">Get a free SEO audit<span class="btn__arrow" aria-hidden="true">&#8599;</span></a>
        <a class="faq__tel" href="tel:0396994585">or call 03 9699 4585</a>
      </div>
      <div class="faq__list">
{FAQLIST}
      </div>
    </div>
  </section>

  <section class="band band--paper" id="other-services">
    <div class="band__head">
      <h2>What else we run alongside SEO</h2>
      <p class="band__lede">SEO builds the traffic you are not paying for. These two buy you enquiries
        while it does. Most of our clients run one of them with it.</p>
    </div>

    <div class="others__grid">
      <article class="ocard">
        {ARTGOOGLE}
        <div class="ocard__body">
          <p class="ocard__tag">Capture the demand that exists today</p>
          <h3>Google Advertising</h3>
          <p>People are already searching for what you sell. Search, Shopping and Performance Max put you
            in front of them at the moment they are looking, and we only bid on the terms that turn into
            work, not the ones that flatter the report.</p>
          <a class="ocard__go" href="/services/google-ads">See how we run Google Ads <span aria-hidden="true">{ARROW}</span></a>
        </div>
      </article>

      <article class="ocard">
        {ARTMETA}
        <div class="ocard__body">
          <p class="ocard__tag">Create demand before anyone searches</p>
          <h3>Meta Advertising</h3>
          <p>Not everyone is ready to search yet. Facebook and Instagram put your best creative in front
            of the people who will be, then quietly follow up with the ones who nearly bought.</p>
          <a class="ocard__go" href="/services/meta-ads">See how we run Meta Ads <span aria-hidden="true">{ARROW}</span></a>
        </div>
      </article>
    </div>
  </section>

{CTA}

{FOOTER}

</div>

{MOBILE}

{SCRIPT}
"""

# the SERP tile out of the homepage's SEO row, reused whole
# the SEO row's panel holds a bare .ui rather than a .stack, so the tile is
# lifted straight out of it
serp_stack = div_block(art_seo, art_seo.index('<div class="ui'))
assert 'serp' in serp_stack, serp_stack[:120]

BODY = (BODY.replace('{NAV}', nav)
            .replace('{MARQUEE}', marquee)
            .replace('{SERP}', serp_stack)
            .replace('{WHATLIST}', whatlist())
            .replace('{INCITEMS}', inc_items())
            .replace('{STEPS}', steps())
            .replace('PROC_SRC', proc_b64)
            .replace('{SERPWIN}', serp_win)
            .replace('GLOGO', glogo)
            .replace('{MAG}', MAG)
            .replace('{UPS}', UPS)
            .replace('{CASELIST}', caselist())
            .replace('{REVIEWLIST}', reviewlist())
            .replace('{FAQLIST}', faqlist())
            .replace('{ARTGOOGLE}', art_google)
            .replace('{ARTMETA}', art_meta)
            .replace('{CTA}', cta)
            .replace('{FOOTER}', footer)
            .replace('{MOBILE}', mobile)
            .replace('{SCRIPT}', script)
            .replace('{TICK}', ICON['tick'])
            .replace('{ARROW}', ICON['arrow']))

DOC = ('<!DOCTYPE html>\n<html lang="en-AU">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
       '<title>SEO Melbourne | Search Engine Optimisation | DUNK</title>\n'
       '<meta name="description" content="Melbourne SEO that earns rankings you do not pay per click for. '
       'Technical SEO, content, local SEO and link building for Australian businesses. No lock-in contracts.">\n'
       + head_links + '\n<style>\n'
       + tokens
       + '  /* ---------- shell ---------- */\n  .shell{padding:var(--shell);}\n\n'
       + navcss + marqcss + faqcss + suitecss + casecss + voicescss
       + leadcss + footcss + ctacss + mobcss + rmcss + PAGE_CSS
       + '</style>\n</head>\n<body>\n' + BODY + '\n</body>\n</html>\n')

for bad in ('HERO_SRC', '{NAV}', '{CTA}', '{SERP}', '{ARTGOOGLE}', '{ARTMETA}', '{MOBILE}'):
    assert bad not in DOC, bad
assert '—' not in DOC, 'em dash present'
assert DOC.count('<nav class="nav nav--light"') == 1
assert DOC.count('id="mobile-nav"') == 1
assert DOC.count('class="ui') >= 3, DOC.count('class="ui')
io.open(OUT, 'w', encoding='utf-8').write(DOC)
print('wrote', OUT, round(len(DOC) / 1024), 'KB')
