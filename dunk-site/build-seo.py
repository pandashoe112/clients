import pathlib,re,json
SP=pathlib.Path("/tmp/claude-0/-home-user-clients/568dcb7b-30b6-55ad-b601-4c4a9c3e8488/scratchpad")
imgs=json.loads((SP/"imgs.json").read_text())
head=(SP/"shell_head.txt").read_text(encoding="utf-8")
nav=(SP/"shell_nav.txt").read_text(encoding="utf-8")
foot=(SP/"shell_foot.txt").read_text(encoding="utf-8")
script=(SP/"shell_script.txt").read_text(encoding="utf-8")
CAL="https://calendly.com/dunk-agency/growth-call"

# page-specific title/description
head=head.replace("<title>DUNK Growth Agency</title>","<title>SEO Services Melbourne</title>")
head=re.sub(r'<meta name="description" content="[^"]*">',
 '<meta name="description" content="SEO for Australian small businesses. Technical foundations, search-led content and authority building that compounds — senior strategists, your own accounts, no lock-in.">',head)

STAR=('<svg class="hstar" viewBox="0 0 100 100" aria-hidden="true" fill="none" stroke="currentColor" '
 'stroke-width="7" stroke-linecap="round">'
 '<path d="M50 6v88M6 50h88M19 19l62 62M81 19l-62 62"/></svg>')
GLITCH=('<g fill="#D7F24C">'
 '<rect x="0" y="0" width="30" height="30" rx="8"/><rect x="60" y="0" width="30" height="30" rx="8"/>'
 '<rect x="30" y="30" width="30" height="30" rx="8"/>'
 '<rect x="0" y="60" width="30" height="30" rx="8"/><rect x="60" y="60" width="30" height="30" rx="8"/></g>')
ARROW=('<i aria-hidden="true"><svg width="15" height="15" viewBox="0 0 15 15" fill="none">'
 '<path d="M3.5 11.5 11.5 3.5M5 3.5h6.5V10" stroke="currentColor" stroke-width="1.9" '
 'stroke-linecap="round" stroke-linejoin="round"/></svg></i>')

# ── value props ──
props=[("Search strategy","Which terms actually bring buyers, and which just bring traffic."),
       ("Technical foundations","A site Google can crawl, read and trust — fast, clean, indexed."),
       ("Search-led content","Pages built around what your market is typing, not what's easy to write."),
       ("Authority building","Relevant links that make your rankings hold when competitors push back.")]
propcards="".join('''      <div class="vp">
        <span class="vp__n">0%d</span>
        <h3>%s</h3>
        <p>%s</p>
      </div>
'''%(i+1,t,d) for i,(t,d) in enumerate(props))

# ── alternating text / image rows ──
rows=[("Get found by people already looking","seo1",False,
  "Most of your market never scrolls past the first few results. SEO puts you in that space for the searches that actually end in an enquiry — not the vanity keywords that look good in a report.",
  ["Keyword and intent research","Local and map pack visibility","Commercial page mapping"]),
 ("Fix the foundations before chasing rankings","seo2",True,
  "There is no point publishing content on a site Google struggles to read. We start with the plumbing: crawlability, site speed, structure, indexation and the technical debt quietly capping everything else.",
  ["Technical audit and fixes","Site speed and Core Web Vitals","Internal linking structure"]),
 ("Build authority that holds","seo3",False,
  "Rankings you can hold are the ones backed by genuine authority. We earn links from sites that matter in your market and build the topical depth that makes your best pages hard to displace.",
  ["Digital PR and outreach","Content-led link acquisition","Competitor gap analysis"])]
rowhtml=""
for i,(t,key,flip,body,bullets) in enumerate(rows):
    lis="".join('<li>%s</li>'%b for b in bullets)
    rowhtml+='''    <article class="tir%s rv">
      <div class="tir__shot">
        <img src="%s" alt="" loading="lazy">
        <svg class="tir__glitch" viewBox="0 0 90 90" aria-hidden="true">%s</svg>
      </div>
      <div class="tir__body">
        <span class="tir__n">0%d</span>
        <h3>%s</h3>
        <p>%s</p>
        <ul>%s</ul>
      </div>
    </article>
'''%(" tir--flip" if flip else "",imgs[key],GLITCH,i+1,t,body,lis)

# ── process ──
steps=[("Understand","Your business, margins, market and what a customer is worth."),
       ("Strategise","The terms worth winning, the pages that will win them, in what order."),
       ("Optimise","Technical fixes, on-page work and the structure Google needs."),
       ("Build","Content and authority, published and earned on a steady cadence."),
       ("Measure","Rankings, traffic and — the one that counts — enquiries."),
       ("Improve","Double down on what moved, cut what didn't. Every month.")]
stephtml="".join('''        <div class="pstep">
          <span class="pstep__n">%02d</span>
          <h3>%s</h3>
          <p>%s</p>
        </div>
'''%(i+1,t,d) for i,(t,d) in enumerate(steps))

# ── FAQs ──
faqs=[("How long does SEO take to show results?",
  "Technical fixes can move things in weeks. Content and authority compound over months — most clients see meaningful lead volume between month three and six, and it keeps building from there."),
 ("How do you measure SEO success?",
  "Enquiries and cost per enquiry first. Rankings and traffic are inputs we watch to explain the movement, not the scoreboard."),
 ("Do you work with our existing website?",
  "Almost always, yes. We audit what's there and fix it. If the platform itself is the blocker we'll tell you plainly rather than quietly working around it."),
 ("What is AI search, and does it replace SEO?",
  "AI answers pull from the same signals SEO builds: clear content, technical health and authority. It changes how results are presented, not what earns them. We optimise for both."),
 ("Can SEO reduce what we spend on ads?",
  "Over time, yes. Organic picks up demand you're currently paying for. We usually run both, then shift the mix as organic carries more of the load."),
 ("Is SEO worth it for a small business?",
  "If people search for what you sell, yes. We scope the work to your market — a local service business needs a fraction of what a national eCommerce brand does.")]
faqhtml="".join('''        <details class="faq">
          <summary><span>%s</span><i aria-hidden="true"></i></summary>
          <p>%s</p>
        </details>
'''%(q,a) for q,a in faqs)

related=[("Google Advertising","/services/google-ads","Capture the people searching right now."),
         ("Meta Advertising","/services/meta-ads","Reach your market before it starts looking."),
         ("Link Building","/services/link-building","Authority that makes rankings hold.")]
relhtml="".join('''        <a class="rel" href="%s">
          <h3>%s</h3><p>%s</p><span class="rel__go">Explore %s</span>
        </a>
'''%(h,t,d,t) for t,h,d in related)

CSS = '''
/* ── light nav variant ────────────────────────────────────────────────── */
.nav--light .nav__mark{color:var(--on-paper)}
.nav--light .nav__link{color:rgba(22,22,38,.78)}
.nav--light .nav__link:hover{color:var(--on-paper)}
.nav--light .nav__link::after{background:var(--violet)}
.nav--light .nav__call{border-right-color:rgba(22,22,38,.16)}
.nav--light .nav__callbody small{color:var(--on-paper-soft)}
.nav--light .nav__callbody b{color:var(--on-paper)}
.nav--light .nav__call:hover .nav__callbody b{color:var(--violet)}
.nav--light .nav__pulse{background:var(--violet)}
.nav--light .nav__pulse::after{border-color:rgba(109,40,217,.45)}
.nav--light .menu>summary{color:var(--on-paper);border-color:rgba(22,22,38,.22)}
.nav--light .menu[open]>summary{color:var(--violet);border-color:var(--violet)}

/* ══ SEO page ═════════════════════════════════════════════════════════ */
.shero{position:relative;overflow:hidden;background:var(--paper);color:var(--on-paper);padding-block:clamp(150px,15vw,200px) clamp(56px,6.5vw,90px)}
.shero__in{position:relative;text-align:center}
.hstar{
  position:absolute;pointer-events:none;color:var(--violet);
  width:clamp(72px,8vw,124px);height:clamp(72px,8vw,124px);
}
.hstar--l{top:-2%;left:0;opacity:.85}
.hstar--r{top:46%;right:0;color:var(--violet-2);opacity:.5;width:clamp(56px,6vw,96px);height:clamp(56px,6vw,96px)}
.crumb{
  display:inline-flex;align-items:center;gap:9px;margin:0 auto 22px;
  font-weight:800;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--on-paper-soft);
}
.crumb a{color:var(--violet)}
.crumb a:hover{text-decoration:underline}
.shero h1{
  font-family:var(--display);font-weight:700;
  font-size:clamp(38px,6vw,86px);line-height:1.02;letter-spacing:-.022em;
  margin:0 auto 22px;max-width:19ch;
}
.shero__sub{margin:0 auto 34px;max-width:60ch;font-size:clamp(16px,1.35vw,19px);line-height:1.62;color:var(--on-paper-soft)}
.shero__cta{display:flex;flex-wrap:wrap;gap:14px 22px;justify-content:center;align-items:center}
.shero .btn--pill{background:var(--signal);color:#10091F}
.shero__ghost{
  display:inline-flex;align-items:center;gap:10px;
  font-weight:800;font-size:15px;color:var(--on-paper);
  border-bottom:2px solid var(--violet);padding-bottom:5px;
}

/* value props */
.vps{display:grid;gap:clamp(22px,2.6vw,34px)}
@media(min-width:620px){.vps{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.vps{grid-template-columns:repeat(4,1fr)}}
.vp{padding-top:22px;border-top:2px solid rgba(255,255,255,.16)}
.vp__n{display:block;font-family:var(--display);font-weight:700;font-size:13px;letter-spacing:.06em;color:var(--signal);margin-bottom:12px}
.vp h3{font-family:var(--display);font-weight:700;font-size:clamp(19px,1.8vw,23px);line-height:1.16;margin:0 0 10px;color:#fff}
.vp p{margin:0;font-size:14.5px;line-height:1.6;color:var(--on-dark-soft)}

/* text + image rows */
.tir{display:grid;gap:clamp(28px,3.6vw,64px);align-items:center;padding-block:clamp(32px,4vw,56px)}
.tir + .tir{border-top:var(--rule-paper)}
@media(min-width:940px){
  .tir{grid-template-columns:1fr 1fr}
  .tir--flip .tir__shot{order:2}
}
.tir__shot{position:relative}
.tir__shot img{width:100%;aspect-ratio:5/4;object-fit:cover;border-radius:24px;display:block;border:1px solid rgba(22,22,38,.1)}
.tir__glitch{position:absolute;width:clamp(44px,4.2vw,62px);height:auto;top:clamp(-20px,-1.7vw,-12px);left:clamp(-12px,-1.2vw,-8px);transform:rotate(-12deg);filter:drop-shadow(0 3px 8px rgba(22,22,38,.22))}
.tir--flip .tir__glitch{left:auto;right:clamp(-12px,-1.2vw,-8px);transform:rotate(12deg)}
.tir__n{
  display:inline-grid;place-items:center;width:42px;height:42px;border-radius:13px;
  background:var(--wash);color:#141026;font-family:var(--display);font-weight:700;font-size:15px;margin-bottom:18px;
}
.tir__body h3{font-family:var(--display);font-weight:700;font-size:clamp(24px,2.7vw,38px);line-height:1.08;letter-spacing:-.014em;margin:0 0 16px}
.tir__body p{margin:0 0 20px;font-size:clamp(15.5px,1.25vw,17.5px);line-height:1.66;color:var(--on-paper-soft);max-width:52ch}
.tir__body ul{list-style:none;margin:0;padding:0;display:grid;gap:10px}
.tir__body li{display:flex;gap:11px;align-items:flex-start;font-size:15px;font-weight:600;color:var(--on-paper)}
.tir__body li::before{
  content:"";flex:none;width:18px;height:18px;margin-top:2px;border-radius:6px;
  background:var(--signal);
}

/* process */
.psteps{display:grid;gap:1px;background:rgba(199,190,230,.14);border-radius:22px;overflow:hidden}
@media(min-width:660px){.psteps{grid-template-columns:1fr 1fr}}
@media(min-width:1040px){.psteps{grid-template-columns:repeat(3,1fr)}}
.pstep{background:#120726;padding:clamp(24px,2.6vw,34px)}
.pstep__n{display:block;font-family:var(--display);font-weight:700;font-size:clamp(26px,2.6vw,34px);line-height:1;color:rgba(215,242,76,.35);margin-bottom:16px}
.pstep h3{font-family:var(--display);font-weight:700;font-size:20px;margin:0 0 9px;color:#fff}
.pstep p{margin:0;font-size:14.5px;line-height:1.6;color:var(--on-dark-soft)}

/* FAQs */
.faqs{display:grid;gap:12px;max-width:940px}
.faq{background:#fff;border:var(--rule-paper);border-radius:18px;overflow:hidden}
.faq summary{
  list-style:none;cursor:pointer;display:flex;align-items:center;gap:18px;
  padding:clamp(18px,2vw,24px);
  font-family:var(--display);font-weight:700;font-size:clamp(17px,1.6vw,21px);line-height:1.24;
}
.faq summary::-webkit-details-marker{display:none}
.faq summary i{
  margin-left:auto;flex:none;position:relative;width:26px;height:26px;border-radius:9px;
  background:var(--wash);transition:background-color .25s,transform .25s;
}
.faq summary i::before,.faq summary i::after{
  content:"";position:absolute;left:50%;top:50%;background:#141026;border-radius:2px;
  transform:translate(-50%,-50%);
}
.faq summary i::before{width:12px;height:2.4px}
.faq summary i::after{width:2.4px;height:12px;transition:opacity .25s}
.faq[open] summary i{background:var(--violet);transform:rotate(90deg)}
.faq[open] summary i::before,.faq[open] summary i::after{background:#fff}
.faq[open] summary i::after{opacity:0}
.faq p{margin:0;padding:0 clamp(18px,2vw,24px) clamp(20px,2.2vw,26px);font-size:15.5px;line-height:1.68;color:var(--on-paper-soft);max-width:74ch}

/* related */
.rels{display:grid;gap:clamp(16px,1.8vw,22px)}
@media(min-width:760px){.rels{grid-template-columns:repeat(3,1fr)}}
.rel{
  display:flex;flex-direction:column;
  background:#fff;border:var(--rule-paper);border-radius:20px;
  padding:clamp(24px,2.6vw,32px);
  transition:transform .3s cubic-bezier(.2,.7,.3,1),box-shadow .3s,border-color .3s;
}
.rel:hover{transform:translateY(-5px);box-shadow:0 26px 54px -34px rgba(22,22,38,.42);border-color:rgba(109,40,217,.4)}
.rel h3{font-family:var(--display);font-weight:700;font-size:clamp(21px,2vw,26px);margin:0 0 10px}
.rel p{margin:0 0 22px;font-size:15px;line-height:1.6;color:var(--on-paper-soft)}
.rel__go{margin-top:auto;font-weight:800;font-size:14px;border-bottom:2px solid var(--signal);padding-bottom:4px;align-self:flex-start}
'''

page = head.replace("</style>",CSS+"</style>") + '''
<!-- ══ hero ═════════════════════════════════════════════════════════════ -->
<section class="shero" id="top">
''' + nav.replace('class="nav"','class="nav nav--light"') + '''

  <div class="wrap shero__in seq">
    ''' + STAR.replace('class="hstar"','class="hstar hstar--l"') + '''
    ''' + STAR.replace('class="hstar"','class="hstar hstar--r"') + '''
    <p class="crumb"><a href="/">Home</a> <span aria-hidden="true">/</span> <a href="/services">Services</a> <span aria-hidden="true">/</span> SEO</p>
    <h1>Get found by the people already searching for you</h1>
    <p class="shero__sub">SEO for Australian small businesses — technical foundations, search-led
    content and authority that compounds. Senior strategists, your own accounts, no lock-in.</p>
    <div class="shero__cta">
      <a class="btn--pill" href="''' + CAL + '''">Book a free SEO review ''' + ARROW + '''</a>
      <a class="shero__ghost" href="#what-we-do">What&rsquo;s included</a>
    </div>
  </div>
</section>

<!-- ══ value props ══════════════════════════════════════════════════════ -->
<section class="band" style="background:#120726">
  <div class="wrap">
    <div class="vps rv">
''' + propcards + '''    </div>
  </div>
</section>

<!-- ══ what SEO does ════════════════════════════════════════════════════ -->
<section class="band band--paper" id="what-we-do">
  <div class="wrap">
    <div class="head rv" style="max-width:60ch;margin-bottom:clamp(32px,3.6vw,48px)">
      <p class="slash">What SEO does</p>
      <h2 class="h2">How we grow your organic search.</h2>
    </div>
''' + rowhtml + '''  </div>
</section>

<!-- ══ process ══════════════════════════════════════════════════════════ -->
<section class="band" style="background:var(--ink)">
  <div class="wrap">
    <div class="head rv" style="max-width:56ch;margin-bottom:clamp(32px,3.6vw,48px)">
      <p class="slash">Our process</p>
      <h2 class="h2" style="color:#fff">How an SEO campaign runs.</h2>
    </div>
    <div class="rv">
      <div class="psteps">
''' + stephtml + '''      </div>
    </div>
  </div>
</section>

<!-- ══ FAQs ═════════════════════════════════════════════════════════════ -->
<section class="band band--paper" id="faqs">
  <div class="wrap">
    <div class="head rv" style="max-width:56ch;margin-bottom:clamp(30px,3.4vw,44px)">
      <p class="slash">FAQs</p>
      <h2 class="h2">Questions clients ask about SEO.</h2>
    </div>
    <div class="faqs rv">
''' + faqhtml + '''    </div>
  </div>
</section>

<!-- ══ related services ═════════════════════════════════════════════════ -->
<section class="band" style="background:var(--ink)">
  <div class="wrap">
    <div class="head rv" style="max-width:56ch;margin-bottom:clamp(30px,3.4vw,44px)">
      <p class="slash">Related services</p>
      <h2 class="h2" style="color:#fff">What SEO works best alongside.</h2>
    </div>
    <div class="rels rv">
''' + relhtml + '''    </div>
  </div>
</section>

<!-- ══ final cta ════════════════════════════════════════════════════════ -->
<section class="disco" id="contact">
  <div class="wrap disco__wrap">
    <svg class="disco__checks" viewBox="0 0 100 100" aria-hidden="true">
      <g fill="#D7F24C">
        <rect x="0" y="0" width="25" height="25"/><rect x="50" y="0" width="25" height="25"/>
        <rect x="25" y="25" width="25" height="25"/><rect x="75" y="25" width="25" height="25"/>
        <rect x="0" y="50" width="25" height="25"/><rect x="50" y="50" width="25" height="25"/>
        <rect x="25" y="75" width="25" height="25"/>
      </g>
    </svg>
    <svg class="disco__arrow" viewBox="0 0 100 100" aria-hidden="true" fill="none"
      stroke="#D7F24C" stroke-width="19" stroke-linecap="butt">
      <path d="M20 80 76 24"/><path d="M44 18h38v38"/>
    </svg>
    <div class="disco__card rv">
      <div class="disco__copy">
        <h2>Book your free SEO review.</h2>
        <p>We&rsquo;ll look at where you rank now, what&rsquo;s holding the site back and which terms are
        worth going after first. <em class="disco__em">No obligation either way.</em></p>
        <a class="btn--pill disco__cta" href="''' + CAL + '''">Book your free call ''' + ARROW + '''</a>
      </div>
      <div class="book">
        <span class="book__face">
          <img src="''' + imgs["ollie"] + '''" alt="Oliver Wales, Head of Growth at DUNK" loading="lazy">
          <span class="book__live" aria-hidden="true"></span>
        </span>
        <p class="book__who">Oliver Wales</p>
        <p class="book__role">Head of Growth &middot; DUNK</p>
        <p class="book__note">You&rsquo;ll be talking to Oliver. Pick a time and it drops straight into his calendar.</p>
        <a class="book__slot" href="''' + CAL + '''">
          <span class="book__dot" aria-hidden="true"></span>
          <span class="book__slotbody">
            <b>SEO Review (virtual)</b>
            <small>Where you rank, what&rsquo;s blocking you, what we&rsquo;d fix first.</small>
          </span>
          <span class="book__chev" aria-hidden="true">&#9654;</span>
        </a>
        <span class="book__days"><b>Mon</b><b>Tue</b><b>Wed</b><b>Thu</b><b class="is-off">Fri</b></span>
        <p class="book__tz">Melbourne time &middot; AEST</p>
      </div>
    </div>
  </div>
</section>

''' + foot + script

out=pathlib.Path("/home/user/clients/dunk-site/services/seo.html")
out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(page,encoding="utf-8")
print("written:",out,round(out.stat().st_size/1024,1),"KB")
