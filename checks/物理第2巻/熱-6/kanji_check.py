# -*- coding: utf-8 -*-
"""章の原稿に、常用漢字（2136字）にない漢字がないかを調べる（置きかえはしない。見るだけ）。
常用漢字の表 joyo2136.txt は、kanji-data（github.com/davidluzgouveia/kanji-data）の grade 1〜8 から作った（2136字）。
使い方: python3 kanji_check.py ../../../tex/p2-06.tex
"""
import re, sys, os
here = os.path.dirname(os.path.abspath(__file__))
joyo = set(open(os.path.join(here, 'joyo2136.txt'), encoding='utf-8').read().strip())
assert len(joyo) == 2136, len(joyo)
for f in sys.argv[1:]:
    used = {}
    for n, line in enumerate(open(f, encoding='utf-8'), 1):
        body = line.split('%%')[0]
        for c in body:
            if '一' <= c <= '鿿' or '㐀' <= c <= '䶿':
                used.setdefault(c, n)
    bad = sorted((c, n) for c, n in used.items() if c not in joyo)
    print(f, '使った漢字', len(used), '字。常用漢字にない字：', len(bad))
    for c, n in bad:
        print('  ', c, '（はじめは', n, '行め）')
