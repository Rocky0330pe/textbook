#!/usr/bin/env python3
"""ルビのつけ忘れを表示する（\\R{親字}{よみ} の外にある漢字を探す）
使い方: python3 check_ruby.py ファイル...   ※ % 以降のコメントは無視。
大人向けで意図的にルビを外した行は、行末に「% noruby」と書くと飛ばす。"""
import re, sys
R = re.compile(r'\\R\{[^{}]*\}\{[^{}]*\}')
KANJI = re.compile(r'[\u4e00-\u9fff\u3400-\u4dbf々]')
total = 0
for fn in sys.argv[1:]:
    for i, line in enumerate(open(fn, encoding='utf-8'), 1):
        if 'noruby' in line:
            continue
        body = re.sub(r'(?<!\\)%.*', '', line)
        body = R.sub('', body)
        body = re.sub(r'\\[a-zA-Z@]+', '', body)   # 命令名
        found = KANJI.findall(body)
        if found:
            total += 1
            print(f"{fn}:{i}: {''.join(found)}  | {line.strip()[:90]}")
print("OK" if total == 0 else f"{total} 行にルビのない漢字があります")
