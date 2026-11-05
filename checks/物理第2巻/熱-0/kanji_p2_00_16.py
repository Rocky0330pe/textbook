# -*- coding: utf-8 -*-
"""熱-0・熱-16 の原稿で使った漢字を全部ぬき出し、常用漢字（2136字）にない字を表示する（組 熱W9）。
使い方：python3 -I kanji_p2_00_16.py <joyo2136.txt> tex/p2-00.tex tex/p2-16.tex
  joyo2136.txt は checks/物理第2巻/熱-1/joyo2136.txt（熱W1 が作った表）。コメント行（% から先）は数えない。原稿は書きかえない。
"""
import re, sys
joyo = set(open(sys.argv[1], encoding='utf-8').read().strip())
joyo = {c for c in joyo if not c.isspace()}
assert len(joyo) == 2136, len(joyo)
for fn in sys.argv[2:]:
    used = {}
    for i, line in enumerate(open(fn, encoding='utf-8'), 1):
        body = re.sub(r'(?<!\\)%.*', '', line)
        for ch in body:
            if '一' <= ch <= '鿿' or '㐀' <= ch <= '䶿':
                used.setdefault(ch, []).append(i)
    bad = {c: ls for c, ls in used.items() if c not in joyo}
    print('=====', fn)
    print('使った漢字の数：', len(used))
    print('常用漢字にない字：', len(bad))
    for c, ls in sorted(bad.items()):
        print('  ', c, '行', ls[:10])
