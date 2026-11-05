# -*- coding: utf-8 -*-
"""章の原稿で使った漢字を全部ぬき出し、常用漢字（2010年の2136字）にない字を表示する（組 熱W5。熱-8・熱-9 で使う）。

使い方：python3 -I kanji_check.py <kanji.json> tex/p2-08.tex [tex/p2-09.tex ...]
  kanji.json：https://github.com/davidluzgouveia/kanji-data の kanji.json（KANJIDIC をもとにした表。grade 1〜6 が教育漢字、8 がそのほかの常用漢字）。
  コメント行（% から先）は数えない。原稿は書きかえない（機械の置きかえはしない。第21回 K-19）。
"""
import json, re, sys
d = json.load(open(sys.argv[1], encoding='utf-8'))
joyo = {k for k, v in d.items() if v.get('grade') and v['grade'] <= 8}
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
