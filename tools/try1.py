#!/usr/bin/env python3
"""第1巻の1つの章だけを、本と同じページ番号・同じ部の設定で試し組みする（第5回編集委員会）。
使い方:  python3 tools/try1.py 5 [画像を書き出すフォルダ]
  → tex/try1-05.tex を作って lualatex を2回まわし、
    章の始まりと終わりのページ、エラー、はみ出し（Overfull）を表示する。
    フォルダを指定すると、章の10ページを見開きで並べた画像 try1-05.png と、
    1ページずつの画像（try1-05-p46.png など、150dpi）を書き出す。
    最後のページには、この章で集めた「こたえ」も組む（ページ数には数えない）。
"""
import os, re, subprocess, sys, glob
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
sys.path.insert(0, root)
import series as S

n = int(sys.argv[1])
outdir = sys.argv[2] if len(sys.argv) > 2 else None
v = S.VOLS[0]
out, back, total = S.layout(v)
start = None; part = None; partno = 0; partname = ''
for o in out:
    if o[0] == 'part':
        partno += 1; partlabel = o[1]; partname = o[2]
    else:
        if o[1][0] == '1-%d' % n:
            start = o[2]; part = (partno, partname)
            break
if start is None:
    sys.exit('章 1-%d が見つかりません' % n)
pages = S.chap_pages(1, 'J' if n == 0 else 'C', 1)
tex = os.path.join(root, 'tex')
job = 'try1-%02d' % n
partdef = (r"\gdef\bk@partlabel{\R{第}{だい}%d\R{部}{ぶ}}\gdef\bk@partname{%s}\gdef\bk@tabpos{%d}" % (part[0], part[1], part[0])) if part[0] else \
          r"\gdef\bk@partlabel{\R{第}{だい}1\R{巻}{かん}}\gdef\bk@partname{かぞえる・はかる}\gdef\bk@tabpos{0}"
src = r"""%% 試し組み（tools/try1.py が作る。消してよい）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=1]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage{bk-volume}
\usepackage{bk-pict1}
\input{bk-motifs}
\input{series-data}
\input{vol1-meta}
\begin{document}
\begingroup\bkvolonebody
\makeatletter %(partdef)s\global\bk@decotrue\bkfolio{true}\makeatother
\setcounter{page}{%(start)d}
\input{ch1-%(nn)02d}
\clearpage\typeout{BKPAGE end \thepage}
\bkAnswerPages
\endgroup
\end{document}
""" % dict(partdef=partdef, start=start, nn=n)
open(os.path.join(tex, job + '.tex'), 'w', encoding='utf-8').write(src)
# 第11回：tryv.py と同じく、同時に組むのは2つまで（ロックの席を2つ用意して、空くまで待つ）
import fcntl, time
def _slot():
    while True:
        for k in range(2):
            fh = open('/tmp/bk-lualatex-slot%d.lock' % k, 'w')
            try:
                fcntl.flock(fh, fcntl.LOCK_EX | fcntl.LOCK_NB)
                return fh
            except OSError:
                fh.close()
        time.sleep(2)
_fh = _slot()
for i in range(2):
    r = subprocess.run(['timeout', '600', 'lualatex', '-interaction=nonstopmode', job + '.tex'], cwd=tex,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if r.returncode in (137, -9):
        print('注意：lualatex がメモリ不足で止められました。もう一度実行してください。')
_fh.close()
log = open(os.path.join(tex, job + '.log'), encoding='utf-8', errors='replace').read()
errs = re.findall(r'^! .*', log, re.M)
logj = log.replace('\n', '')
st = re.search(r'BKPAGE chap 1-%d (\d+)' % n, logj)
en = re.search(r'BKPAGE end (\d+)', logj)
over = re.findall(r'Overfull \\hbox \(([\d.]+)pt too wide\)', log)
bad_over = [o for o in over if float(o) > 1.7]
print('章 1-%d  計画: p.%d から %dページ（次の章は p.%d）' % (n, start, pages, start + pages))
print('実際: はじまり p.%s、 次のページ p.%s' % (st.group(1) if st else '?', en.group(1) if en else '?'))
# 第11回：ページ制限なし。偶数ページなら OK（奇数なら本ではメモのページが1枚入る）
plen = (int(en.group(1)) - int(st.group(1))) if st and en else None
print('ページ数:', '?' if plen is None else ('%d（偶数 OK。もとの計画は %d）' % (plen, pages) if plen % 2 == 0 else '%d（奇数。本ではメモのページが1枚入る。できれば内容をふやして偶数に）' % plen))
print('エラー:', len(errs), *errs[:5], sep='\n  ' if errs else ' ')
print('はみ出し（1.7pt超）:', len(bad_over), bad_over[:8])
und = re.findall(r"Reference `([^']*)' on page \d+ undefined", log)
if und: print('未定義の参照:', sorted(set(und)))
if outdir:
    os.makedirs(outdir, exist_ok=True)
    pdf = os.path.join(tex, job + '.pdf')
    first = 1; last = plen if plen else pages
    tmp = os.path.join(outdir, job + '-tmp')
    os.makedirs(tmp, exist_ok=True)
    subprocess.run(['pdftoppm', '-r', '150', '-png', '-f', str(first), '-l', str(last), pdf, os.path.join(tmp, 'p')], check=True)
    files = sorted(glob.glob(os.path.join(tmp, 'p-*.png')), key=lambda f: int(re.search(r'-(\d+)\.png$', f).group(1)))
    for i, f in enumerate(files):
        os.replace(f, os.path.join(outdir, '%s-p%d.png' % (job, start + i)))
    singles = [os.path.join(outdir, '%s-p%d.png' % (job, start + i)) for i in range(len(files))]
    subprocess.run(['montage'] + singles + ['-resize', '25%', '-tile', '%dx' % min(len(singles), 10), '-geometry', '+3+3',
                    '-background', 'gray70', os.path.join(outdir, job + '.png')], check=True)
    # こたえのページ（章の後ろ）
    subprocess.run(['pdftoppm', '-r', '110', '-png', '-f', str(last + 1), '-l', str(last + 1), pdf, os.path.join(tmp, 'a')])
    for f in glob.glob(os.path.join(tmp, 'a-*.png')):
        os.replace(f, os.path.join(outdir, job + '-kotae.png'))
    os.rmdir(tmp)
    print('画像:', os.path.join(outdir, job + '.png'), '（1ページずつは', singles[0], 'など。こたえは', os.path.join(outdir, job + '-kotae.png') + '）')
