#!/usr/bin/env python3
"""行の終わりに「＝」「＋」「−」「×」「≈」「→」「<」が残っている行を探す（第6回編集委員会）。
使い方:  python3 tools/eqend.py tex/tryv-5-07.pdf 90
  2つめの引数は、PDF の1ページめのノンブル（tryv の PDF なら章の始まりのページ。本の PDF なら -2 など）。
  本文の右端（奇数ページは小口側…）まで 8 mm 以内で終わり、記号で終わる行を出す。
"""
import re, subprocess, sys
pdf = sys.argv[1]
first = int(sys.argv[2]) if len(sys.argv) > 2 else 1
mm = 72 / 25.4
html = subprocess.run(['pdftotext', '-bbox-layout', pdf, '-'], capture_output=True, text=True).stdout
pages = html.split('<page ')[1:]
n = 0
for i, pg in enumerate(pages):
    folio = first + i
    # 版面：奇数ページ（右）は左 22mm・右 160mm？ 本の設定に合わせて、左右どちらでも 140mm 幅
    m = re.search(r'width="([\d.]+)"', pg)
    W = float(m.group(1)) if m else 515.9
    left = 20 * mm if folio % 2 == 1 else 18 * mm
    R = left + 140 * mm
    for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>', pg, re.S):
        x1 = float(m.group(3))
        t = ''.join(re.findall(r'>([^<]*)</word>', m.group(5)))
        if len(t) < 4:
            continue
        if t.endswith(('=', '＝', '+', '＋', '−', '－', '×', '÷', '≈', '→', '<', '＜')) and (R - x1) / mm < 8:
            print('p.%d  …%s' % (folio, t[-40:])); n += 1
print('行末が記号の行:', n)
