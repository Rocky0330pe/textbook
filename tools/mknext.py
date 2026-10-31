#!/usr/bin/env python3
"""第n巻の各章の道しるべ（「この章の先に」）から、次の巻より後ろの章を集めて、
巻末「つぎの巻へ」の表「この巻の道具は、この先でこう使う」を作る（第7回編集委員会）。
使い方: python3 tools/mknext.py 2   → tex/ch2-nextuse.tex"""
import re, sys, os, glob
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
# 第13回編集委員会（物理第1巻）：「p1」で物理シリーズ第1巻。各章（tex/p1-NN.tex）の道しるべ「この章の先に」から、
# 第2巻より後ろの物理の章（熱・波・電・原）を集めて tex/ph1-nextuse.tex を作る
if sys.argv[1].startswith('p'):
    pv = int(sys.argv[1][1:])
    keys = '力熱波電原'
    sys.path.insert(0, os.path.join(root, 'phys'))
    import series_phys as P
    title = {}
    for v in P.VOLS:
        for part in v['parts']:
            for c in part[3]:
                title[c[0]] = c[1]
    def pkey(c):
        k, b = c.split('-'); return (keys.index(k) if k in keys else 9, int(b))
    rows = []
    tex = os.path.join(root, 'tex')
    for f in sorted(glob.glob(os.path.join(tex, 'p%d-*.tex' % pv))):
        if not re.match(r'p%d-(\d\d)\.tex$' % pv, os.path.basename(f)): continue
        s = open(f, encoding='utf-8').read()
        cm = re.search(r'\\phchapter(?:\[[^\]]*\])?\{(\d+)\}', s)
        mm = re.search(r'\\bkmichishirube\{[^}]*\}\{([^}]*)\}', s)
        if not cm or not mm: continue
        cid = '%s-%s' % (keys[pv - 1], cm.group(1))
        later = [c.strip() for c in mm.group(1).split(',') if c.strip() and c.strip()[0] in keys and keys.index(c.strip()[0]) > pv - 1]
        later = sorted(set(later), key=pkey)
        if later:
            rows.append((cid, later))
    rows.sort(key=lambda r: pkey(r[0]))
    out = [r"%% 自動生成（tools/mknext.py %s）。各章の道しるべ「この章の先に」から、後ろの巻の章を集めたもの（第13回）" % sys.argv[1],
           r"\begin{longtblr}{colspec={Q[l,m,wd=58mm] X[l,m]}, width=\linewidth, rowhead=1, row{1}={bg=bkVol!14, font=\sffamily\bfseries\footnotesize},",
           r"  hlines={0.4pt,bkLine}, rowsep=1.5pt, cells={font=\footnotesize}}",
           r"この巻の章 & この道具を使う章 \\"]
    for cid, later in rows:
        out.append(r"{\bknextpill{%s}\ %s} & {%s} \\" % (cid, title.get(cid, ''), r"\\ ".join(r"\bknextpill{%s}\ %s" % (c, title.get(c, '')) for c in later)))
    if not rows:
        out.append(r"（章ができたら、道しるべから自動で作る） & ― \\")
    out.append(r"\end{longtblr}")
    open(os.path.join(tex, 'ph%d-nextuse.tex' % pv), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print(len(rows), 'rows')
    sys.exit(0)
n = int(sys.argv[1])
sys.path.insert(0, root)
import series as S
tex = os.path.join(root, 'tex')
title = {}
for v in S.VOLS:
    for part in v['parts']:
        for c in part[2]:
            title[c[0]] = c[1]
def chapkey(c):
    a, b = c.split('-'); return (int(a), int(b))
rows = []
for f in sorted(glob.glob(os.path.join(tex, 'ch%d-*.tex' % n))):
    m = re.match(r'ch%d-(\d\d)\.tex$' % n, os.path.basename(f))
    if not m: continue
    s = open(f, encoding='utf-8').read()
    cm = re.search(r'\\bkchapter\{%d\}\{(\d+)\}' % n, s)
    mm = re.search(r'\\bkmichishirube\{[^}]*\}\{([^}]*)\}', s)
    if not cm or not mm: continue
    cid = '%d-%s' % (n, cm.group(1))
    later = [c.strip() for c in mm.group(1).split(',') if c.strip() and int(c.split('-')[0]) > n]
    later = sorted(set(later), key=chapkey)
    if later:
        rows.append((cid, later))
rows.sort(key=lambda r: chapkey(r[0]))
def short(t):  # 「：」より前の題（長い題を短くする）
    return t
out = [r"%% 自動生成（tools/mknext.py）。各章の道しるべ「この章の先に」から、後ろの巻の章を集めたもの",
       r"\begin{longtblr}{colspec={Q[l,m,wd=58mm] X[l,m]}, width=\linewidth, rowhead=1, row{1}={bg=bkVol!14, font=\sffamily\bfseries\footnotesize},",
       r"  hlines={0.4pt,bkLine}, rowsep=1.5pt, cells={font=\footnotesize}}",
       (r"この\R{巻}{かん}の\R{章}{しょう} & この\R{道具}{どう|ぐ}を\R{使}{つか}う\R{章}{しょう} \\" if n <= 3 else r"この巻の章 & この道具を使う章 \\")]
for cid, later in rows:
    left = r"{\bknextpill{%s}\ %s}" % (cid, title.get(cid, ''))
    # 総ルビの巻（第1〜3巻）では、ルビのない巻（第4巻〜）の章の題名は出さず、章番号の札だけにする
    near = [c for c in later if n > 3 or int(c.split('-')[0]) <= 3]
    far = [c for c in later if c not in near]
    right = r"\\ ".join(r"\bknextpill{%s}\ %s" % (c, title.get(c, '')) for c in near)
    if far:
        right += (r"\\ " if near else "") + r"\R{第}{だい}4\R{巻}{かん}から\R{先}{さき}：" + r"\,".join(r"\bknextpill{%s}" % c for c in far)
    out.append(r"%s & {%s} \\" % (left, right))
out.append(r"\end{longtblr}")
open(os.path.join(tex, 'ch%d-nextuse.tex' % n), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(rows), 'rows')
