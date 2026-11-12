# -*- coding: utf-8 -*-
r"""物理第5巻『原子』の巻末「つぎの巻へ」の表（tex/ph5-nextuse.tex）を作る（前付・巻末の組、第31回）。
第5巻はシリーズの最後の巻なので、tools/mknext.py p5（後ろの巻の章を集める）では行が0になる。
かわりに、各章の「工学の駅」（\phstation{科目}{ことば}）の科目を集め、「この巻の道具を、この先の工学の科目でこう使う」の表にする。
使い方: python3 -I checks/物理第5巻/巻末/mknext_p5.py   → tex/ph5-nextuse.tex
"""
import glob, os, re, sys
root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
sys.path.insert(0, os.path.join(root, 'phys'))
import series_phys as P
title = {}
for v in P.VOLS:
    for part in v['parts']:
        for c in part[3]:
            title[c[0]] = c[1]
rows = []
for f in sorted(glob.glob(os.path.join(root, 'tex', 'p5-*.tex'))):
    if not re.match(r'p5-(\d\d)\.tex$', os.path.basename(f)):
        continue
    s = open(f, encoding='utf-8').read()
    cm = re.search(r'\\phchapter(?:\[[^\]]*\])?\{(\d+)\}', s)
    st = re.search(r'\\phstation\{([^}]*)\}\{([^}]*)\}', s)
    if not cm or not st:
        continue
    cid = '原-%s' % cm.group(1)
    subjects = [x.strip() for x in st.group(1).split(',') if x.strip()]
    rows.append((int(cm.group(1)), cid, subjects))
rows.sort()
out = [r"%% 自動生成（checks/物理第5巻/巻末/mknext_p5.py）。各章の「工学の駅」（\phstation）の科目を集めたもの。第5巻はシリーズの最後の巻なので、後ろの巻の章のかわりに、この先の工学の科目を並べる",
       r"\begin{longtblr}{colspec={Q[l,m,wd=62mm] X[l,m]}, width=\linewidth, rowhead=1, row{1}={bg=bkVol!14, font=\sffamily\bfseries\footnotesize},",
       r"  hlines={0.4pt,bkLine}, rowsep=1.5pt, cells={font=\footnotesize}}",
       r"この巻の章 & この道具を使う工学の科目 \\"]
for _, cid, subj in rows:
    out.append(r"{\bknextpill{%s}\ %s} & %s \\" % (cid, title.get(cid, ''), '・'.join(subj)))
out.append(r"\end{longtblr}")
open(os.path.join(root, 'tex', 'ph5-nextuse.tex'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(len(rows), 'rows')
