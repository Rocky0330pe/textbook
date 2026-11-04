# -*- coding: utf-8 -*-
"""熱-1・熱-2 の原稿で使った漢字を全部ぬき出し、常用漢字（2136字、joyo2136.txt）にない字を出す（組 熱W1）。
%% で始まるコメント行は除く（出典の人名などは紙面に出ない）。
使い方: python3 checks/物理第2巻/熱-1/kanji_check.py tex/p2-01.tex tex/p2-02.tex
"""
import re, sys, os
here = os.path.dirname(os.path.abspath(__file__))
joyo = set(open(os.path.join(here, 'joyo2136.txt'), encoding='utf-8').read())
for fn in sys.argv[1:]:
    used = {}
    for line in open(fn, encoding='utf-8'):
        if line.lstrip().startswith('%'):
            continue
        line = line.split('%%')[0]
        for ch in re.findall(r'[㐀-鿿豈-﫿]', line):
            used[ch] = used.get(ch, 0) + 1
    bad = sorted(c for c in used if c not in joyo)
    print('%s: 漢字 %d 種類、常用漢字にない字 %d：%s' % (fn, len(used), len(bad), ' '.join('%s(%d)' % (c, used[c]) for c in bad)))
