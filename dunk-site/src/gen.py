import io, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
def here(*p): return os.path.join(HERE, *p)

A = json.load(io.open(os.path.join(HERE, 'assets.json')))
imgs = [i['uri'] for i in A['images']]
logo = io.open(here('logo.svg')).read()
css  = io.open(here('style.css')).read()
js   = io.open(here('app.js')).read()
body = ''.join(io.open(here('body%d.html' % n), encoding='utf-8').read() for n in (1, 2, 3))

REVIEWS = [
 ("I absolutely love working with DUNK. The results have been amazing — we have doubled our online revenue since being with these guys.", "Alana", "Marttini By Lana"),
 ("DUNK have been managing our ads for 2 years. The staff are friendly and go the extra mile to help with creative ideas.", "Karen R.", "Wax Obsession"),
 ("DUNK have been instrumental for our company. In a relatively short period they have delivered great results in both SEO and Google Ads.", "Mia", "BISSELL Australia"),
 ("We worked with DUNK for several years and they are an excellent, results driven agency.", "Matt L.", "Yellow Octopus"),
 ("Their understanding of the market is exceptional. We cannot wait to see what the future holds.", "Dean B.", "Approved Electrix"),
 ("From the very beginning the team was professional, proactive, and genuinely invested in helping our business succeed.", "Matt B.", "Pestline Australia"),
]
card = ('<figure class="rev"><div class="rev__stars" aria-label="5 out of 5">★★★★★</div>'
        '<blockquote>“%s”</blockquote>'
        '<figcaption><b>%s</b><span>%s</span></figcaption></figure>')
# doubled so the marquee loops seamlessly at translateX(-50%)
body = body.replace('{{REVIEWS}}', ''.join(card % r for r in REVIEWS * 2))

body = body.replace('{{LOGO}}', logo)
for n, uri in enumerate(imgs):
    body = body.replace('{{IMG%d}}' % n, uri)
leftover = re.findall(r'\{\{[A-Z0-9]+\}\}', body)
assert not leftover, 'unsubstituted: %s' % set(leftover)

page = (
 '<!doctype html>\n<html lang="en-AU">\n<head>\n'
 '<meta charset="utf-8">\n'
 '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
 '<title>DUNK Growth Agency</title>\n'
 '<meta name="description" content="You tell DUNK the goal; we work out whether that’s search, paid or content, then run it. A senior Melbourne team, your own accounts, no lock-in.">\n'
 '<meta name="theme-color" content="#0A0512">\n'
 '<style>\n' + '\n'.join(A['fonts']) + '\n\n' + css + '</style>\n'
 '</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n'
)
io.open(here(os.pardir, 'index.html'), 'w', encoding='utf-8').write(page)
print('built %.1f KB' % (len(page.encode()) / 1024))
