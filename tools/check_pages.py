#!/usr/bin/env python3
"""第n巻の章・巻末の開始ページが、もくじ（series.py の計画）と合っているかを調べる。
使い方: check_pages.py 5   （tex/vol5.log と tex/vol5-toc.tex を読む）
        check_pages.py p1  （第13回：物理シリーズ第1巻。tex/ph1.log と tex/ph1-toc.tex を読む）"""
import re, sys, os
n = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
tex = os.path.join(here, '..', 'tex')
# 第13回編集委員会（物理第1巻）：「p1」で物理シリーズ第1巻（tex/ph1-toc.tex の \phtocchap・\phgi と tex/ph1.log の BKPAGE を照らす）
if n.startswith('p'):
    pv = n[1:]
    toc = open(os.path.join(tex, 'ph%s-toc.tex' % pv), encoding='utf-8').read()
    plan = []
    for l in toc.splitlines():
        m = re.match(r'\\phtocchap\{([^}]*)\}.*\{(\d+)\}\{[CJRE]\}\s*$', l)
        if m: plan.append((m.group(1), int(m.group(2))))
    for nm, pg in re.findall(r'\\phgi\{((?:[^{}]|\{[^{}]*\})*)\}\{(\d+)\}', toc):
        plan.append((re.sub(r'\\mbox\{([^}]*)\}', r'\1', nm), int(pg)))
    log = open(os.path.join(tex, 'ph%s.log' % pv), encoding='utf-8', errors='replace').read().replace('\n', '')
    actual = {}
    for kind, name, pg in re.findall(r'BKPAGE (chap|back|front) (\S+) (\d+)', log):
        actual[name] = int(pg)
    missing = set(re.findall(r'BKPAGE missing p%s-(\d+)' % pv, log))
    bad = 0; nmiss = 0
    for name, pg in plan:
        a = actual.get(name)
        if a is None and re.match(r'.-\d+$', name) and ('%02d' % int(name.split('-')[1])) in missing:
            nmiss += 1
            print('%-24s 計画 %3d  実際 （まだない章）' % (name, pg)); continue
        flag = 'OK' if a == pg else 'NG'
        if a != pg: bad += 1
        print('%-24s 計画 %3d  実際 %s  %s' % (name, pg, a, flag))
    print('ずれ:', bad, '（まだない章: %d）' % nmiss)
    sys.exit(0)
plan = {}
for l in open(os.path.join(tex, 'vol%s-toc.tex' % n), encoding='utf-8'):
    m = re.match(r'\\bktocchap\{([^}]*)\}.*\{(\d+)\}\{[CJRE]\}\s*$', l)
    if m: plan[m.group(1)] = int(m.group(2))
m = re.search(r'\\bktocback(?:s|list)(.*)$', open(os.path.join(tex, 'vol%s-toc.tex' % n), encoding='utf-8').read(), re.M)
backs = re.findall(r'\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{(\d+)\}', m.group(1)) if m else []
log = open(os.path.join(tex, 'vol%s.log' % n), encoding='utf-8', errors='replace').read().replace('\n', '')
actual = {}
for kind, name, pg in re.findall(r'BKPAGE (chap|back) (\S+) (\d+)', log):
    actual[name] = int(pg)
bad = 0
for cid, pg in plan.items():
    a = actual.get(cid)
    flag = 'OK' if a == pg else 'NG'
    if a != pg: bad += 1
    print('%-6s 計画 %3d  実際 %s  %s' % (cid, pg, a, flag))
for name, pg in backs:
    key = re.sub(r'\\R\{([^}]*)\}\{[^}]*\}', r'\1', name)
    a = actual.get(key) or actual.get({'こたえ': 'こたえ', '記号カード': '記号カード', 'よく使う定数と単位': 'よく使う定数と単位', 'さくいん': 'さくいん'}.get(key, key))
    if a != int(pg): bad += 1
    print('%-10s 計画 %3s  実際 %s  %s' % (key, pg, a, 'OK' if a == int(pg) else 'NG'))
print('ずれ:', bad)
