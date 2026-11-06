#!/usr/bin/env python3
"""問題集の組みの確かめ：python3 mondai/build/mq_pages.py mq1
・わざの見開きが、偶数ページから始まって、ちょうど2ページ（右ページは次のページ）か
・エラー・はみ出し・未定義の参照"""
import re, sys, subprocess
name = sys.argv[1]
log = open(f'{name}.log', encoding='utf-8', errors='replace').read()
seq = re.findall(r'(MQPAGE|MQRIGHT|MQSPREAD) ?(\S*?) ?(\d+)\n', log)
bad = []
cur = None
for kind, wid, pg in seq:
    pg = int(pg)
    if kind == 'MQPAGE':
        cur = (wid, pg)
        if pg % 2: bad.append(f'{wid}: 奇数ページ {pg} から始まる')
    elif kind == 'MQSPREAD':
        cur = None
    elif cur:
        # \mqrightpage の \clearpage のあとのページ番号
        if pg != cur[1] + 1: bad.append(f'{cur[0]}: 左ページがあふれた（右ページが {pg}、始まりは {cur[1]}）')
# 見開きの終わり：次のわざ（または部の見開き・こたえ）の始まりまでが2ページか（右ページのあふれ）
starts = [(w, int(p)) for k, w, p in seq if k == 'MQPAGE']
heads = sorted([int(p) for k, w, p in seq if k in ('MQPAGE', 'MQSPREAD')])
for w, p in starts:
    nxt = [h for h in heads if h > p]
    if nxt:
        n = nxt[0]
        # 次の頭が偶数ページから始まるときは、あいだにメモのページが入ることがある（n == p+3 はメモ1枚）
        if n - p > 3 or (n - p == 3 and n % 2 == 0): bad.append(f'{w}: 右ページがあふれた（{p}〜{n - 1}）')
err = len(re.findall(r'^!', log, re.M))
ob = [float(x) for x in re.findall(r'Overfull \\hbox \(([0-9.]+)pt', log)]
obv = [float(x) for x in re.findall(r'Overfull \\vbox \(([0-9.]+)pt', log)]
und = len(re.findall(r'Reference .* undefined', log))
pages = subprocess.run(['pdfinfo', f'{name}.pdf'], capture_output=True, text=True).stdout
pages = re.search(r'Pages:\s+(\d+)', pages)
print(f'{name}: pages={pages.group(1) if pages else "?"} errors={err} overfull(>1.7pt)={sum(1 for x in ob if x > 1.7)} vbox={len(obv)} undefined={und} わざ={len(starts)}')
for b in bad: print('  NG', b)
sys.exit(1 if (bad or err) else 0)
