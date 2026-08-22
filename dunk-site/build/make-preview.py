"""Build a self-contained copy of one built page, for previewing as an Artifact.

An Artifact is served under a CSP that blocks every external host, so a page
that links /css/global.css and /img/hero.webp renders bare. This inlines the
stylesheets and folds every image back into a data URI, purely so the page can
be looked at. It is a preview tool, not part of the deploy: Netlify serves
dist/ as it is, with the files kept separate.

    python3 build/make-preview.py services/google-ads
"""
import base64
import io
import mimetypes
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(os.path.dirname(HERE), 'dist')
OUT = os.environ.get(
    'PREVIEW_DIR',
    '/tmp/claude-0/-home-user-clients/a2fe963a-9a1b-5dc9-84fa-78715153b4e7/scratchpad')


def data_uri(path):
    p = os.path.join(DIST, path.lstrip('/'))
    mime = mimetypes.guess_type(p)[0] or 'application/octet-stream'
    return 'data:%s;base64,%s' % (
        mime, base64.b64encode(io.open(p, 'rb').read()).decode())


def main(route):
    src = os.path.join(DIST, route.strip('/'), 'index.html')
    html = io.open(src, encoding='utf-8').read()

    # stylesheets first: they carry image references of their own
    def inline_css(m):
        css = io.open(os.path.join(DIST, m.group(1).lstrip('/')),
                      encoding='utf-8').read()
        return '<style>\n%s\n</style>' % css

    html = re.sub(r'<link rel="stylesheet" href="(/css/[^"]+)">', inline_css, html)

    # then every image path left anywhere in the document
    for path in sorted(set(re.findall(r'/img/[A-Za-z0-9._-]+', html)), key=len, reverse=True):
        html = html.replace(path, data_uri(path))

    # the script is a file too, and the CSP will not fetch it
    def inline_js(m):
        js = io.open(os.path.join(DIST, m.group(1).lstrip('/')), encoding='utf-8').read()
        return '<script>\n%s\n</script>' % js

    html = re.sub(r'<script[^>]*src="(/js/[^"]+)"[^>]*></script>', inline_js, html)

    assert 'href="/css' not in html and '/img/' not in html and 'src="/js' not in html

    # an Artifact supplies its own document shell, so hand it the head contents
    # and the body, without the wrapper tags
    head = html[html.index('<head>') + 6:html.index('</head>')]
    body = html[html.index('<body>') + 6:html.rindex('</body>')]
    keep = '\n'.join(m.group(0) for m in re.finditer(
        r'<title>.*?</title>|<link[^>]*>|<style>.*?</style>', head, re.S))

    name = 'dunk-%s.html' % route.strip('/').split('/')[-1]
    dest = os.path.join(OUT, name)
    io.open(dest, 'w', encoding='utf-8').write(keep + '\n' + body)
    print('%s  %d KB' % (dest, os.path.getsize(dest) / 1024))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'services/google-ads')
