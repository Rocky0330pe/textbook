#!/usr/bin/env python3
"""第n巻の各章の「ふりかえり」のチェック項目を集めて、巻末の「できるようになったことチェック表」を作る。
使い方: python3 mkchecklist.py 5   → tex/ch5-checklist.tex"""
import re, sys, os, glob
n = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
tex = os.path.join(here, '..', 'tex')
# 第13回編集委員会（物理第1巻）：「p1」で物理シリーズ第1巻（tex/p1-NN.tex の \phchapter と、ふりかえりの \bkfurref）→ tex/ph1-checklist.tex
if n.startswith('p'):
    pv = int(n[1:])
    key = '力熱波電原'[pv - 1]
    rows = []
    for f in sorted(glob.glob(os.path.join(tex, 'p%d-*.tex' % pv))):
        if not re.match(r'p%d-(\d\d)\.tex$' % pv, os.path.basename(f)): continue   # 見本の p1-sample.tex は数えない
        s = open(f, encoding='utf-8').read()
        cm = re.search(r'\\phchapter(?:\[[^\]]*\])?\{(\d+)\}', s)
        blk = re.search(r'\\begin\{checklist\}(.*?)\\end\{checklist\}', s, re.S)
        if not cm or not blk: continue
        cid = '%s-%s' % (key, cm.group(1))
        items = re.findall(r'\\item\s+(.*?)\\bkfurref\{([^}]*)\}', blk.group(1), re.S)
        for i, (txt, lab) in enumerate(items):
            rows.append((cid if i == 0 else '', txt.strip(), lab))
    out = [r"%% 自動生成（tools/mkchecklist.py %s）。各章の「ふりかえり」の項目を集めたもの（第13回）" % n,
           r"\begingroup\footnotesize",
           r"\def\bkcb{\tikz[baseline=-0.5ex]\draw[\bkTF, line width=0.7pt, rounded corners=0.5pt] (0,-0.3em) rectangle (0.8em,0.5em);}",
           r"\begin{longtblr}{colspec={Q[c,m,wd=11mm] X[l,m] Q[c,m,wd=10mm] Q[c,m,wd=9mm] Q[c,m,wd=9mm]}, width=\linewidth, rowhead=1, colsep=3pt,",
           r"  row{1}={bg=bkVol!14, font=\sffamily\bfseries\scriptsize}, hlines={0.4pt,bkLine}, rowsep=0.7pt}",
           r"章 & できるようになったこと & ページ & 1回め & 2回め \\"]
    for cid, txt, lab in rows:
        txt = txt.replace(r"\dfrac", r"\tfrac")
        c1 = (r"{\sffamily\bfseries\color{\bkTT}%s}" % cid) if cid else ''
        out.append(r"%s & %s & \pageref{%s} & \bkcb & \bkcb \\" % (c1, txt, lab))
    if not rows:
        out.append(r"― & （章ができたら、各章のふりかえりから自動で作る） & ― & \bkcb & \bkcb \\")
    out += [r"\end{longtblr}", r"\endgroup"]
    open(os.path.join(tex, 'ph%d-checklist.tex' % pv), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    print(len(rows), 'rows')
    sys.exit(0)
rows = []
for f in sorted(glob.glob(os.path.join(tex, 'ch%s-*.tex' % n))):
    m = re.match(r'ch%s-(\d\d)\.tex$' % n, os.path.basename(f))   # 第7回：見本の ch2-3.tex（1けた）は数えない
    if not m: continue
    s = open(f, encoding='utf-8').read()
    cm = re.search(r'\\bkchapter\{%s\}\{(\d+)\}\{(.*?)\}\{' % n, s)
    blk = re.search(r'\\begin\{checklist\}(.*?)\\end\{checklist\}', s, re.S)
    if not cm or not blk: continue
    cid = '%s-%s' % (n, cm.group(1))
    # 第7回：「\\unskip\\nobreak\\hfill…\\mbox{→\\pageref…}」の形（2-3・2-4）も読む
    # 第12回：\\bkfurref{ラベル} の形も読む
    items = re.findall(r'\\item\s+(.*?)(?:\\hfill.*?\\pageref|\\bkfurref)\{([^}]*)\}', blk.group(1), re.S)
    items = [(re.sub(r'(\\unskip|\\nobreak)+\s*$', '', t.strip()), l) for t, l in items]
    for i, (txt, lab) in enumerate(items):
        rows.append((cid if i == 0 else '', txt.strip(), lab, len(items) if i == 0 else 0))
out = [r"%% 自動生成（tools/mkchecklist.py）。各章の「ふりかえり」の項目を集めたもの",
       r"\begingroup\footnotesize",
       r"\def\bkcb{\tikz[baseline=-0.5ex]\draw[\bkTF, line width=0.7pt, rounded corners=0.5pt] (0,-0.3em) rectangle (0.8em,0.5em);}",
       r"\begin{longtblr}{colspec={Q[c,m,wd=9mm] X[l,m] Q[c,m,wd=10mm] Q[c,m,wd=9mm] Q[c,m,wd=9mm]}, width=\linewidth, rowhead=1, colsep=3pt,",
       r"  row{1}={bg=bkVol!14, font=\sffamily\bfseries\scriptsize}, hlines={0.4pt,bkLine}, rowsep=%s}" % ('2.3pt' if str(n) in ('2', '3') else '0.7pt'),   # 第7回：第2・3巻はルビがあるので行を広げ、3ページにならす
       (r"\R{章}{しょう} & できるように なった こと & ページ & 1\R{回}{かい}め & 2\R{回}{かい}め \\" if str(n) == '1' else
        r"\R{章}{しょう} & できるようになったこと & ページ & 1\R{回}{かい}め & 2\R{回}{かい}め \\" if str(n) in ('2', '3') else
        r"章 & できるようになったこと & ページ & 1回め & 2回め \\")]
for cid, txt, lab, span in rows:
    txt = txt.replace(r"\dfrac", r"\tfrac")
    c1 = (r"{\sffamily\bfseries\color{\bkTT}%s}" % cid) if cid else ''
    out.append(r"%s & %s & \pageref{%s} & \bkcb & \bkcb \\" % (c1, txt, lab))
out += [r"\end{longtblr}", r"\endgroup"]
open(os.path.join(tex, 'ch%s-checklist.tex' % n), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(rows), 'rows')
