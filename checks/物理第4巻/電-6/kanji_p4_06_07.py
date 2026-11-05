# -*- coding: utf-8 -*-
"""電-6・電-7 の原稿で使った漢字をぬき出し、常用漢字（2010年の2136字、joyo.txt）にない字を表示する。
使い方：python3 kanji_p4_06_07.py（リポジトリの根からでも、このフォルダからでもよい）。コメント（% のあと）は数えない。"""
import os, re
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..', '..', '..')
joyo = set(c for c in open(os.path.join(here, "joyo.txt"), encoding="utf-8").read() if "一" <= c <= "鿿") | set("々")
for name in ("p4-06.tex", "p4-07.tex"):
    path = os.path.join(root, 'tex', name)
    if not os.path.exists(path):
        continue
    used = {}
    for line in open(path, encoding="utf-8"):
        line = re.sub(r"(?<!\\)%.*", "", line)
        for c in line:
            if "一" <= c <= "鿿" or "㐀" <= c <= "䶿":
                used[c] = used.get(c, 0) + 1
    bad = sorted(c for c in used if c not in joyo)
    print(f"{name}：使った漢字 {len(used)} 字、常用漢字にない字 {len(bad)}：{''.join(bad)}")
