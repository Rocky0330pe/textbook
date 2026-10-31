# -*- coding: utf-8 -*-
"""series.py から、各巻の TeX データと親ファイルを作る"""
import os, math, sys
sys.path.insert(0, os.path.dirname(__file__))
import series as S
OUT = os.path.join(os.path.dirname(__file__), "tex")

TITLE_R = {  # 他の巻の名前（総ルビの巻でも読めるように、すべてルビ付き。第4巻以降は自動でルビが消える）
 1: ("かぞえる・はかる", ""),
 2: (r"\R{数}{かず}と\R{量}{りょう}のことば", ""),
 3: (r"\R{関数}{かん|すう}とデータ", r"きまりを\R{見}{み}つける"),
 4: (r"\R{形}{かたち}と\R{向}{む}き", r"\R{図形}{ず|けい}・\R{三角関数}{さん|かく|かん|すう}・ベクトル"),
 5: (r"\R{変化}{へん|か}をつかむ", r"\R{微分}{び|ぶん}と\R{積分}{せき|ぶん}"),
 6: (r"\R{未来}{み|らい}を\R{計算}{けい|さん}する", r"\R{微分方程式}{び|ぶん|ほう|てい|しき}と\R{複素数}{ふく|そ|すう}"),
 7: (r"まとめて\R{計算}{けい|さん}する", r"\R{行列}{ぎょう|れつ}"),
 8: (r"\R{空間}{くう|かん}に\R{広}{ひろ}がる\R{量}{りょう}", r"ベクトル\R{解析}{かい|せき}"),
 9: (r"\R{波}{なみ}と\R{変化}{へん|か}を\R{読}{よ}みとく", r"フーリエ\R{解析}{かい|せき}とラプラス\R{変換}{へん|かん}"),
}
ROUTE_SUB_R = {
 1: r"ひき\R{算}{ざん}→\R{傾}{かたむ}き→\R{微分}{び|ぶん}",
 2: r"かけ\R{算}{ざん}→\R{面積}{めん|せき}→\R{積分}{せき|ぶん}",
 3: r"\R{累乗}{るい|じょう}→\R{指数}{し|すう}→$e$",
 4: r"\R{角}{かく}→sin→\R{複素数}{ふく|そ|すう}",
 5: r"\R{九九}{く|く}の\R{表}{ひょう}→\R{行列}{ぎょう|れつ}",
 6: r"\R{向}{む}き→ベクトル→\R{場}{ば}",
 7: r"\R{目}{め}もり→\R{誤差}{ご|さ}→\R{統計}{とう|けい}",
}
END_R = {1: r"\R{流体}{りゅう|たい}・\R{熱}{ねつ}", 2: r"\R{電磁気}{でん|じ|き}", 3: r"\R{制御}{せい|ぎょ}",
         4: r"\R{音}{おと}・\R{交流}{こう|りゅう}", 5: r"\R{回路網}{かい|ろ|もう}・\R{制御}{せい|ぎょ}",
         6: r"ロボット・\\\R{電磁気}{でん|じ|き}", 7: r"\R{計測}{けい|そく}・\R{診断}{しん|だん}"}

def chapters(v):
    for plabel, pname, chs in v["parts"]:
        for c in chs:
            yield plabel, pname, c

def write(name, text):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(text)

# ---- シリーズ共通のデータ
lines = ["%% 自動生成（gen.py）。直接編集しないこと", r"\makeatletter"]
for v in S.VOLS:
    n = v["no"]
    smin = min(c[3][0] for _,_,c in chapters(v)); smax = max(c[3][1] for _,_,c in chapters(v))
    t, sub = TITLE_R[n]
    catch = v["catch"]
    lines.append(r"\bkdefvol{%d}{%s}{%s}{%s}{%s}{%d}{%d}" % (n, t, sub, catch, v["grade"], smin, smax))
for r, d in S.ROUTES.items():
    lines.append(r"\@namedef{bk@rname@%d}{%s}\@namedef{bk@rsub@%d}{%s}\@namedef{bk@rend@%d}{%s}" % (r, d["r_name"], r, ROUTE_SUB_R[r], r, END_R[r]))
lines.append(r"\makeatother")
write("series-data.tex", "\n".join(lines) + "\n")

# ---- 巻ごと
for v in S.VOLS:
    n = v["no"]
    out, back, total = S.layout(v)
    # 部の一覧
    meta = ["%% 自動生成（gen.py）", r"\makeatletter"]
    parts = [(pl, pn, chs) for pl, pn, chs in v["parts"] if pn is not None]
    meta.append(r"\def\bk@npart{%d}" % len(parts))
    meta.append(r"\def\bk@routepage{%d}" % (6 if n == 1 else 4))
    for i, (pl, pn, chs) in enumerate(parts, 1):
        rng = "%s〜%s" % (chs[0][0], chs[-1][0])
        meta.append(r"\bkdefpart{%d}{%s}{%s}{（%s）}" % (i, pl, pn, rng))
    # この巻の駅（路線ごと）
    here = {r: [] for r in S.ROUTES}
    for _, _, c in chapters(v):
        for r in c[4]:
            if c[5] not in ("E", "J"):
                here[r].append(c[0])
    for r in S.ROUTES:
        txt = "、".join(here[r]) if here[r] else r"（この\R{巻}{かん}には\R{駅}{えき}がありません）"
        meta.append(r"\@namedef{bk@rhere@%d}{%s}" % (r, txt))
    # 路線図の駅：主な駅＋この巻の駅（各路線の最初の章）
    stations = {}
    for r, (lst, end) in S.ROUTE_STATIONS.items():
        for st in lst:
            vol = int(st.split("-")[0])
            if vol != n:
                stations[(r, vol)] = st
        # 第7回：この巻の駅も、主な駅（ROUTE_STATIONS）にあればそれを使う（どの巻の路線図でも同じ駅にする）
        own = [st for st in lst if int(st.split("-")[0]) == n]
        if own:
            stations[(r, n)] = own[0]
        elif here[r]:
            stations[(r, n)] = here[r][0]
    st_cmds = []
    for (r, vol), lab in sorted(stations.items()):
        st_cmds.append(r"\bkstation{%d}{%d}{%s}" % (r, vol, lab))
    meta.append(r"\def\bk@stations{%s}" % "".join(st_cmds))
    for r in S.ROUTES:
        top = min(vol for (rr, vol) in stations if rr == r)
        meta.append(r"\@namedef{bk@rtop@%d}{%s}" % (r, 182 - (top - 1) * 17))
    meta.append(r"\makeatother")
    write("vol%d-meta.tex" % n, "\n".join(meta) + "\n")
    # もくじ
    toc = ["%% 自動生成（gen.py）"]
    for o in out:
        if o[0] == "part":
            if n == 1 and ("2" in o[1] or "3" in o[1] or "4" in o[1]):
                # 第5回：章の少ない部のページは下が空くので、つぎの部へ うつる前に ふきだしを置く
                if "3" in o[1]:
                    toc.append(r"\vfill\bkfukidashi{sora}{ながさ、 かさ、 おもさ、 \R{時間}{じ|かん}。 はかる ものは ちがっても、 「1つ\R{分}{ぶん}の いくつ\R{分}{ぶん}」で はかるのは \R{同}{おな}じだよ。}\vspace{10mm}")
                elif "4" in o[1]:
                    toc.append(r"\vfill\bkfukidashi{mina}{かけ\R{算}{ざん}と わり\R{算}{ざん}は、 「\R{同}{おな}じ かずの まとまり」で つながって いるよ。 \R{九九}{く|く}が つかえると、 わり\R{算}{ざん}も できるね。}\vspace{10mm}")
                toc.append(r"\clearpage")   # 第1巻は1ページに1つの部（序章は第1部のページ）
            toc.append(r"\bktocpart{%s}{%s}{%d}" % (o[1], o[2], o[3]))
        else:
            cid, title, hook, stars, routes, kind = o[1]
            rts = ",".join(str(r) for r in routes) if kind != "E" else "all"
            toc.append(r"\bktocchap{%s}{%s}{%s}{%s}{%d}{%d}{%d}{%s}" % (cid, title, hook, rts, stars[0], stars[1], o[2], kind))
    # 部ごとの章の行（部扉の右ページ「この部で学ぶこと」で使う）  vol<n>-part<p>.tex
    pno = 0; plines = {}
    for o2 in out:
        if o2[0] == "part":
            pno += 1; plines[pno] = []
        elif pno > 0:
            cid, title, hook, stars, routes, kind = o2[1]
            rts = ",".join(str(r) for r in routes) if kind != "E" else "all"
            plines[pno].append(r"\bktocchap{%s}{%s}{%s}{%s}{%d}{%d}{%d}{%s}" % (cid, title, hook, rts, stars[0], stars[1], o2[2], kind))
    for k, v in plines.items():
        write("vol%d-part%d.tex" % (n, k), "%% 自動生成（gen.py）\n" + "\n".join(v) + "\n")
    toc.append(r"\par\vspace{2mm}")
    names = {"こたえ": r"こたえ", "記号カード": r"\R{記号}{き|ごう}カード", "定数と単位": r"よく\R{使}{つか}う\R{定数}{てい|すう}・\R{単位}{たん|い}・\R{公式}{こう|しき}", "チェック表": r"できるようになったことチェック\R{表}{ひょう}", "さくいん": r"さくいん"}
    names["つぎの巻へ"] = r"つぎの\R{巻}{かん}へ"
    if n == 9:   # 第15回：最後の巻は「つぎの巻へ」のかわりに「物理シリーズへ」
        names["つぎの巻へ"] = r"物理シリーズへ"
    if n == 1:
        names["記号カード"] = r"きごうカード"; names["定数と単位"] = r"たんいのひょう"; names["チェック表"] = r"チェックひょう"; names["ふろく"] = r"ふろく"; names["つぎの巻へ"] = r"つぎのステージへ"
    # 第5回：巻末の項目が5つ以上あっても1行目からあふれないように、\bktocbacklist で ならべる（全巻）
    toc.append(r"\bktocbacklist{" + "".join(r"\bkbi{%s}{%d}" % (names[name], pg) for name, pg in back) + "}")
    write("vol%d-toc.tex" % n, "\n".join(toc) + "\n")
    # 親ファイル
    sample = r"\input{vol%d-sample}" % n if n in (1, 2, 8) else "%"
    if n == 5:   # 第4回：第5巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol5-body}"
    if n == 6:   # 第14回：第6巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol6-body}"
    if n == 7:   # 第14回：第7巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol7-body}"
    if n == 8:   # 第14回：第8巻は本文をすべて組む（第4回の見本 vol8-sample はやめる）
        sample = r"\bkHowToPages" + "\n" + r"\input{vol8-body}"
    if n == 9:   # 第15回：第9巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol9-body}"
    if n == 4:   # 第13回：第4巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol4-body}"
    if n == 3:   # 第12回：第3巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol3-body}"
    if n == 2:   # 第7回：第2巻は本文をすべて組む
        sample = r"\bkHowToPages" + "\n" + r"\input{vol2-body}"
    if n == 1:   # 第5回：第1巻は本文をすべて組む（もくじが4ページなので、使い方は p.8〜9）
        sample = r"\bkHowToPagesOne" + "\n" + r"\input{vol1-body}"
    main = r"""%% 第%(n)d巻　表紙・もくじ（確認用、仕上がりB5）。自動生成（gen.py）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=%(n)d]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\usepackage{bk-volume}
\usepackage{bk-pict1}
\input{bk-motifs}
\input{bk-howto}
\input{series-data}
\input{vol%(n)d-meta}
\hypersetup{pdftitle={物理を理解するための数学　第%(n)d巻　%(ptitle)s}, pdfauthor={「物理を理解するための数学」編集委員会}}
\begin{document}
\bkFrontCoverPage
\bkInsideFrontPage
\bkTitlePage
\bkTocPages{\input{vol%(n)d-toc}}
\bkRouteMapPages
%(sample)s
\bkBackCoverPage
\end{document}
""" % dict(n=n, sample=sample, ptitle=(S.VOLS[n-1]["title"] if n in (1, 2, 3, 4, 5, 6, 7, 8, 9) else S.VOLS[n-1]["title"] + "　表紙・もくじ"))   # 第12回：本文を組んだ巻は書名を PDF の題に
    write("vol%d.tex" % n, main)
    # カバー展開図
    spine = round(total / 2 * 0.09, 1)
    mm = 72/25.4
    W = 182*2 + spine
    trim = (18*mm, 18*mm, (18+W)*mm, (18+257)*mm)
    bleed = (15*mm, 15*mm, (21+W)*mm, (21+257)*mm)
    wrap = r"""%% 第%(n)d巻　カバー展開図（入稿用）。自動生成（gen.py）
\documentclass[12pt]{ltjsarticle}
\def\bkfontpath{fonts/}
\usepackage[vol=%(n)d]{bk-b5}
\usepackage{bk-matter}
\usepackage{bk-honbun}
\input{bk-motifs}
\input{series-data}
\input{vol%(n)d-meta}
\geometry{paperwidth=%(pw).1fmm, paperheight=%(ph).1fmm, margin=0mm}
\makeatletter\def\bk@totalpages{%(tot)d}\global\bk@decofalse\bkfolio{false}\makeatother
\pdfvariable pageattr {/TrimBox [%(t0).2f %(t1).2f %(t2).2f %(t3).2f] /BleedBox [%(b0).2f %(b1).2f %(b2).2f %(b3).2f]}
\hypersetup{pdftitle={物理を理解するための数学　第%(n)d巻　カバー展開図}}
\begin{document}
\bkCoverWrapPage{%(spine).1f}
\end{document}
""" % dict(n=n, spine=spine, pw=W+36, ph=257+36, tot=total, t0=trim[0], t1=trim[1], t2=trim[2], t3=trim[3], b0=bleed[0], b1=bleed[1], b2=bleed[2], b3=bleed[3])
    write("wrap%d.tex" % n, wrap)
    print(n, "pages", total, "spine", spine)
