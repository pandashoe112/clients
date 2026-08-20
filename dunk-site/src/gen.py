import io, json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
def here(*p): return os.path.join(HERE, *p)

A = json.load(io.open(here('assets.json')))
imgs = [i['uri'] for i in A['images']]
logo = io.open(here('logo.svg')).read()
body = ''.join(io.open(here('body%d.html' % n), encoding='utf-8').read() for n in (1, 2, 3))

# ── the two team marquees ────────────────────────────────────────────────
PEOPLE = [
 (0,'Oliver Wales','Head of Growth'), (1,'Sarah Chen','Paid Search Lead'),
 (2,'Liam Johnson','SEO Strategist'), (3,'Emily Nguyen','Meta &amp; Creative'),
 (8,'Michael Brown','Analytics'),     (16,'Priya Raman','Digital PR'),
 (18,'James Field','Landing Pages'),  (19,'Olivia Martinez','Content Lead'),
 (20,'Scott Ramirez','Link Building'),(21,'Ella Novak','Client Strategy'),
]
def person(i, name, role):
    return ('<span class="person"><img src="%s" alt="">'
            '<span><b>%s</b><span>%s</span></span></span>') % (imgs[i], name, role)
row_a = ''.join(person(*p) for p in PEOPLE)
row_b = ''.join(person(*p) for p in PEOPLE[5:] + PEOPLE[:5])
body = body.replace('{{PEOPLE_A}}', row_a * 2).replace('{{PEOPLE_B}}', row_b * 2)

# ── integration rail ─────────────────────────────────────────────────────
TOOLS = [
 'M4 4l6.6 15 2.2-5.6L18 11z',                                                  # ads cursor
 'M12 3v18M3 12h18',                                                            # plus / grid
 'M4 19h16M7 15V9M12 15V5M17 15v-4',                                            # analytics bars
 'M3 17.5 8.5 11l3.6 3.4L20 6M15 6h5v5',                                        # trend
 'M5 6h14l-1.6 12H6.6zM9 6V4.5a3 3 0 0 1 6 0V6',                                # cart
 'M12 4.5 19 8v5.4c0 4-2.9 7-7 8.1-4.1-1.1-7-4.1-7-8.1V8z',                     # shield
 'M4 6h16v12H4zM4 9h16',                                                        # inbox
 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.6 2.4 4 5.6 4 9s-1.4 6.6-4 9c-2.6-2.4-4-5.6-4-9s1.4-6.6 4-9z',  # globe
 'M8 4v16M16 4v16M4 9h16M4 15h16',                                              # sheet
 'M12 5v14M6 9l6-5 6 5M6 15l6 5 6-5',                                           # sync
 'M9.5 14.5 5 19M14.5 9.5 19 5M8 5l3-3 11 11-3 3M2 13l3-3 11 11-3 3',            # link
 'M5 12h4l2.5-6 3 12L17 12h2',                                                   # pulse
]
cell = ('<span class="rail__cell"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'
        '<path d="%s" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" '
        'stroke-linejoin="round"/></svg></span>')
body = body.replace('{{TOOLS}}', ''.join(cell % d for d in TOOLS) * 2)

body = body.replace('{{LOGO}}', logo)
for n, uri in enumerate(imgs):
    body = body.replace('{{IMG%d}}' % n, uri)
left = re.findall(r'\{\{[A-Z0-9_]+\}\}', body)
assert not left, 'unsubstituted: %s' % set(left)

page = ('<!doctype html>\n<html lang="en-AU">\n<head>\n<meta charset="utf-8">\n'
 '<meta name="viewport" content="width=device-width,initial-scale=1">\n'
 '<title>DUNK Growth Agency</title>\n'
 '<meta name="description" content="Tell DUNK the goal and we work out whether that’s search, '
 'paid or content, then run it. A senior Melbourne team, your own accounts, no lock-in.">\n'
 '<meta name="theme-color" content="#010104">\n'
 '<style>\n' + '\n'.join(A['fonts']) + '\n\n'
 + io.open(here('style.css'), encoding='utf-8').read() + '</style>\n</head>\n<body>\n'
 + body + '\n<script>\n' + io.open(here('app.js'), encoding='utf-8').read() + '\n</script>\n</body>\n</html>\n')
io.open(here(os.pardir, 'index.html'), 'w', encoding='utf-8').write(page)
print('built %.1f KB' % (len(page.encode()) / 1024))
