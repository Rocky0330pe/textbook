# -*- coding: utf-8 -*-
"""series_phys.py から、物理シリーズの各巻の表紙・もくじ用の TeX を作る（第9回編集委員会）"""
import os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import series_phys as P
OUT = os.path.join(HERE, "..", "tex")

def write(name, text):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(text)

# 裏表紙の「この巻で答える『なぜ？』」に出す章（もくじのなぜ？から選ぶ）
WHY_PICK = {1: ["力-2", "力-12", "力-13", "力-6", "力-5"],
            2: ["熱-9", "熱-3", "熱-6", "熱-11", "熱-7"],
            3: ["波-13", "波-8", "波-6", "波-12", "波-11"],
            4: ["電-5", "電-8", "電-12", "電-15", "電-11"],
            5: ["原-4", "原-3", "原-9", "原-12", "原-13"]}
# もくじの改ページ：数はこの顔の部の前、文字はこの章の前で次のページへ（第1巻：第3部から右ページ）
TOC_BREAK = {1: (3,), 2: ("熱-9",), 3: ("波-7",), 4: ("電-9",), 5: (3,)}
BACK_CATCH = {n: r"気になる「なぜ？」から、\\ページをめくってみよう" for n in range(1, 6)}

for v in P.VOLS:
    n = v["no"]
    out, back, total = P.layout(v)
    chap = {o[1][0]: (o[1], o[2]) for o in out if o[0] == "chap"}
    back_page = dict(back)
    # ---- 巻のデータ
    meta = ["%% 自動生成（phys/gen_phys.py）。直接編集しないこと", r"\makeatletter"]
    meta.append(r"\phdefvol{%d}{%s}{%s}{%s}" % (n, v["title"], v["sub"], v["catch"]))
    for k, w in enumerate(v["faces"], 1):
        meta.append(r"\phdefface{%d}{%s}" % (k, w))
    meta.append(r"\def\phFrontLine{%s}" % v["front"])
    pno = 0
    for plabel, pname, face, chs in v["parts"]:
        if pname is None: continue
        pno += 1
        meta.append(r"\phdefpart{%d}{%s}{%s}{（%s〜%s）}{%d}" % (pno, plabel, pname, chs[0][0], chs[-1][0], face))
    letters = "ABCDE"
    for k, cid in enumerate(WHY_PICK[n]):
        c, pg = chap[cid]
        meta.append(r"\def\ph@why%s{%s}\def\ph@whyr%s{%s\hspace{0.8em}\bkpageno{%d}}" % (letters[k], c[2], letters[k], cid, pg))
    meta.append(r"\def\ph@whypage{%d}" % back_page["なぜ？の道すじ"])
    meta.append(r"\def\phBackCatch{%s}" % BACK_CATCH[n])
    meta.append(r"\makeatother")
    write("ph%d-meta.tex" % n, "\n".join(meta) + "\n")
    # ---- もくじ
    toc = ["%% 自動生成（phys/gen_phys.py）"]
    # 前付のうち、はじめに読むところ（指摘 No.11）
    toc.append(r"\phtocgrid{\phgi{保存則と相似の地図}{4}\phgi{この本の使い方}{6}}")
    toc.append(r"{\color{bkLine}\hrule height 0.35pt}\vspace{2.4mm}")
    for o in out:
        if o[0] == "part":
            if o[3] in TOC_BREAK.get(n, ()):
                toc.append(r"\phtocbreak")
            toc.append(r"\phtocpart{%s}{%s}{%d}{%d}" % (o[1], o[2], o[4], o[3]))
            cur = o
        else:
            cid, title, hook, stars, ref, kind = o[1]
            if cid in TOC_BREAK.get(n, ()):
                toc.append(r"\phtocbreak")
                toc.append(r"\phtocpartcont{%s}{%s}{%d}" % (cur[1], cur[2], cur[3]))
            mv = ",".join(str(x) for x in P.math_vols(ref))
            toc.append(r"\phtocchap{%s}{%s}{%s}{%s}{%d}{%d}{%d}{%s}" % (cid, title, hook, mv, stars[0], stars[1], o[2], kind))
    names = {"こたえ": "こたえ", "記号カード": "記号カード", back[2][0]: back[2][0],
             "なぜ？の道すじ": r"\mbox{なぜ？}の道すじ", "チェック表": "できるようになったことチェック表",
             "つぎの巻へ": "つぎの巻へ", "さくいん": "さくいん"}
    toc.append(r"\par\vspace{1.5mm}")
    toc.append(r"\phtocgrid{" + "".join(r"\phgi{%s}{%d}" % (names[nm], pg) for nm, pg in back) + "}")
    write("ph%d-toc.tex" % n, "\n".join(toc) + "\n")
    # ---- 第13回（物理第1巻）：部扉の右ページ「この部で学ぶこと」の章の行（ph<n>-part<k>.tex）と、
    #      章・巻末の始まりのページ（ph<n>-pages.tex：保存則と相似の地図・なぜ？の道すじ・\phchapref が使う）
    pno = 0; plines = {}
    for o in out:
        if o[0] == "part":
            pno += 1; plines[pno] = []
        elif pno > 0:
            cid, title, hook, stars, ref, kind = o[1]
            mv = ",".join(str(x) for x in P.math_vols(ref))
            plines[pno].append(r"\phtocchap{%s}{%s}{%s}{%s}{%d}{%d}{%d}{%s}" % (cid, title, hook, mv, stars[0], stars[1], o[2], kind))
    for k, lines in plines.items():
        write("ph%d-part%d.tex" % (n, k), "%% 自動生成（phys/gen_phys.py）\n" + "\n".join(lines) + "\n")
    pg = ["%% 自動生成（phys/gen_phys.py）。章・巻末の始まりのページ（第13回）"]
    for o in out:
        if o[0] == "chap":
            pg.append(r"\phdefchappage{%s}{%d}" % (o[1][0], o[2]))
    for nm, p0 in back:
        pg.append(r"\phdefchappage{back:%s}{%d}" % (nm, p0))
    write("ph%d-pages.tex" % n, "\n".join(pg) + "\n")
    # ---- 親ファイル（表1・表2・扉・もくじ・表4）
    main = r"""%% 物理シリーズ　第%(n)d巻　表紙・もくじ（確認用、仕上がりB5）。自動生成（phys/gen_phys.py）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=5]{bk-b5}%% 本文の書式は数学シリーズ第4巻以降と同じ（ルビなし）
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage[vol=%(n)d]{bk-phys}
\input{ph%(n)d-meta}
\hypersetup{pdftitle={工学を理解するための物理　第%(n)d巻　表紙・もくじ}, pdfauthor={「工学を理解するための物理」編集委員会}}
\begin{document}
\phFrontCoverPage
\phInsideFrontPage
\phTitlePage
\phTocPages{\input{ph%(n)d-toc}}
\phBackCoverPage
\end{document}
""" % dict(n=n)
    if n == 1:
        # 第13回編集委員会（物理第1巻）：本文入りの親ファイル。表1・表2・扉・もくじ・保存則と相似の地図・この本の使い方・
        # 本文（部扉・部の中もくじ・章：ph1-body.tex）・巻末（ph1-back.tex）・奥付・表4 を組む（数学 gen.py の n==3 のやり方）
        main = r"""%% 第13回編集委員会（物理第1巻）
%% 物理シリーズ　第%(n)d巻　本文入り（仕上がりB5）。自動生成（phys/gen_phys.py）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=5]{bk-b5}%% 本文の書式は数学シリーズ第4巻以降と同じ（ルビなし）
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage{bk-volume}
\usepackage{bk-pict1}
\usepackage[vol=%(n)d]{bk-phys}
\usepackage{bk-physbody}
\input{ph%(n)d-meta}
\input{ph%(n)d-pages}
\input{ph%(n)d-front}
\hypersetup{pdftitle={工学を理解するための物理　第%(n)d巻　%(t)s}, pdfauthor={「工学を理解するための物理」編集委員会}}
\begin{document}
\phFrontCoverPage
\phInsideFrontPage
\phTitlePage
\phTocPages{\input{ph%(n)d-toc}}
\phConservationMapPages
\phHowToPages
\input{ph%(n)d-body}
\phBackCoverPage
\end{document}
""" % dict(n=n, t=v["title"])
    write("ph%d.tex" % n, main)
    # ---- カバー展開図
    spine = round(total / 2 * 0.09, 1)
    mm = 72 / 25.4
    W = 182 * 2 + spine
    trim = (18*mm, 18*mm, (18+W)*mm, (18+257)*mm)
    bleed = (15*mm, 15*mm, (21+W)*mm, (21+257)*mm)
    wrap = r"""%% 物理シリーズ　第%(n)d巻　カバー展開図（入稿用）。自動生成（phys/gen_phys.py）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=5]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage[vol=%(n)d]{bk-phys}
\input{ph%(n)d-meta}
\geometry{paperwidth=%(pw).1fmm, paperheight=%(ph).1fmm, margin=0mm}
\makeatletter\def\bk@totalpages{%(tot)d}\global\bk@decofalse\bkfolio{false}\makeatother
\pdfvariable pageattr {/TrimBox [%(t0).2f %(t1).2f %(t2).2f %(t3).2f] /BleedBox [%(b0).2f %(b1).2f %(b2).2f %(b3).2f]}
\hypersetup{pdftitle={工学を理解するための物理　第%(n)d巻　カバー展開図}}
\begin{document}
\phCoverWrapPage{%(spine).1f}
\end{document}
""" % dict(n=n, spine=spine, pw=W+36, ph=257+36, tot=total, t0=trim[0], t1=trim[1], t2=trim[2], t3=trim[3],
           b0=bleed[0], b1=bleed[1], b2=bleed[2], b3=bleed[3])
    write("phwrap%d.tex" % n, wrap)
    print(n, "pages", total, "spine", spine)
