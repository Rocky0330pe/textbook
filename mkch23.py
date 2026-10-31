# 旧1-4章 → 新2-3章（B5）
src = open('/home/claude/work/textbook/chapters/ch1-4.tex', encoding='utf-8').read()
s = src
def rep(old, new, n=1):
    global s
    c = s.count(old)
    assert c >= 1, ("not found", old[:60])
    s = s.replace(old, new) if n == 0 else s.replace(old, new, n)

rep("%% 1-4 ＋−×÷は、何を表しているの？", "%% 2-3 ＋−×÷は、何を表しているの？（旧1-4をB5に組み直したもの）")
rep(r"\bkchapter{1}{4}{", r"\bkchapter{2}{3}{")
# 道しるべ
rep(r"""{＋−×÷は何を表しているの？}
""", r"""{＋−×÷は何を表しているの？}
\bkmichishirube{1-4,1-5,1-11,1-13,2-2}{3-5,5-1,5-9,6-1}
""")
# はてな？の図（幅を詰める）
rep(r"\draw[bkGray!60, line width=3pt] (-4,0) -- (126,0);", r"\draw[bkGray!60, line width=3pt] (-4,0) -- (112,0);")
s = s.replace(r"(\i*30,-1.8) -- (\i*30,1.8)", r"(\i*27,-1.8) -- (\i*27,1.8)")
s = s.replace(r"at (\i*30,0) {\qty{\d}{m}}", r"at (\i*27,0) {\qty{\d}{m}}")
s = s.replace(r"\fill[bkOrange] (\i*30,6.5) circle (2.4);", r"\fill[bkOrange] (\i*27,6.5) circle (2.4);")
s = s.replace(r"at (\i*30,9) {\i\R{秒}{びょう}}", r"at (\i*27,9) {\i\R{秒}{びょう}}")
rep(r"(\i*30+4,6.5) -- node[above, bk label, text=bkInk] {\qty{5}{m}} (\i*30+26,6.5);", r"(\i*27+4,6.5) -- node[above, bk label, text=bkInk] {\qty{5}{m}} (\i*27+23,6.5);")
# やってみようの記録表
rep(r"colspec={Q[c,m,wd=12mm] Q[r,m,wd=18mm] Q[r,m,wd=19mm]}", r"colspec={Q[c,m,wd=10mm] Q[r,m,wd=14mm] Q[r,m,wd=15mm]}")
# 気温の図（幅を詰める）
for a, b in [("(-2,0) -- (124,0);", "(-2,0) -- (108,0);"), ("at (124.5,0) {℃};", "at (108.5,0) {℃};"),
             (r"(\t*6,-1.2) -- (\t*6,1.2);", r"(\t*5.2,-1.2) -- (\t*5.2,1.2);"), (r"at (\t*6,0) {\t};", r"at (\t*5.2,0) {\t};"),
             ("(#2*6,4.2) -- node", "(#2*5.2,4.2) -- node"), ("(#3*6,4.2);", "(#3*5.2,4.2);"),
             ("at (#2*6,0) {};", "at (#2*5.2,0) {};"), ("at (#3*6,0) {};", "at (#3*5.2,0) {};")]:
    rep(a, b)
# 予告を新しい番号に
rep(r"\R{第}{だい}6\R{部}{ぶ}で「\R{積分}{せき|ぶん}」という", r"\R{第}{だい}5\R{巻}{かん}で「\R{積分}{せき|ぶん}」という")
rep(r"colspec={Q[l,m,wd=70mm] Q[l,m,wd=42mm] Q[c,m,wd=22mm]}", r"colspec={Q[l,m,wd=62mm] Q[l,m,wd=40mm] Q[c,m,wd=22mm]}")
rep(r"colspec={Q[c,m,wd=11mm] Q[l,m,wd=46mm] Q[l,m,wd=44mm] Q[l,m,wd=36mm]}", r"colspec={Q[c,m,wd=10mm] Q[l,m,wd=42mm] Q[l,m,wd=40mm] Q[l,m,wd=30mm]}")
rep(r"ベクトルの\R{合成}{ごう|せい}（\R{第}{だい}4\R{部}{ぶ}）", r"ベクトルの\R{合成}{ごう|せい}（4-10）")
rep(r"\R{微分}{び|ぶん}（\R{第}{だい}5\R{部}{ぶ}）", r"\R{微分}{び|ぶん}（\R{第}{だい}5\R{巻}{かん}）")
rep(r"\R{積分}{せき|ぶん}（\R{第}{だい}6\R{部}{ぶ}）", r"\R{積分}{せき|ぶん}（\R{第}{だい}5\R{巻}{かん}）")
rep(r"グラフの\R{傾}{かたむ}き（\R{第}{だい}3\R{部}{ぶ}）", r"グラフの\R{傾}{かたむ}き（3-5）")
rep(r"\R{第}{だい}5\R{部}{ぶ}の「\R{微分}{び|ぶん}」では", r"\R{第}{だい}5\R{巻}{かん}の「\R{微分}{び|ぶん}」では")
rep(r"colspec={Q[l,m,wd=38mm] Q[r,m,wd=24mm] Q[l,m,wd=58mm]}", r"colspec={Q[l,m,wd=36mm] Q[r,m,wd=22mm] Q[l,m,wd=56mm]}")
# 物理・工学ではこう使う の図
rep(r"""\begin{tikzpicture}[x=1mm, y=1mm,
  stage/.style=""", r"""\begin{tikzpicture}[x=0.86mm, y=1mm,
  stage/.style=""")
rep(r"minimum width=30mm,", r"minimum width=27mm,")
rep(r"minimum height=35mm, minimum width=26mm] (goal)", r"minimum height=35mm, minimum width=25mm] (goal)")
rep(r"{グラフの\R{面積}{めん|せき}\\{\footnotesize 3-5}}", r"{グラフの\R{面積}{めん|せき}\\{\footnotesize 5-9}}")
rep(r"{\textbf{\R{微分}{び|ぶん}}\\{\footnotesize \R{第}{だい}5\R{部}{ぶ}}}", r"{\textbf{\R{微分}{び|ぶん}}\\{\footnotesize \R{第}{だい}5\R{巻}{かん}}}")
rep(r"{\textbf{\R{積分}{せき|ぶん}}\\{\footnotesize \R{第}{だい}6\R{部}{ぶ}}}", r"{\textbf{\R{積分}{せき|ぶん}}\\{\footnotesize \R{第}{だい}5\R{巻}{かん}}}")
rep(r"{\footnotesize \R{第}{だい}8\R{部}{ぶ}}\\{\footnotesize ゴール}}", r"{\footnotesize \R{第}{だい}6\R{巻}{かん}}\\{\footnotesize \R{乗}{の}りかえ\R{駅}{えき}}}")
rep(r"そして、この2つが\R{出会}{で|あ}う\R{場所}{ば|しょ}が\textbf{\R{微分方程式}{び|ぶん|ほう|てい|しき}}。この\R{本}{ほん}のゴールです。",
    r"そして、この2つが\R{出会}{で|あ}う\R{場所}{ば|しょ}が\textbf{\R{微分方程式}{び|ぶん|ほう|てい|しき}}（\R{第}{だい}6\R{巻}{かん}）。たくさんの\R{路線}{ろ|せん}が\R{乗}{の}りかえる、この\R{本}{ほん}の\R{大}{おお}きな\R{駅}{えき}です。")

# 例題4（グラフの面積）とじぶんでとこう4を足す
rep(r"""\bksection{tsumazuki}{まちがえやすいところをチェック}""", r"""\begin{reidai}[グラフの\R{面積}{めん|せき}]
グラフは、\R{自転車}{じ|てん|しゃ}の\R{速}{はや}さと\R{時間}{じ|かん}の\R{関係}{かん|けい}です。6\R{秒間}{びょう|かん}で\R{進}{すす}んだ\R{道}{みち}のりは\R{何}{なん}mでしょう。

\noindent\begin{minipage}[t]{0.52\linewidth}
\kangaekata\R{速}{はや}さがちがう2つの\R{時間}{じ|かん}に\R{分}{わ}けて、それぞれ「\R{速}{はや}さ×\R{時間}{じ|かん}」＝\R{長方形}{ちょう|ほう|けい}の\R{面積}{めん|せき}を\R{求}{もと}め、さいごにたします。

\shiki $\qty{3}{m/s}\times\qty{2}{s}+\qty{1}{m/s}\times\qty{4}{s}$\\
\hspace*{2.6\zw}$=\qty{6}{m}+\qty{4}{m}=\qty{10}{m}$

\kotae\qty{10}{m}
\end{minipage}\hfill
\begin{minipage}[t]{0.44\linewidth}
\vspace{0pt}
\begin{tikzpicture}[x=7.4mm, y=7.2mm]
  \foreach \x in {1,...,6} \draw[bk grid] (\x,0) -- (\x,3.4);
  \foreach \y in {1,...,3} \draw[bk grid] (0,\y) -- (6.4,\y);
  \fill[bkBlue!22] (0,0) rectangle (2,3);
  \fill[bkOrange!28] (2,0) rectangle (6,1);
  \node[font=\sffamily\bfseries\small, text=bkBlue!80!black] at (1,1.5) {\qty{6}{m}};
  \node[font=\sffamily\bfseries\small, text=bkOrange!80!black] at (4,0.5) {\qty{4}{m}};
  \draw[bk data] (0,3) -- (2,3);
  \draw[bkBlue, line width=0.9pt, densely dashed] (2,3) -- (2,1);
  \draw[bk data] (2,1) -- (6,1);
  \draw[bk axis] (0,0) -- (6.7,0);
  \draw[bk axis] (0,0) -- (0,3.9);
  \foreach \x in {1,...,6} \node[bk tick, below=1.2mm] at (\x,0) {\x};
  \foreach \y in {1,...,3} \node[bk tick, left=1.2mm] at (0,\y) {\y};
  \node[bk tick, below left=1mm] at (0,0) {0};
  \node[anchor=north east, bk label] at ([yshift=-5mm]6.7,0) {\R{時間}{じ|かん}（s）};
  \node[anchor=south west, bk label] at (0.08,3.9) {\R{速}{はや}さ（m/s）};
\end{tikzpicture}
\end{minipage}
\end{reidai}

\begin{jibun}
\R{台車}{だい|しゃ}が、\R{速}{はや}さ\qty{4}{m/s}で3\R{秒間}{びょう|かん}\R{進}{すす}み、そのあと\qty{2}{m/s}で5\R{秒間}{びょう|かん}\R{進}{すす}みました。\R{進}{すす}んだ\R{道}{みち}のりは\R{全部}{ぜん|ぶ}で\R{何}{なん}mでしょう。グラフをかいて、\R{面積}{めん|せき}で\R{求}{もと}めよう。
\bkwrite[しき]{2}
\bkanswerbox
\end{jibun}

\bksection{tsumazuki}{まちがえやすいところをチェック}""")
open('/home/claude/work/build/tex/ch2-3.tex', 'w', encoding='utf-8').write(s)

m = open('/home/claude/work/textbook/chapters/ch1-4-mondai.tex', encoding='utf-8').read()
def repm(old, new):
    global m
    assert old in m, old[:60]
    m = m.replace(old, new)
repm("%% 1-4 章末問題・ふりかえり（章末問題はページの頭から始める）", "%% 2-3 章末問題・ふりかえり（旧1-4をB5に組み直したもの）")
repm(r"colspec={*{4}{Q[l,m,wd=36mm]}}", r"colspec={*{4}{Q[l,m,wd=34mm]}}")
repm(r"\kionGraph[0.68]{f}", r"\kionGraph[0.6]{f}")
repm(r"\daishaGraph[0.7]{f}", r"\daishaGraph[0.62]{f}")
repm(r"\draw[bk data, bkPart1]", r"\draw[bk data, bkTheme]")
repm(r"\fill[bkPart1] (\x,\y) circle (1.6pt);", r"\fill[bkTheme] (\x,\y) circle (1.6pt);")
open('/home/claude/work/build/tex/ch2-3-mondai.tex', 'w', encoding='utf-8').write(m)
print("ok")
