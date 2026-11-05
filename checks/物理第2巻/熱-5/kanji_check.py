# -*- coding: utf-8 -*-
# 原稿に使った漢字を全部ぬき出し、常用漢字（2136字）にない字を表示する。
# 使い方: python3 kanji_check.py 常用漢字の一覧.txt tex/p2-05.tex [tex/p2-07.tex ...]
# 一覧は「常用漢字表」（平成22年内閣告示）の2136字を並べたテキスト（字のほかの文字は無視する）。
import sys, re
def kan(c): return '一' <= c <= '鿿' or c in '々〆'
joyo = set(c for c in open(sys.argv[1], encoding='utf-8').read() if kan(c))
print('一覧の字数:', len(joyo))
for f in sys.argv[2:]:
    t = open(f, encoding='utf-8').read()
    t = '\n'.join(l for l in t.split('\n') if not l.lstrip().startswith('%'))   # コメントの行は紙面に出ない
    used = sorted(set(c for c in t if kan(c)))
    bad = [c for c in used if c not in joyo]
    print(f, '使った漢字:', len(used), '常用漢字にない字:', ''.join(bad) if bad else 'なし')
    for c in bad:
        for m in re.finditer(re.escape(c), t):
            print('   ', c, t[max(0, m.start() - 12):m.end() + 12].replace('\n', ' '))
