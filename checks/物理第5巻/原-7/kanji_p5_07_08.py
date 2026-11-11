# -*- coding: utf-8 -*-
"""章の原稿で使った漢字をぬき出し、常用漢字（2010年の2136字、joyo.txt）にない字を表示する。
使い方：python3 kanji_p5_07_08.py ../../../tex/p5-07.tex ../../../tex/p5-08.tex [ほかのファイル…]
コメント（% のあと）は数えない。"""
import os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
joyo = set(c for c in open(os.path.join(here, "joyo.txt"), encoding="utf-8").read() if "一" <= c <= "鿿")
joyo |= set("々")
for path in sys.argv[1:]:
    used = {}
    for line in open(path, encoding="utf-8"):
        line = re.sub(r"(?<!\\)%.*", "", line)
        for c in line:
            if "一" <= c <= "鿿" or "㐀" <= c <= "䶿":
                used[c] = used.get(c, 0) + 1
    bad = sorted(c for c in used if c not in joyo)
    print(f"{os.path.basename(path)}：使った漢字 {len(used)} 字、常用漢字にない字 {len(bad)}：{''.join(bad)}")
