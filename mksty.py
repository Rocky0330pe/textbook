import re
src = open('/home/claude/work/textbook/butsuri-sugaku.sty', encoding='utf-8').read()
s = src
def rep(old, new, count=1):
    global s
    assert old in s, old[:80]
    s = s.replace(old, new, count)

rep("""%% butsuri-sugaku.sty
%% 『物理を理解するための数学』 教科書フォーマット
%% LuaLaTeX + LuaTeX-ja 専用（A4・カラー）
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{butsuri-sugaku}[2026/10/15 v0.1 textbook format]""",
"""%% bk-b5.sty
%% 『物理を理解するための数学』 教科書フォーマット（B5・両面・CMYK）
%% LuaLaTeX + LuaTeX-ja 専用。A4片面版 butsuri-sugaku.sty v0.1 を改訂（第2回編集委員会）
\\NeedsTeXFormat{LaTeX2e}
\\ProvidesPackage{bk-b5}[2026/10/16 v0.2 textbook format B5 twoside]
%% 巻の番号（1〜9）。\\usepackage[vol=2]{bk-b5}
\\RequirePackage{kvoptions}
\\SetupKeyvalOptions{family=bk, prefix=bk@opt@}
\\DeclareStringOption[2]{vol}
\\ProcessKeyvalOptions*
\\edef\\bkvol{\\bk@opt@vol}""")

rep("""\\RequirePackage[a4paper,top=27mm,bottom=27mm,left=24mm,right=28mm,
  headheight=0pt,headsep=0pt,footskip=0pt]{geometry}""",
"""%% B5（182×257 mm）両面。のど20・小口22・天20・地22 → 本文 140×215 mm
\\RequirePackage[paperwidth=182mm,paperheight=257mm,twoside,
  inner=20mm,outer=22mm,top=20mm,bottom=22mm,
  headheight=0pt,headsep=0pt,footskip=0pt]{geometry}""")

rep("\\RequirePackage[dvipsnames]{xcolor}", "\\RequirePackage[cmyk,dvipsnames]{xcolor}% 印刷用にすべてCMYKで出力")

# 第1巻の本文は教科書体（仮：Klee One）
rep("""\\setmainjfont{BIZUDMincho}[Path=\\bkfontpath, Extension=.ttf,
  UprightFont=*-Regular, BoldFont=*-Bold]""",
"""\\ifnum\\bkvol=1\\relax
  % 第1巻：教科書体の代わりに Klee One（SIL OFL）を仮に使う
  \\setmainjfont{KleeOne}[Path=\\bkfontpath, Extension=.ttf,
    UprightFont=*-Regular, BoldFont=*-SemiBold]
\\else
  \\setmainjfont{BIZUDMincho}[Path=\\bkfontpath, Extension=.ttf,
    UprightFont=*-Regular, BoldFont=*-Bold]
\\fi
\\newjfontfamily\\bkkyokasho{KleeOne}[Path=\\bkfontpath, Extension=.ttf,
  UprightFont=*-Regular, BoldFont=*-SemiBold]""")

# 第1巻は文字を大きく
rep("""\\AtBeginDocument{\\normalsize}""",
"""\\ifnum\\bkvol=1\\relax
  \\renewcommand{\\normalsize}{\\@setfontsize\\normalsize{15pt}{28pt}%
    \\abovedisplayskip 10pt plus 2pt minus 2pt
    \\belowdisplayskip \\abovedisplayskip
    \\abovedisplayshortskip 5pt
    \\belowdisplayshortskip 5pt}
\\fi
\\AtBeginDocument{\\normalsize}""")

# 色：CMYKで定義し直す
old_colors = s[s.index("\\definecolor{bkInk}"):s.index("\\colorlet{bkTheme}{bkPart1}")]
new_colors = r"""\definecolor{bkInk}{cmyk}{0,0,0,0.92}      % 本文（スミ1色）
\definecolor{bkNavy}{cmyk}{0.95,0.75,0.25,0.25} % 見出し
\definecolor{bkGray}{cmyk}{0,0,0,0.65}
\definecolor{bkLine}{cmyk}{0.15,0.10,0.08,0.05}
\definecolor{bkPaper}{cmyk}{0.03,0.02,0.01,0}
\definecolor{bkYellow}{cmyk}{0,0.28,1,0.08}   % はてな？
\definecolor{bkYellowBg}{cmyk}{0,0.04,0.16,0}
\definecolor{bkGreen}{cmyk}{0.85,0.10,0.65,0.10}    % やってみよう
\definecolor{bkGreenBg}{cmyk}{0.10,0,0.07,0}
\definecolor{bkBlue}{cmyk}{0.88,0.50,0,0}     % 例題
\definecolor{bkBlueBg}{cmyk}{0.08,0.03,0,0}
\definecolor{bkOrange}{cmyk}{0,0.62,1,0.05}   % じぶんでとこう
\definecolor{bkOrangeBg}{cmyk}{0,0.06,0.13,0}
\definecolor{bkRed}{cmyk}{0.05,0.88,0.60,0.05}      % つまずきポイント
\definecolor{bkRedBg}{cmyk}{0,0.08,0.04,0}
\definecolor{bkPurple}{cmyk}{0.62,0.75,0,0}   % 物理・工学ではこう使う
\definecolor{bkPurpleBg}{cmyk}{0.06,0.08,0,0}
\definecolor{bkStar}{cmyk}{0,0.48,1,0}
%% 巻ごとのテーマ色（表紙・帯・柱・つめ・ノンブル）
\definecolor{bkVol1}{cmyk}{0,0.80,0.85,0}
\definecolor{bkVol2}{cmyk}{0,0.58,1,0}
\definecolor{bkVol3}{cmyk}{0.04,0.20,1,0}
\definecolor{bkVol4}{cmyk}{0.50,0,1,0}
\definecolor{bkVol5}{cmyk}{0.88,0.12,0.90,0.05}
\definecolor{bkVol6}{cmyk}{0.82,0,0.34,0}
\definecolor{bkVol7}{cmyk}{0.90,0.48,0,0}
\definecolor{bkVol8}{cmyk}{0.95,0.85,0.12,0.08}
\definecolor{bkVol9}{cmyk}{0.55,0.82,0,0}
%% 色の上にのせる文字の色（明るい黄・黄緑の巻は濃い色の文字）
\colorlet{bkOn1}{white}\colorlet{bkOn2}{white}
\definecolor{bkOn3}{cmyk}{0.95,0.75,0.25,0.25}\definecolor{bkOn4}{cmyk}{0.95,0.75,0.25,0.25}
\colorlet{bkOn5}{white}\colorlet{bkOn6}{white}\colorlet{bkOn7}{white}\colorlet{bkOn8}{white}\colorlet{bkOn9}{white}
%% 濃い版（明るい巻でも文字に使える）
\colorlet{bkDeep1}{bkVol1!85!black}\colorlet{bkDeep2}{bkVol2!80!black}
\colorlet{bkDeep3}{bkVol3!55!black}\colorlet{bkDeep4}{bkVol4!60!black}
\colorlet{bkDeep5}{bkVol5!85!black}\colorlet{bkDeep6}{bkVol6!75!black}
\colorlet{bkDeep7}{bkVol7!90!black}\colorlet{bkDeep8}{bkVol8}\colorlet{bkDeep9}{bkVol9!90!black}
%% 7本の路線の色（形の記号も必ず添える）
\definecolor{bkRoute1}{cmyk}{0,0.75,1,0.05}
\definecolor{bkRoute2}{cmyk}{1,0.45,0,0.05}
\definecolor{bkRoute3}{cmyk}{0,0.40,1,0}
\definecolor{bkRoute4}{cmyk}{0.95,0,0.70,0.05}
\definecolor{bkRoute5}{cmyk}{0.15,0.80,0,0}
\definecolor{bkRoute6}{cmyk}{0.75,0.05,0,0}
\definecolor{bkRoute7}{cmyk}{0,0.20,1,0.25}
%% 旧版の部ごとの色名も残す（巻の色に読みかえる）
"""
s = s.replace(old_colors, new_colors)
rep("\\colorlet{bkTheme}{bkPart1}", r"""\colorlet{bkVol}{bkVol\bkvol}\colorlet{bkOn}{bkOn\bkvol}\colorlet{bkDeep}{bkDeep\bkvol}
\colorlet{bkTheme}{bkVol}
\foreach \i in {0,...,8} {\global\colorlet{bkPart\i}{bkVol}}\global\colorlet{bkPartA}{bkVol}""")

# ★は5段階
rep("""\\DeclareRobustCommand\\bkstars[1]{{\\sffamily\\color{bkStar}\\ifcase#1\\or★\\or★★\\or★★★\\fi}}""",
"""\\DeclareRobustCommand\\bkstars[1]{{\\sffamily\\color{bkStar}\\ifcase#1\\or★\\or★★\\or★★★\\or★★★★\\or★★★★★\\fi}}""")
rep("""{\\sffamily\\footnotesize\\color{bkStar}\\ifcase#1\\or★\\or★★\\or★★★\\fi};}""",
"""{\\sffamily\\footnotesize\\color{bkStar}\\bkstars{#1}};}""")

# 飾り（柱・ノンブル・つめ）を左右反転
old_deco = s[s.index("\\AddToHook{shipout/background}{%"):s.index("%% ------------------------------------------------------------\n%% 7. 目次")]
new_deco = r"""\newif\ifbk@folio \bk@foliotrue
\newcommand\bkfolio[1]{\global\csname bk@folio#1\endcsname}% ノンブルだけの表示切替
\AddToHook{shipout/background}{%
  \put(0,-\paperheight){%
  \begin{tikzpicture}[overlay, x=1mm, y=1mm]
    \ifodd\value{page}
      \def\bk@xin{20}\def\bk@xout{160}\def\bk@tabx{176}\def\bk@tabw{9}\def\bk@tabtx{179}
    \else
      \def\bk@xin{162}\def\bk@xout{22}\def\bk@tabx{-3}\def\bk@tabw{9}\def\bk@tabtx{3}
    \fi
    \ifbk@deco
    % 柱（小口側）：偶数ページは巻・部、奇数ページは章
    \ifx\bk@runpart\@empty\else
      \draw[bkTheme, line width=0.7pt] (\bk@xin,245)--(\bk@xout,245);
      \ifodd\value{page}
        \node[anchor=south east, inner sep=0pt, font=\sffamily\footnotesize, text=bkGray] at (160,246.6) {\bk@runchap};
      \else
        \node[anchor=south west, inner sep=0pt, font=\sffamily\footnotesize, text=bkDeep] at (22,246.6) {\bk@runpart};
      \fi
    \fi
    % つめ（部の番号）。小口側の端まで（塗り足し3 mm）
    \ifx\bk@tabnum\@empty\else
      \fill[bkTheme] (\bk@tabx,{232-32*(\bk@tabpos-1)}) rectangle ++(\bk@tabw,-28);
      \node[text=bkOn, font=\sffamily\bfseries\large] at (\bk@tabtx,{218-32*(\bk@tabpos-1)}) {\bk@tabnum};
    \fi
    \fi
    \ifbk@folio
    % ノンブル（下の小口側）
    \ifodd\value{page}\def\bk@fx{155.5}\else\def\bk@fx{26.5}\fi
    \node[circle, fill=bkTheme, text=bkOn, minimum size=8mm, inner sep=0pt,
      font=\sffamily\bfseries\small] at (\bk@fx,11) {\thepage};
    \fi
  \end{tikzpicture}}}

"""
s = s.replace(old_deco, new_deco)

# 部扉・章見出し：巻ベースに（部の番号は巻の中で1から）
rep(r"""\newcommand\bkpart[4]{%
  \clearpage
  \colorlet{bkTheme}{#3}%""", r"""\newcommand\bkpart[4]{%
  \clearpage
  \colorlet{bkTheme}{bkVol}%""")
rep(r"""\pdfbookmark[0]{第#1部　#4}{bkpart#1}%""", r"""\pdfbookmark[0]{第#1部　#4}{bkpart#1}\gdef\bk@partplain{第#1部　#4}%""")
rep(r"""  \bksetrunning{#1}{\bk@partlabel\hspace{0.6\zw}\bk@partname}{#1-#2\hspace{0.6\zw}#5}%""",
    r"""  \bksetrunning{\bk@tabpos}{\R{第}{だい}\bkvol\R{巻}{かん}\hspace{0.8\zw}\bk@partlabel\hspace{0.6\zw}\bk@partname}{#1-#2\hspace{0.6\zw}#5}%""")
rep(r"""\def\bk@partlabel{}\def\bk@partname{}""", r"""\def\bk@partlabel{}\def\bk@partname{}\def\bk@partplain{}""")

# 「物理ではこう使う」→「物理・工学ではこう使う」
rep(r"""title={\bkicon[1.25em]{butsuri}{bkPurple!70!black}\hspace{0.4\zw}\R{物理}{ぶつ|り}ではこう\R{使}{つか}う}}""",
    r"""title={\bkicon[1.25em]{butsuri}{bkPurple!70!black}\hspace{0.4\zw}\R{物理}{ぶつ|り}・\R{工学}{こう|がく}ではこう\R{使}{つか}う}}""")

# 本文の基本色
rep("\\AtBeginDocument{\\color{bkInk}}", "\\AtBeginDocument{\\color{bkInk}}\n\\hypersetup{pdfpagelayout=TwoPageRight}")
open('/home/claude/work/build/tex/bk-b5.sty', 'w', encoding='utf-8').write(s)
print("ok", len(s))
