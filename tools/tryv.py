#!/usr/bin/env python3
"""どの巻でも、1つの章だけを本と同じページ番号・同じ部の設定で試し組みする（第6回編集委員会）。
使い方:  python3 tools/tryv.py 5-7 [画像を書き出すフォルダ]
  → tex/tryv-5-07.tex を作って lualatex を2回まわし、章の始まりと終わりのページ、
    エラー、はみ出し（1.7pt超の Overfull）を表示する。
    フォルダを指定すると、章のページを並べた画像と、1ページずつの画像（120dpi）を書き出す。
（第1巻は tools/try1.py を使う。分かち書きの設定が違うため）
"""
import os, re, subprocess, sys, glob
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.join(here, '..')
sys.path.insert(0, root)
import series as S

# 第7回：--kotae をつけると、章のあとに「こたえ」のページも組む（ページ数には数えない。画像は …-kotae.png）
kotae = '--kotae' in sys.argv
argv = [a for a in sys.argv if a != '--kotae']
cid = argv[1]
outdir = argv[2] if len(argv) > 2 else None
vol, ch = (int(x) for x in cid.split('-'))
if vol == 1:
    sys.exit('第1巻は tools/try1.py を使ってください')
v = S.VOLS[vol - 1]
out, back, total = S.layout(v)
start = None; nxt = None; partno = 0; partname = ''; mypart = (0, '')
for k, o in enumerate(out):
    if o[0] == 'part':
        partno += 1; partname = o[2]
    elif o[1][0] == cid:
        start = o[2]; mypart = (partno, partname)
        if k + 1 < len(out):
            nx = out[k + 1]
            nxt = nx[3] if nx[0] == 'part' else nx[2]
        else:
            nxt = back[0][1]
        break
if start is None:
    sys.exit('章 %s が見つかりません' % cid)
pages = nxt - start
# 次が部扉なら、部扉の分は数えない（部扉は2ページ）
tex = os.path.join(root, 'tex')
# 章のファイル名は ch5-07.tex（2けた）と ch2-3.tex（見本の巻）の2つの形がある
chfile = 'ch%d-%02d' % (vol, ch)
if not os.path.exists(os.path.join(tex, chfile + '.tex')):
    chfile = 'ch%d-%d' % (vol, ch)
job = 'tryv-%d-%02d' % (vol, ch)
partdef = (r"\bkpartbegin{%d}{%s}" % mypart) if mypart[0] else ""
src = r"""%% 試し組み（tools/tryv.py が作る。消してよい）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=%(vol)d]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage{bk-volume}
\usepackage{bk-pict1}
\input{bk-motifs}
\input{series-data}
\input{vol%(vol)d-meta}
\begin{document}
\makeatletter\global\bk@decotrue\bkfolio{true}\makeatother
%(partdef)s
\setcounter{page}{%(start)d}
\input{%(chfile)s}
\clearpage\typeout{BKPAGE end \thepage}
%(kotae)s
\end{document}
""" % dict(vol=vol, partdef=partdef, start=start, nn=ch, chfile=chfile,
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
over = re.findall(r'Overfull \\hbox \(([\d.]+)pt too wide\) (?:in paragraph at lines (\d+)--\d+|detected at line (\d+))', log)
bad_over = ['%.1fpt@L%s' % (float(w), a or b) for w, a, b in over if float(w) > 1.7]
endpage = int(en.group(1)) if en else None
print('章 %s  計画: p.%d から（次の項目は p.%d）' % (cid, start, nxt))
print('実際: はじまり p.%s、 次のページ p.%s' % (st.group(1) if st else '?', endpage))
# 次の項目が部扉のときは、章のあとに空きページはないので endpage == nxt になるはず
# 第11回：ページ制限なし。章の長さは自由だが、偶数ページにする（奇数なら本ではメモのページが1枚入る）
plen = (endpage - int(st.group(1))) if st and en else None
if plen is None:
    print('ページ数: ?（組めていない）')
elif plen % 2 == 0:
    print('ページ数: %d（偶数 OK。もとの計画は %d）' % (plen, nxt - start))
else:
    print('ページ数: %d（奇数。本ではメモのページが1枚入る。できれば内容をふやして偶数に）' % plen)
print('エラー:', len(errs), *errs[:5], sep='\n  ' if errs else ' ')
print('はみ出し（1.7pt超）:', len(bad_over), bad_over[:12])
# 第12回：囲みがページより高くて下にはみ出す（Overfull \vbox）も知らせる
vov = [float(x) for x in re.findall(r'Overfull \\vbox \(([\d.]+)pt too high\) has occurred while \\output', log) if float(x) > 3]
print('ページの下へのはみ出し（囲みが1ページより高い）:', len(vov), vov[:6])
und = re.findall(r"Reference `([^']*)' on page \d+ undefined", log)
if und: print('未定義の参照:', sorted(set(und))[:10])
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
