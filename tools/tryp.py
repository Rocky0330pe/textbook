#!/usr/bin/env python3
"""第13回編集委員会（物理第1巻）：物理シリーズの章を1つだけ、本と同じページ番号・同じ部の設定で試し組みする（tools/tryv.py の物理版）。
使い方:  python3 tools/tryp.py 力-3 [画像を書き出すフォルダ] [--kotae]
         python3 tools/tryp.py 3 …           （第1巻の 力-3 と同じ）
         python3 tools/tryp.py sample …      （見本の章 tex/p1-sample.tex を 力-1 の場所で組む。本には入らない）
  → tex/tryp-p1-03.tex を作って lualatex を2回まわし、章の始まりと終わりのページ、
    エラー、はみ出し（1.7pt超の Overfull \\hbox）、ページの下へのはみ出し（Overfull \\vbox）、未定義の参照を表示する。
    フォルダを指定すると、章のページを並べた画像と、1ページずつの画像（120dpi）を書き出す。
  --kotae をつけると、章のあとにその章の「こたえ」のページも組む（ページ数には数えない。画像は …-kotae<n>.png）。
  章のファイルは tex/p1-NN.tex（力-0 が p1-00.tex）。部の柱・つめは、その章の部に合わせる。
"""
import os, re, subprocess, sys, glob, fcntl, time
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
sys.path.insert(0, os.path.join(root, 'phys'))
import series_phys as P

kotae = '--kotae' in sys.argv
argv = [a for a in sys.argv if a != '--kotae']
if len(argv) < 2:
    sys.exit(__doc__)
arg = argv[1]
outdir = argv[2] if len(argv) > 2 else None
vol = 1
key = '力熱波電原'[vol - 1]
sample = arg in ('sample', 'p1-sample')
if sample:
    cid = key + '-1'
    chfile = 'p%d-sample' % vol
    job = 'tryp-p%d-sample' % vol
else:
    m = re.match(r'^(?:%s-|p%d-)?(\d+)$' % (key, vol), arg)
    if not m:
        sys.exit('章の書き方：力-3、3、sample のどれか')
    ch = int(m.group(1))
    cid = '%s-%d' % (key, ch)
    chfile = 'p%d-%02d' % (vol, ch)
    job = 'tryp-p%d-%02d' % (vol, ch)
v = P.VOLS[vol - 1]
out, back, total = P.layout(v)
start = None; nxt = None; partno = 0
for k, o in enumerate(out):
    if o[0] == 'part':
        partno += 1
    elif o[1][0] == cid:
        start = o[2]; mypart = partno
        if k + 1 < len(out):
            nx = out[k + 1]
            nxt = nx[4] if nx[0] == 'part' else nx[2]
        else:
            nxt = back[0][1]
        break
if start is None:
    sys.exit('章 %s が見つかりません' % cid)
tex = os.path.join(root, 'tex')
if not os.path.exists(os.path.join(tex, chfile + '.tex')):
    sys.exit('tex/%s.tex がありません' % chfile)
partdef = (r"\phpartbegin{%d}" % mypart) if mypart else ""
src = r"""%% 試し組み（tools/tryp.py が作る。消してよい）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=5]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage{bk-volume}
\usepackage{bk-pict1}
\usepackage[vol=%(vol)d]{bk-phys}
\usepackage{bk-physbody}
\input{ph%(vol)d-meta}
\input{ph%(vol)d-pages}
\begin{document}
\makeatletter\global\bk@decotrue\bkfolio{true}\makeatother
%(partdef)s
\setcounter{page}{%(start)d}
\input{%(chfile)s}
\clearpage\typeout{BKPAGE end \thepage}
%(kotae)s
\end{document}
""" % dict(vol=vol, partdef=partdef, start=start, chfile=chfile,
           kotae=(r"\makeatletter\bkAnswerPages\makeatother\clearpage\typeout{BKPAGE kotaeend \thepage}" if kotae else ""))
open(os.path.join(tex, job + '.tex'), 'w', encoding='utf-8').write(src)
# 第13回：席は並んだ順にとる（チケット式。tools/bklock.py）。ロックファイルは消さない
sys.path.insert(0, here)
import bklock
_fh = bklock.take(job)
for i in range(2):
    r = subprocess.run(['timeout', '600', 'lualatex', '-interaction=nonstopmode', job + '.tex'], cwd=tex,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if r.returncode in (137, -9):
        print('注意：lualatex がメモリ不足で止められました。もう一度実行してください。')
_fh.close()
log = open(os.path.join(tex, job + '.log'), encoding='utf-8', errors='replace').read()
errs = re.findall(r'^! .*', log, re.M)
logj = log.replace('\n', '')
st = re.search(r'BKPAGE chap %s (\d+)' % re.escape(cid), logj)
en = re.search(r'BKPAGE end (\d+)', logj)
over = re.findall(r'Overfull \\hbox \(([\d.]+)pt too wide\) (?:in paragraph at lines (\d+)--\d+|detected at line (\d+)|in alignment at lines (\d+)--\d+)', log)
bad_over = ['%.1fpt@L%s' % (float(w), a or b or c) for w, a, b, c in over if float(w) > 1.7]
endpage = int(en.group(1)) if en else None
print('章 %s%s  計画: p.%d から（次の項目は p.%d）' % (cid, '（見本 p1-sample.tex）' if sample else '', start, nxt))
print('実際: はじまり p.%s、 次のページ p.%s' % (st.group(1) if st else '?', endpage))
plen = (endpage - int(st.group(1))) if st and en else None
if plen is None:
    print('ページ数: ?（組めていない）')
elif plen % 2 == 0:
    print('ページ数: %d（偶数 OK。もとの計画は %d）' % (plen, nxt - start))
else:
    print('ページ数: %d（奇数。本ではメモのページが1枚入る。できれば内容をふやして偶数に）' % plen)
print('エラー:', len(errs), *errs[:5], sep='\n  ' if errs else ' ')
print('はみ出し（1.7pt超）:', len(bad_over), bad_over[:12])
vov = [float(x) for x in re.findall(r'Overfull \\vbox \(([\d.]+)pt too high\) has occurred while \\output', log) if float(x) > 3]
print('ページの下へのはみ出し（囲みが1ページより高い）:', len(vov), vov[:6])
und = re.findall(r"Reference `([^']*)' on page \d+ undefined", log)
if und: print('未定義の参照:', sorted(set(und))[:10])
miss = re.findall(r"Missing character: There is no (\S+) \(U\+[0-9A-F]+\) in font ([^!]+)!", log)
nf = [c for c, f in miss if f == 'nullfont']
print('Missing character の警告:', len(miss), '（うち nullfont：%d）' % len(nf))
other = sorted(set(c for c, f in miss if f != 'nullfont'))
if other: print('字形のない文字（フォントにない字）:', other[:10])
if outdir and en:
    os.makedirs(outdir, exist_ok=True)
    pdf = os.path.join(tex, job + '.pdf')
    n = endpage - start
    tmp = os.path.join(outdir, job + '-tmp'); os.makedirs(tmp, exist_ok=True)
    subprocess.run(['pdftoppm', '-r', '120', '-png', '-f', '1', '-l', str(n), pdf, os.path.join(tmp, 'p')], check=True)
    files = sorted(glob.glob(os.path.join(tmp, 'p-*.png')), key=lambda f: int(re.search(r'-(\d+)\.png$', f).group(1)))
    singles = []
    for i, f in enumerate(files):
        d = os.path.join(outdir, '%s-p%d.png' % (job, start + i)); os.replace(f, d); singles.append(d)
    subprocess.run(['montage'] + singles + ['-resize', '25%', '-tile', '%dx' % min(len(singles), 8), '-geometry', '+3+3',
                    '-background', 'gray70', os.path.join(outdir, job + '.png')], check=True)
    if kotae:
        ke = re.search(r'BKPAGE kotaeend (\d+)', logj)
        if ke and int(ke.group(1)) > endpage:
            subprocess.run(['pdftoppm', '-r', '120', '-png', '-f', str(n + 1), '-l', str(int(ke.group(1)) - start), pdf, os.path.join(tmp, 'k')], check=True)
            ks = sorted(glob.glob(os.path.join(tmp, 'k-*.png')))
            for i, f in enumerate(ks):
                d = os.path.join(outdir, '%s-kotae%d.png' % (job, i + 1)); os.replace(f, d)
                print('こたえの画像:', d)
    os.rmdir(tmp)
    print('画像:', os.path.join(outdir, job + '.png'))
