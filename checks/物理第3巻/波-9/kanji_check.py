#!/usr/bin/env python3
"""章の原稿（%% のコメントを除く）で使った漢字を全部ぬき出し、常用漢字（2136字）にない字を表示する。
python3 checks/物理第3巻/波-9/kanji_check.py tex/p3-09.tex tex/p3-10.tex
"""
import os
import sys

here = os.path.dirname(os.path.abspath(__file__))
joyo = set(open(os.path.join(here, '..', '..', '物理第2巻', '熱-1', 'joyo2136.txt'), encoding='utf-8').read())
for path in sys.argv[1:]:
    text = ''.join(l.split('%%')[0] for l in open(path, encoding='utf-8'))
    kan = sorted(set(c for c in text if '一' <= c <= '鿿'))
    bad = [c for c in kan if c not in joyo]
    print(path, '漢字', len(kan), '字。常用漢字にない字:', ''.join(bad) if bad else 'なし')
    for c in bad:
        for k, line in enumerate(open(path, encoding='utf-8'), 1):
            if c in line.split('%%')[0]:
                i = line.index(c)
                print('  ', c, k, line[max(0, i - 12):i + 12].strip())
                break
