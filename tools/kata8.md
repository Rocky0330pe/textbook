# 第8巻の「型」（組 V8-1 が決めて配る。10月29日）

ほかの組は、この型をそのまま使ってください。下の例は、すべて `tex/ch8-01.tex` の中で試し組みして、
**エラー0・はみ出し0** で組めることを確かめてあります（8-1 の本文でも同じ形で使っています）。
部品の名前の頭文字 `kviiib` は 8-1 のものです。**自分の章の頭文字に置きかえて**、章のファイルの先頭（`\makeatletter … \makeatother` の中）に写してください
（8-0 → `kviiia`、8-2 → `kviiic`、8-3 → `kviiid`、8-4 → `kviiie`、8-5 → `kviiif`、8-6 → `kviiig`、8-7 → `kviiih`、8-8 → `kviiii`、8-9 → `kviiij`、8-10 → `kviiik`、8-11 → `kviiil`、8-12 → `kviiim`、8-13 → `kviiin`、8-14 → `kviiio`）。
置きかえは「`kviiib` → 自分の頭文字」を全部（`kviiib@a` のような内部の名前、`kviiibh` の関数の名前、色の名前もふくめて）。

V8-3 の組が、このファイルのいちばん下（「4. 矢印の場の図」）に矢印の場の部品を追記します。

---

## 0. 主役の山の数（全組共通。brief8-parts 5章の約束1 の再掲。Python で確かめた）

- **主役の山** $h(x,y)=100-0.01x^2-0.02y^2$（m）。$x$ は東へ、$y$ は北へ（m）。頂上は原点 $(0,\ 0)$ で 100 m。
- 高さ0の線（山のふもと）は、東西に $\pm100$ m、南北に $\pm70.71$ m のだ円。高さ $h$ の等高線は
  $0.01x^2+0.02y^2=100-h$ のだ円で、東西の半径 $\sqrt{(100-h)/0.01}$、南北の半径 $\sqrt{(100-h)/0.02}$。

| 高さ $h$（m） | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 東西の半径（m） | 100 | 94.87 | 89.44 | 83.67 | 77.46 | 70.71 | 63.25 | 54.77 | 44.72 | 31.62 |
| 南北の半径（m） | 70.71 | 67.08 | 63.25 | 59.16 | 54.77 | 50.00 | 44.72 | 38.73 | 31.62 | 22.36 |

- **主役の点** $(30,\ 20)$：$h=83$ m（80 m と 90 m の等高線の間）。$\dfrac{\partial h}{\partial x}=-0.6$、$\dfrac{\partial h}{\partial y}=-0.8$、$\mathrm{grad}\,h=(-0.6,\ -0.8)$、大きさ 1.0。
  全微分 $-1.4$（本当は $-1.43$）、体積 $1.11\times10^6$ m³、50 kg で登る仕事 8330 J（brief8-parts 1-5）。
- 8-1 では、等高線は **10 m ごと（主曲線）**、**50 m ごとに太い線（計曲線）** でかく（国土地理院の2万5千分1地形図と同じ決まり：8-1 で説明する）。

---

## 1. 表計算：2次元の表を「地図」として置く

### 1-1 置き方の約束（全組共通）
1. **A列は北（$y$）、1行めは東（$x$）**。A1 は見出し（`$y$＼$x$`）。
2. **北を上にする**：A2 から下へ、$y$ を**大きい順**に入れる（40, 30, 20, 10, 0）。こうすると、表の見た目がそのまま地図（北が上、東が右）になる。
   **そのかわり、行の番号が大きいほど南**になる（ここは本文で1回ことわる）。
3. **B1 から右へ、$x$ を小さい順**に入れる（0, 10, 20, …）。`\bksheet` は7列（A〜G）までなので、$x$ は6つ（B〜G）まで。
4. 高さの式は **B2 に1つだけ**入れ、B2:G6 の全部へコピーする：
   `=100-0.01*B$1^2-0.02*$A2^2`
   - `B$1`：行の番号の前の `$` で「いつも1行めの $x$ を読む」（3-0・2-18 の `$`）。
   - `$A2`：列の文字の前の `$` で「いつもA列の $y$ を読む」。
   - この2つの `$` で、どのマスにコピーしても「そのマスの真上の $x$ と、真横の $y$」を使う。
5. 色：東（$x$）の見出しのマス `kviiibX`（オレンジのうすい色）、北（$y$）の見出しのマス `kviiibY`（緑のうすい色）、注目する点のマス `kviiibP`（黄）。
   **色だけで区別しない**：本文で「E4（$x=30$、$y=20$）」のように番地と座標を両方書く。
6. 画面の上に数式バー `\kviiibfx{セル}{式}` を置く（式の中の `$` は `\$`、`^` は `\^{}`）。
7. **差のとり方（8-2 以降）**：
   - 東への差（同じ行で、右のマス－左のマス）：C2 の東の差は `=C2-B2`。
   - 北への差（同じ列で、**上のマス－下のマス**。上が北だから）：B2 の北の差は `=B2-B3`。
     「下－上」にすると符号が逆になる（まちがえやすいところに入れるとよい）。
   - 差を、マスの間かく（10 m）でわると坂（傾き）：`=(C2-B2)/10`。
8. 合計（8-6 以降）：全部のマスの和は `=SUM(B2:G6)`。行の合計を H列に、列の合計を7行めに置くと「行の合計の合計＝列の合計の合計」が見せられる
   （そのときは `\bksheet{7}` に入らないので、$x$ を5つにする）。

### 1-2 部品（章の先頭の `\makeatletter … \makeatother` の中に）
```latex
\colorlet{kviiibX}{bkOrange!16}\colorlet{kviiibY}{bkGreen!16}\colorlet{kviiibP}{bkYellow!45}
% 表計算の数式バー  \kviiibfx{セル}{式}（式の中の $ は \$、^ は \^{}）
\newcommand\kviiibfx[2]{\tikz[baseline=(f.base)]{\node[draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, font=\sffamily\footnotesize, minimum width=12mm] (c) {#1};
  \node[anchor=west, draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, minimum width=64mm, text width=60mm, align=left, font=\ttfamily\footnotesize] (f) at ([xshift=1mm]c.east) {#2};}}
```

### 1-3 使い方（主役の山の表。8-1 の表と同じ数）
```latex
\begin{bkcenter}
\kviiibfx{B2}{=100-0.01*B\$1\^{}2-0.02*\$A2\^{}2}\par\vspace{1mm}
\bksheet{7}{12}{%
1 & \SetCell{c} $y$＼$x$ & \SetCell{bg=kviiibX} 0 & \SetCell{bg=kviiibX} 10 & \SetCell{bg=kviiibX} 20 & \SetCell{bg=kviiibX} 30 & \SetCell{bg=kviiibX} 40 & \SetCell{bg=kviiibX} 50 \\
2 & \SetCell{bg=kviiibY} 40 & 68 & 67 & 64 & 59 & 52 & 43 \\
3 & \SetCell{bg=kviiibY} 30 & 82 & 81 & 78 & 73 & 66 & 57 \\
4 & \SetCell{bg=kviiibY} 20 & 92 & 91 & 88 & \SetCell{bg=kviiibP} 83 & 76 & 67 \\
5 & \SetCell{bg=kviiibY} 10 & 98 & 97 & 94 & 89 & 82 & 73 \\
6 & \SetCell{bg=kviiibY} 0 & 100 & 99 & 96 & 91 & 84 & 75 \\}
\bktabcaption{…}
\end{bkcenter}
```
- 列のはば 12 mm で、表は約 110 mm。数が小数（83.25 など）なら 13〜14 mm にする（7列×14 mm＋A列の番号で約 125 mm まで入る）。
- 矢印の場（$F_x$ と $F_y$）を表にするときは、**$F_x$ の表と $F_y$ の表を2枚**、同じ置き方（A列が北、1行めが東）で並べる（1つのマスに2つの数を入れない）。

---

## 2. Python の型（bkcode・bkcodeout）

第7巻の型（`tools/kata7.md` の5）をそのまま使う。そのうえで、第8巻では次を決める。

**決まり**
0. **プログラムの枠と実行結果は同じページに**：枠の前に `\Needspace{行数\baselineskip}`。
1. `\begin{bkcode}[Python]` と `\begin{bkcodeout}[実行結果]` の [ ] をかならず書く（numpy の表示は `[` で始まる）。
2. **1行は半角で68字まで（全角は2字と数える）**。こえると枠の中で折り返され、字の間がのびる（試し組みで確かめた）。
   コードを左に、`\#` のコメントを33字めのあたりにそろえ、コメントは全角16字くらいまで。長いコメントは、**コメントだけの行を上に置く**。
3. `#` は `\#`、`_` は `\_`（`set\_aspect`）、`%` は `\%`、`{` `}` は `\{` `\}`。`**`（べき乗）・`*`・`@` はそのまま書ける。
4. **場所の表は `np.meshgrid` で作る**。$y$ は**大きい順**（北が先）に並べる：`y = np.arange(40, -10, -10)`。
   こうすると `print(H)` の表示が、表計算と同じ「北が上」の地図になる。`H[i, j]` は「上から $i$ 行め・左から $j$ 列め（どちらも0から）」。
5. **差は自分でとる**（`np.gradient` は「せいかくに言うと」で名前だけ）。東の差は `H[2, 4] - H[2, 3]`、北の差は `H[1, 3] - H[2, 3]`（上の行－今の行）。
6. **図は matplotlib の `contour`（等高線）・`quiver`（矢印）**。プログラムは短く見せ、出てくる図は**本の形に tikz・pgfplots でかき直して**、すぐ近くに置く。
   図の説明に「Python で出した図を、本の形にかき直したもの」と1回書く。`plt.show()` は図を画面に出す命令。
7. 実行結果は本当に実行して出たものを写す（numpy 2.5・matplotlib 3.11 で確かめた）。高さの表は `68.` のように小数点つきで出る（「`68.` は 68.0 のこと」と1行）。

### 2-1 場所の表を作る（実行結果は 8-1 の表と同じ数）
```latex
\begin{bkcode}[Python]
import numpy as np               \# 数の表の道具 numpy を np として使う
x = np.arange(0, 60, 10)         \# 東へ 0, 10, …, 50（60 は入らない）
y = np.arange(40, -10, -10)      \# 北へ 40, 30, …, 0（北を上に）
X, Y = np.meshgrid(x, y)         \# マスごとの x の表と y の表
H = 100 - 0.01*X**2 - 0.02*Y**2  \# マスごとの高さ（B2 の式と同じ）
print(H)
print(H[2, 3])                   \# 上から2行め・左から3列め（0から）
\end{bkcode}
\begin{bkcodeout}[実行結果]
[[ 68.  67.  64.  59.  52.  43.]
 [ 82.  81.  78.  73.  66.  57.]
 [ 92.  91.  88.  83.  76.  67.]
 [ 98.  97.  94.  89.  82.  73.]
 [100.  99.  96.  91.  84.  75.]]
83.0
\end{bkcodeout}
```

### 2-2 等高線の図
```latex
\begin{bkcode}[Python]
import numpy as np
import matplotlib.pyplot as plt  \# 図をかく道具を plt として使う
x = np.linspace(-100, 100, 201)  \# 1 m ごとに 201 個
y = np.linspace(75, -75, 151)    \# 北が先。1 m ごとに 151 個
X, Y = np.meshgrid(x, y)
H = 100 - 0.01*X**2 - 0.02*Y**2
\# 0, 10, …, 90 m の等高線をかき、線に高さの数字をつける
c = plt.contour(X, Y, H, levels=range(0, 100, 10))
plt.clabel(c)
plt.gca().set\_aspect('equal')   \# 東西と南北の 1 m を同じ長さに
plt.show()
\end{bkcode}
```
（出る図は、3-3 の「等高線の地図」の部品でかき直す。）

### 2-3 矢印の図（矢印の場。V8-3 の部品でかき直す）
```latex
\begin{bkcode}[Python]
import numpy as np
import matplotlib.pyplot as plt
x = np.arange(-2, 3)             \# 東へ -2, -1, 0, 1, 2
y = np.arange(2, -3, -1)         \# 北へ 2, 1, 0, -1, -2（北が先）
X, Y = np.meshgrid(x, y)
U = -Y                           \# 矢印の x 成分（うずの場 (-y, x)）
V = X                            \# 矢印の y 成分
plt.quiver(X, Y, U, V)           \# 点 (X, Y) に矢印 (U, V) をかく
plt.gca().set\_aspect('equal')
plt.show()
\end{bkcode}
```
- `print(U)` とすると、北が上の表で $x$ 成分が見える（1行め（$y=2$）は `[-2 -2 -2 -2 -2]`、5行め（$y=-2$）は `[2 2 2 2 2]`。$U=-Y$ なので北の行ほど負）。
  実行結果を見せるときは、かならず本当に実行して写す（この表示は numpy 2.5 で確かめた）。
  実行結果を見せるときは、かならず本当に実行して写す。
- `quiver` は、矢印の長さを自動で縮めてかく（8-5 の「矢印の長さは本当の長さではない」）。

---

## 3. 主役の山の図（等高線の地図・鳥かん図・点 (30, 20) の印）

### 3-1 部品（章の先頭の `\makeatletter … \makeatother` の中に。1-2 の色もいっしょに）
```latex
% (1) 主役の山の高さ  kviiibh(x, y) = 100 - 0.01x^2 - 0.02y^2（m）。pgfmath の中で kviiibh(30,20) のように使う
\pgfmathdeclarefunction{kviiibh}{2}{\pgfmathparse{100-0.01*(#1)^2-0.02*(#2)^2}}
% (2) 色の名前（表計算のマス・等高線）
\colorlet{kviiibX}{bkOrange!16}\colorlet{kviiibY}{bkGreen!16}\colorlet{kviiibP}{bkYellow!45}
\colorlet{kviiibC}{bkGreen!60!black}
% (3) 図のスタイル
\tikzset{
  kviiib note/.style={font=\sffamily\footnotesize, text=bkRed!75!black, fill=white, inner sep=1pt, align=left},
  kviiib leader/.style={bkRed!75!black, line width=0.6pt, shorten >=1.6mm, shorten <=0.6mm}}
\pgfplotsset{
  kviiib map/.style={bkplot, axis equal image, grid=none, clip=true, axis lines=box, axis line style={-, line width=0.6pt, bkInk},
    xtick distance=20, ytick distance=20, tick align=outside, xlabel={$x$（m）}, ylabel={$y$（m）},
    every axis x label/.style={at={(axis description cs:1,0)}, anchor=north east, yshift=-5.2mm, font=\sffamily\small, text=bkInk},
    every axis y label/.style={at={(axis description cs:0,1)}, anchor=south, yshift=1.2mm, font=\sffamily\small, text=bkInk}},
  kviiib line/.style={kviiibC, line width=0.8pt, no markers, samples=91, domain=0:360},
  kviiib bold/.style={kviiibC, line width=1.6pt, no markers, samples=91, domain=0:360},
  kviiib bird/.style={view={30}{35}, axis lines=none, grid=none, xmin=-115, xmax=115, ymin=-85, ymax=85, zmin=0, zmax=100,
    unit vector ratio=1 1 1, clip=false},
  kviiib surf/.style={surf, shader=flat, draw=kviiibC, line width=0.35pt, samples=11, samples y=37, domain=0:100, y domain=0:360,
    z buffer=sort, colormap={kviiib}{color=(bkGreen!28) color=(bkYellow!50) color=(bkOrange!50)}}}
% (4) 高さ h の等高線（axis の中で）  \kviiibcontour[スタイル]{h}
%     何本もかくときは \pgfplotsinvokeforeach{10,20,...,90}{\kviiibcontour{#1}}（\foreach は使わない）
\newcommand\kviiibcontour[2][kviiib line]{\addplot[#1] ({sqrt((100-(#2))/0.01)*cos(x)},{sqrt((100-(#2))/0.02)*sin(x)});}
% (5) 等高線の高さの数字  \kviiibclabel{h}{だ円の上の角（°）}
\newcommand\kviiibclabel[2]{\pgfmathsetmacro\kviiib@a{sqrt((100-(#1))/0.01)*cos(#2)}\pgfmathsetmacro\kviiib@b{sqrt((100-(#1))/0.02)*sin(#2)}%
  \edef\kviiib@t{\noexpand\node[fill=white, inner sep=0.8pt, font=\noexpand\sffamily\noexpand\footnotesize, text=bkGreen!35!black]
    at (axis cs:\kviiib@a,\kviiib@b) {#1};}\kviiib@t}
% (6) 地図の上の点（赤い丸。名前 kviiibP）  \kviiibpt{x}{y}
\newcommand\kviiibpt[2]{\node[circle, fill=bkRed, draw=white, line width=0.6pt, inner sep=0pt, minimum size=2.6mm] (kviiibP) at (axis cs:#1,#2) {};}
% (7) 鳥かん図：床（高さ0の地図の面）・東と北の矢印・山の面  \kviiibbird{床にかくもの}{面の上にかくもの}
\newcommand\kviiibbird[2]{%
  \draw[bkGray!70, line width=0.5pt, fill=bkGray!8] (axis cs:-115,-85,0) -- (axis cs:115,-85,0) -- (axis cs:115,85,0) -- (axis cs:-115,85,0) -- cycle;
  \draw[-{Stealth[length=2.4mm]}, line width=1pt, bkInk] (axis cs:-115,-85,0) -- (axis cs:-55,-85,0) node[anchor=north west, font=\sffamily\footnotesize, inner sep=1.5pt] {東（$x$）};
  \draw[-{Stealth[length=2.4mm]}, line width=1pt, bkInk] (axis cs:-115,-85,0) -- (axis cs:-115,-35,0) node[anchor=south east, font=\sffamily\footnotesize, inner sep=1.5pt] {北（$y$）};
  #1
  \addplot3[kviiib surf] ({sqrt(1-x/100)*100*cos(y)},{sqrt(1-x/100)*70.71*sin(y)},{x});
  #2}
% (8) 山の面の上の、高さ h の輪（見える所だけ。角 t1〜t2 は 3-4 の表）  \kviiibring[スタイル]{h}{t1}{t2}
\newcommand\kviiibring[4][bkRed, line width=1.6pt]{\addplot3[#1, no markers, samples=60, samples y=0, domain=#3:#4]
  ({sqrt((100-(#2))/0.01)*cos(x)},{sqrt((100-(#2))/0.02)*sin(x)},{#2});}
% (9) 床の上の等高線（山の下にかくれる所は、あとからかく山の面がおおう）  \kviiibfloor[スタイル]{h}
\newcommand\kviiibfloor[2][bkRed!80!black, line width=0.9pt, dash pattern=on 2.5pt off 1.5pt]{\addplot3[#1, no markers, samples=91, samples y=0, domain=0:360]
  ({sqrt((100-(#2))/0.01)*cos(x)},{sqrt((100-(#2))/0.02)*sin(x)},{0});}
% (10) 面の上の点と、床へおろした点線  \kviiibdrop{x}{y}（面の上の点の名前 kviiibP、床の点の名前 kviiibQ）
\newcommand\kviiibdrop[2]{\pgfmathsetmacro\kviiib@z{kviiibh(#1,#2)}%
  \edef\kviiib@t{\noexpand\draw[bkRed!80!black, line width=0.8pt, dash pattern=on 2pt off 1.5pt] (axis cs:#1,#2,0) -- (axis cs:#1,#2,\kviiib@z);
  \noexpand\node[circle, fill=bkRed!80!black, inner sep=0pt, minimum size=1.8mm] (kviiibQ) at (axis cs:#1,#2,0) {};
  \noexpand\node[circle, fill=bkRed, draw=white, line width=0.6pt, inner sep=0pt, minimum size=2.6mm] (kviiibP) at (axis cs:#1,#2,\kviiib@z) {};}\kviiib@t}
% (11) 表計算の数式バー（1-2 と同じ）
```

### 3-2 等高線の地図（山全体。はば 120 mm で高さ約 95 mm）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\begin{axis}[kviiib map, width=120mm, xmin=-100, xmax=100, ymin=-75, ymax=75]
  \pgfplotsinvokeforeach{10,20,30,40,60,70,80,90}{\kviiibcontour{#1}}
  \kviiibcontour[kviiib bold]{0}\kviiibcontour[kviiib bold]{50}
  \pgfplotsinvokeforeach{0,50,80,90}{\kviiibclabel{#1}{125}}
  \node[font=\sffamily\footnotesize, fill=white, inner sep=1pt] at (axis cs:0,0) {▲100};
  \kviiibpt{30}{20}
  \node[kviiib note, anchor=north east] (n) at (axis cs:98,73) {点 $(30,\ 20)$\\高さ 83 m};
  \draw[kviiib leader] (n.south west) -- (kviiibP);
\end{axis}
\end{tikzpicture}
\bkfigcaption{…}
\end{bkfigure}
```
- **点 (30, 20) の印**：`\kviiibpt{30}{20}`（赤い丸）。ことばは丸のすぐ横に置かず、**等高線のない所（右上のすみ）に置いて、引き出し線** `kviiib leader` で結ぶ（字が線にかからない）。`kviiib map` は `clip=true` なので、**ことばもわくの外へ出ると切れる**。右上のすみに置くときは `anchor=north east` で $(98,\ 73)$ のように、わくの内側に置く。
- 高さの数字 `\kviiibclabel{h}{角}` は、だ円の上の角（東が0°、北が90°）で置く場所を決める。白い地をしいて線を切る（地図と同じ）。全部の線に数字をつけると、外側では線の間が 2 mm くらいしかなく字がつまるので、**太い線（0・50）と、注目する線だけ**につける。
- 頂上は `▲100`（地形図の三角点の印ににせた形）。
- `\pgfplotsinvokeforeach` の中では、`#1` がその回の高さになる。

### 3-3 一部を大きくした地図（点 (30, 20) のまわり。はば 110 mm で高さ約 85 mm）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\begin{axis}[kviiib map, width=110mm, xmin=0, xmax=70, ymin=0, ymax=50, xtick distance=10, ytick distance=10]
  \pgfplotsinvokeforeach{60,70,90}{\kviiibcontour{#1}}
  \kviiibcontour[kviiib bold]{50}\kviiibcontour[kviiib line, bkRed, line width=1.4pt]{80}
  \pgfplotsinvokeforeach{50,60,70,80,90}{\kviiibclabel{#1}{75}}
  \kviiibpt{30}{20}
  \node[kviiib note, anchor=south west] at ([xshift=1mm, yshift=0.6mm]kviiibP.north east) {$(30,\ 20)$\quad 83 m};
\end{axis}
\end{tikzpicture}
\bkfigcaption{…}
\end{bkfigure}
```
- `kviiib map` は **`clip=true`**（地図のわくの外の線は切る）。わくの外に字を置きたいときは、`\end{axis}` のあとに `\node` を書く。
- この例の点のことばは 80 m の線にふれる。本文で使うときは、置く向き（`anchor`）とずらし（`xshift`・`yshift`）を変えて、**線から 1.5 mm 以上**はなす（8-1 の本文では左上に置いた）。
- 1 m の長さは東西と南北で同じ（`axis equal image`）。かえないこと（等高線がつぶれて見え、坂の急さをまちがえる）。

### 3-4 鳥かん図（山を南東の空から見下ろした図。はば 110 mm で高さ約 70 mm）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\begin{axis}[kviiib bird, width=110mm]
  \kviiibbird{}{\kviiibring{80}{166}{418}\kviiibdrop{30}{20}
    \node[kviiib note, anchor=west] (n) at (axis cs:60,20,100) {点 $(30,\ 20)$ の上\\高さ 83 m};
    \draw[kviiib leader] (n.west) -- (kviiibP);}
\end{axis}
\end{tikzpicture}
\bkfigcaption{…（点線は、山の中をかくれて通る線）}
\end{bkfigure}
```
- 見る向きは `view={30}{35}`（南東の空、35° 見下ろす）。このとき、**東（$x$）は右下へ、北（$y$）は右上の奥へ**のびる。床の左手前のかどに「東（$x$）」「北（$y$）」の矢印が出る。点 $(30,\ 20)$ の面は、この向きから見える。
- 縮尺は、東西・南北・高さとも同じ（`unit vector ratio=1 1 1`）。山はすそほど急（ふもとの坂は東西で 2、南北で 2.83）なので、ドームのような形に見える。高さを強調したいときも、`unit vector ratio` は変えず、図の説明でことわる。
- 山の面の線：横の輪が 10 m ごとの等高線（`samples=11` で 0, 10, …, 100 m）、たての線は 10° ごと。
- **面の上の輪は、見える所だけかく**：`\kviiibring{h}{t1}{t2}`。$t$ はだ円の上の角（東が0°、北が90°）。この向きで見える範囲（Python で、面の向きと見る向きの内積の符号で求めた）：

| 高さ $h$（m） | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| t1〜t2（°） | 188〜397 | 187〜398 | 186〜399 | 185〜400 | 183〜402 | 181〜404 | 178〜406 | 174〜411 | 166〜418 | 146〜439 |

  （山は上に向かってふくらんだ形なので、「面が見る人のほうを向いている所」がそのまま見える所。点 $(30,\ 20)$ は $t=43°$ で見える。）
- 床（高さ0の面）にかくものは、`\kviiibbird` の1つめの { } に書く（あとからかく山の面が、山の下の部分をおおう）。面の上にかくもの（輪・点・ことば）は2つめの { } に書く。
- `\kviiibdrop{x}{y}`：面の上の点（赤い丸 kviiibP）と、床の点（kviiibQ）を点線で結ぶ。**この点線は山の中を通る**ので、図の説明に「点線は山の中をかくれて通る線」と書く。
- 1つの図の中に `\kviiibbird` は1回だけ。試し組みは1回 30 秒ほど（面の計算がある）。
- **3次元の線（輪・床の線）を `\addplot3` でかくときは、かならず `samples y=0`** を入れる（入れないと pgfplots が面としてかき、輪の両はしが直線で結ばれる。試し組みで起きた。部品には入れてある）。

---

## 4. 矢印の場の図（V8-3 が追記する）

組 V8-3 が作り、`tex/ch8-04.tex`・`tex/ch8-05.tex` の先頭に置いて試し組みしました（**エラー0・はみ出し0**。8-4・8-5 の本文で同じ形で使っています）。
古い見本 `tex/ch8-9.tex` の `\fieldpanel` を作り直したものです。部品の名前の頭文字 `kviiie` は 8-4 のものです。
**自分の章の頭文字に置きかえて**（`kviiie` → 自分の頭文字を全部。pgfkeys の `/kviiie/` も同時に置きかわる）、章のファイルの先頭に写してください。

### 4-1 色と線の約束（全組共通。主役の山の図（3章）と同じ色にそろえた）

第8巻の巻の色（濃い紺 bkVol8）は bkBlue・bkNavy とにているので、**色だけで区別しない**。色・太さ・線の形・名前の4つを変える。

| 役 | スタイル | 色 | 線 | 図・本文での呼び方 |
| --- | --- | --- | --- | --- |
| 場の矢印（ふつうの矢印の場） | `kviiie field` | `\bkTT`（巻の濃い紺） | 0.9pt 実線、小さな矢じり | 「矢印」「紺の矢印」 |
| 勾配 grad（いちばん急な上り） | `kviiie grad` | `bkRed!85!black` | 1.5pt 実線、大きな矢じり | 「赤い矢印」 |
| $-\mathrm{grad}$（下り・ボール・熱や電場の向き） | `kviiie down` | `bkOrange!85!black` | 1.5pt **点線**、大きな矢じり | 「オレンジの点線の矢印」 |
| 等高線・等値線（高さ・温度・電位・気圧） | `kviiie contour` | `bkGreen!60!black`（3章の `kviiibC` と同じ） | 0.8pt 実線（数字は白地、字は `bkGreen!35!black`） | 「緑の線」 |
| 流線・力線（矢印をつないだ線） | `kviiie stream` | `bkPurple` | 1.1pt 実線、まん中に矢じり1つ | 「むらさきの線」 |
| その場所の点 | `kviiie pt` | `bkInk!75` | 半径 0.42 mm の黒い点 | 「根もとの黒い点」 |
| 場が0の場所 | `kviiie zero` | 白ぬきの丸 | 半径 0.6 mm | 「白い丸（長さ0）」 |
| わき出し・正の電荷 | `\filldraw[fill=bkOrange, draw=bkInk]` の丸 | オレンジ | | 名前（わき出し・＋）を必ずそえる |
| 吸いこみ・負の電荷 | `\filldraw[fill=bkBlue!60, draw=bkInk]` の丸 | 青 | | 名前（吸いこみ・－）を必ずそえる |
| わく・方眼・0の線 | `kviiie frame`・`kviiie gridline` | `bkLine` | 0.4〜0.6pt | |

- 主役の山の地図に矢印を重ねるときは、等高線を3章の型（10 m ごと、緑）でかき、矢印はこの表の色で。主役の点の印は3章の赤い丸、ボールの絵は黄色の丸でもよい。
- 図の中の字は `\footnotesize` 以上（`kviiie lab`・`kviiie tick` は \footnotesize の sans）。ラベルの字は bkInk か `\bkTT`、色をつけるときは濃くした色（`bkRed!80!black`、`bkOrange!75!black`、`bkGreen!45!black`）。
- 矢印と字・目もりの数のあいだは 1.5 mm 以上。**目もりの数は、わくの外**（`\kviiieframe`）に置く。

### 4-2 矢印の長さの決まり（全組共通）

1. **矢印の長さ＝場の大きさ × scale**（scale は「場の大きさ1を、座標の何目もりにかくか」）。1つの図の中では scale を変えない（`\kviiieset{scale=…}` を tikzpicture の中で1回）。
2. **いちばん長い矢印が、格子のきざみ（step）の 0.8 倍くらい**になるように scale を決める（例：最大の大きさ 4.2、step 1 なら scale＝0.2）。となりの矢印と重ねない。
3. **凡例（物差しの矢印）を必ずつける**：`\kviiiekey{(x,y)}{1}{＝\qty{1}{m/s}}`。本文かキャプションで1回「矢印は同じ割合で縮めてかいてある」と言う（8-5 ②・まちがえやすいところ②）。
4. 根もと：**大きな図は `pivot=tail`（根もとの黒い点がその場所）**、小さな図（`\kviiiepanel`・`\kviiiepanelS`）は `pivot=mid`（まん中がその場所）。8-5 ②で「根もとがその矢印の場所」と教えてある。
5. $1/r^2$ のように大きさがとても変わる場は、`skip` で中心の近くを飛ばし、大きさは表で見せる（8-5 ⑥）。

### 4-3 部品（章のファイルの先頭に写す）

```latex
\usetikzlibrary{decorations.markings}
\makeatletter
% ==== 矢印の場の図の部品（kata8 の型。頭文字 kviiie は 8-4）====
\tikzset{
  kviiie field/.style={draw=\bkTT, line width=0.9pt, line cap=round, -{Stealth[length=2.0mm, width=1.7mm]}},
  kviiie grad/.style={draw=bkRed!85!black, line width=1.5pt, line cap=round, -{Stealth[length=2.8mm, width=2.2mm]}},
  kviiie down/.style={draw=bkOrange!85!black, line width=1.5pt, line cap=round, dash pattern=on 2.4pt off 1.2pt, -{Stealth[length=2.8mm, width=2.2mm]}},
  kviiie contour/.style={draw=bkGreen!60!black, line width=0.8pt},
  kviiie stream/.style={draw=bkPurple, line width=1.1pt, line cap=round, postaction={decorate},
    decoration={markings, mark=at position 0.55 with {\arrow{Stealth[length=2.4mm, width=2mm]}}}},
  kviiie pt/.style={fill=bkInk!75},
  kviiie zero/.style={draw=bkInk!75, fill=white, line width=0.6pt},
  kviiie frame/.style={draw=bkLine, line width=0.6pt},
  kviiie gridline/.style={draw=bkLine, line width=0.4pt},
  kviiie lab/.style={font=\sffamily\footnotesize, text=bkInk, inner sep=1pt},
  kviiie tick/.style={font=\sffamily\footnotesize, text=bkInk, inner sep=0pt},
}
% 設定  \kviiieset{xmin=-2, xmax=2, ymin=-2, ymax=2, step=1, scale=0.4, pivot=tail}
\pgfkeys{/kviiie/.is family, /kviiie,
  xmin/.initial=-2, xmax/.initial=2, ymin/.initial=-2, ymax/.initial=2, step/.initial=1,
  scale/.initial=0.4, pivot/.initial=tail, skip/.initial=0, min/.initial=0.03,
  arrow/.initial={kviiie field}, dot/.initial=1}
\newcommand\kviiieset[1]{\pgfkeys{/kviiie,#1}}
\def\kviiie@get#1{\pgfkeysvalueof{/kviiie/#1}}
% 矢印の場  \kviiiefield[設定]{F_x の式}{F_y の式}（式は \x, \y で書く。三角関数の角は度）
%   矢印の長さ＝場の大きさ×scale（座標の目もりで）。pivot=tail：根もとがその場所（点をうつ）、mid：まん中がその場所
%   場が0の所（長さが min より短い）は、白ぬきの丸。skip の式が1になる所はかかない（例：skip={\x*\x+\y*\y<0.1}）
\newcommand\kviiiefield[3][]{{%
  \kviiieset{#1}%
  \pgfmathsetmacro\kviiie@xa{\kviiie@get{xmin}}\pgfmathsetmacro\kviiie@ya{\kviiie@get{ymin}}%
  \pgfmathsetmacro\kviiie@st{\kviiie@get{step}}\pgfmathsetmacro\kviiie@sc{\kviiie@get{scale}}%
  \pgfmathtruncatemacro\kviiie@nx{round((\kviiie@get{xmax}-\kviiie@xa)/\kviiie@st)}%
  \pgfmathtruncatemacro\kviiie@ny{round((\kviiie@get{ymax}-\kviiie@ya)/\kviiie@st)}%
  \edef\kviiie@pv{\kviiie@get{pivot}}\def\kviiie@mid{mid}%
  \foreach \kviiie@i in {0,...,\kviiie@nx} {\foreach \kviiie@j in {0,...,\kviiie@ny} {%
    \pgfmathsetmacro\x{\kviiie@xa+\kviiie@i*\kviiie@st}\pgfmathsetmacro\y{\kviiie@ya+\kviiie@j*\kviiie@st}%
    \pgfmathtruncatemacro\kviiie@sk{(\kviiie@get{skip}) ? 1 : 0}%
    \ifnum\kviiie@sk=0
      \pgfmathsetmacro\kviiie@u{(#2)*\kviiie@sc}\pgfmathsetmacro\kviiie@w{(#3)*\kviiie@sc}%
      \pgfmathtruncatemacro\kviiie@ok{veclen(\kviiie@u,\kviiie@w)>\kviiie@get{min} ? 1 : 0}%
      \ifnum\kviiie@ok=1
        \ifx\kviiie@pv\kviiie@mid
          \draw[style/.expanded=\kviiie@get{arrow}] ({\x-\kviiie@u/2},{\y-\kviiie@w/2}) -- ++(\kviiie@u,\kviiie@w);%
        \else
          \draw[style/.expanded=\kviiie@get{arrow}] (\x,\y) -- ++(\kviiie@u,\kviiie@w);%
          \ifnum\kviiie@get{dot}=1 \fill[kviiie pt] (\x,\y) circle[radius=0.42mm];\fi
        \fi
      \else
        \filldraw[kviiie zero] (\x,\y) circle[radius=0.6mm];%
      \fi
    \fi}}}}
% 凡例（矢印の長さの物差し）  \kviiiekey[設定]{(x,y)}{場の大きさ}{ことば}  例：\kviiiekey{(2.4,-2)}{1}{＝\qty{1}{m/s}}
\newcommand\kviiiekey[4][]{{%
  \kviiieset{#1}\pgfmathsetmacro\kviiie@sc{\kviiie@get{scale}}%
  \pgfmathsetmacro\kviiie@u{(#3)*\kviiie@sc}%
  \draw[style/.expanded=\kviiie@get{arrow}] #2 -- ++(\kviiie@u,0) coordinate (kviiie@keyend);
  \node[kviiie lab, anchor=west] at ([xshift=1.5mm]kviiie@keyend) {#4};}}
% 方眼  \kviiiegrid[きざみ]{xmin}{xmax}{ymin}{ymax}
\newcommand\kviiiegrid[5][1]{\draw[kviiie gridline, step=#1] (#2,#4) grid (#3,#5);}
% 軸（O・x・y の字つき）  \kviiieaxes{xmin}{xmax}{ymin}{ymax}{x の名前}{y の名前}
\newcommand\kviiieaxes[6]{%
  \draw[bkInk, line width=0.7pt, -{Stealth[length=2.2mm]}] (#1,0) -- (#2,0) node[kviiie lab, anchor=west, xshift=0.6mm] {#5};
  \draw[bkInk, line width=0.7pt, -{Stealth[length=2.2mm]}] (0,#3) -- (0,#4) node[kviiie lab, anchor=south, yshift=0.6mm] {#6};}
% 目もりの数（軸から 1.5 mm はなす）  \kviiieticks{x の目もりの並び}{y の目もりの並び}
\newcommand\kviiieticks[2]{%
  \foreach \kviiie@t in {#1} {\draw[bkInk, line width=0.5pt] (\kviiie@t,0) -- ++(0,-0.8mm);
    \node[kviiie tick, anchor=north] at ([yshift=-2.3mm]\kviiie@t,0) {$\kviiie@t$};}
  \foreach \kviiie@t in {#2} {\draw[bkInk, line width=0.5pt] (0,\kviiie@t) -- ++(-0.8mm,0);
    \node[kviiie tick, anchor=east] at ([xshift=-2.3mm]0,\kviiie@t) {$\kviiie@t$};}}
% 流線・力線（矢印をつないだ線）  \kviiiestream[線の形]{F_x}{F_y}{x0,y0}{歩数}{1歩の長さ}
%   (x0,y0) から、場の向きに1歩ずつ進んだ点を結ぶ（2次のルンゲ・クッタ。1歩の長さは座標の目もりで）。歩数を負にすると逆向きにたどる
\newcommand\kviiiestream[6][]{{%
  \pgfmathsetmacro\kviiie@h{#6}\pgfmathtruncatemacro\kviiie@n{abs(#5)}%
  \pgfmathsetmacro\kviiie@sg{#5<0 ? -1 : 1}%
  \def\kviiie@xy##1,##2\relax{\pgfmathsetmacro\kviiie@nx{##1}\pgfmathsetmacro\kviiie@ny{##2}%
    \xdef\kviiie@px{\kviiie@nx}\xdef\kviiie@py{\kviiie@ny}}\kviiie@xy#4\relax
  \xdef\kviiie@path{(\kviiie@px,\kviiie@py)}%
  \foreach \kviiie@k in {1,...,\kviiie@n} {%
    \pgfmathsetmacro\x{\kviiie@px}\pgfmathsetmacro\y{\kviiie@py}%
    \pgfmathsetmacro\kviiie@u{#2}\pgfmathsetmacro\kviiie@w{#3}\pgfmathsetmacro\kviiie@L{max(veclen(\kviiie@u,\kviiie@w),1e-6)}%
    \pgfmathsetmacro\x{\kviiie@px+0.5*\kviiie@sg*\kviiie@h*\kviiie@u/\kviiie@L}\pgfmathsetmacro\y{\kviiie@py+0.5*\kviiie@sg*\kviiie@h*\kviiie@w/\kviiie@L}%
    \pgfmathsetmacro\kviiie@u{#2}\pgfmathsetmacro\kviiie@w{#3}\pgfmathsetmacro\kviiie@L{max(veclen(\kviiie@u,\kviiie@w),1e-6)}%
    \pgfmathsetmacro\kviiie@nx{\kviiie@px+\kviiie@sg*\kviiie@h*\kviiie@u/\kviiie@L}\pgfmathsetmacro\kviiie@ny{\kviiie@py+\kviiie@sg*\kviiie@h*\kviiie@w/\kviiie@L}%
    \xdef\kviiie@px{\kviiie@nx}\xdef\kviiie@py{\kviiie@ny}%
    \xdef\kviiie@path{\kviiie@path -- (\kviiie@px,\kviiie@py)}}%
  \draw[kviiie stream, #1] \kviiie@path;}}
% わくと目もり（場の図の目もりは、わくの外に置く。矢印と数字が重ならない）
%   \kviiieframe[わくのゆとり]{xmin}{xmax}{ymin}{ymax}{x の目もりの並び}{y の目もりの並び}{x の名前}{y の名前}
%   わくは、いちばん外の格子点からゆとり（目もりの数。ふつう 0.5、外向きの長い矢印があるときは 0.9）だけ外にかく。0の線（軸）はうすい線
\newcommand\kviiieframe[9][0.5]{%
  \draw[kviiie frame, fill=white] ({#2-#1},{#4-#1}) rectangle ({#3+#1},{#5+#1});
  \draw[bkLine, line width=0.6pt] ({#2-#1},0) -- ({#3+#1},0) (0,{#4-#1}) -- (0,{#5+#1});
  \foreach \kviiie@t in {#6} {\draw[bkInk, line width=0.5pt] (\kviiie@t,{#4-#1}) -- ++(0,-0.9mm);
    \node[kviiie tick, anchor=north] at ([yshift=-2.4mm]\kviiie@t,{#4-#1}) {$\kviiie@t$};}
  \foreach \kviiie@t in {#7} {\draw[bkInk, line width=0.5pt] ({#2-#1},\kviiie@t) -- ++(-0.9mm,0);
    \node[kviiie tick, anchor=east] at ([xshift=-2.4mm]{#2-#1},\kviiie@t) {$\kviiie@t$};}
  \node[kviiie lab, anchor=north west] at ([xshift=2mm, yshift=-2.4mm]{#3+#1},{#4-#1}) {#8};
  \node[kviiie lab, anchor=south east] at ([xshift=-2.4mm, yshift=1.5mm]{#2-#1},{#5+#1}) {#9};}
% 小さな場の図  \kviiiepanel[設定]{F_x}{F_y}{図に足すもの}{下のことば}（-2〜2 の格子、1目もり 6 mm、わくつき）
\newcommand\kviiiepanel[5][]{%
  \begin{tikzpicture}[x=6mm, y=6mm, baseline=(current bounding box.north)]
    \draw[kviiie frame, fill=white] (-2.6,-2.6) rectangle (2.6,2.6);
    \draw[bkLine, line width=0.5pt] (-2.6,0) -- (2.6,0) (0,-2.6) -- (0,2.6);
    \kviiiefield[pivot=mid, dot=0, #1]{#2}{#3}
    #4
    \node[kviiie lab, anchor=north, align=center, text width=36mm, font={\sffamily\footnotesize\baselineskip=13pt}] at (0,-2.85) {#5};
  \end{tikzpicture}}
% 小さな場の図（下のことばを1行に。1目もり 5 mm。8-5 の主役の6つの場で使った形）  \kviiiepanelS[設定]{F_x}{F_y}{図に足すもの}{下のことば}
\newcommand\kviiiepanelS[5][]{%
  \begin{tikzpicture}[x=5mm, y=5mm, baseline=(current bounding box.north)]
    \draw[kviiie frame, fill=white] (-2.6,-2.6) rectangle (2.6,2.6);
    \draw[bkLine, line width=0.5pt] (-2.6,0) -- (2.6,0) (0,-2.6) -- (0,2.6);
    \kviiiefield[pivot=mid, dot=0, #1]{#2}{#3}
    #4
    \node[kviiie lab, anchor=north] at (0,-2.85) {#5};
  \end{tikzpicture}}
\makeatother
```
- `decorations.markings` は流線の矢じりのため（bk-b5.sty にはない。章のファイルの先頭に書く）。
- 式は pgfmath で書く。`\x`・`\y` がその場所の座標。**三角関数の角は度**（ラジアンなら `sin(\x r)`）。べき乗は `pow(\x,2)` か `\x^2`、大きさは `veclen(\x,\y)`。0でわる所は `skip` で飛ばす。2つの条件は `skip={or(条件1, 条件2)}`。
- `\foreach` の中で部品を使うときは、中身を `{ }` でかこむ。ループの変数は `\kviiiea` のように章の頭文字つきの名前にする（`\x`・`\y` は部品が使う）。

### 4-4 使い方の例（試し組み済み）

**(a) 大きな場の図（わく・目もり・凡例つき）**：8-5 図5・図6
```latex
\begin{bkfigure}
\begin{tikzpicture}[x=9mm, y=9mm]
  \kviiieset{xmin=-3, xmax=3, ymin=-3, ymax=3, step=1, scale=0.22}
  \kviiieframe[0.9]{-3}{3}{-3}{3}{-3,-2,-1,0,1,2,3}{-3,-2,-1,0,1,2,3}{$x$（m）}{$y$（m）}
  \kviiiefield{-\y}{\x}
  \kviiiestream{-\y}{\x}{2,0}{130}{0.1}
  \kviiiekey{(4.3,-3)}{1}{＝\qty{1}{m/s}}
\end{tikzpicture}
\bkfigcaption{うずの場 $(-y,\ x)$。矢印の根もとの点が、その矢印の場所。}
\label{bk:8-N:fig-uzu}
\end{bkfigure}
```
- `\kviiieframe[ゆとり]{xmin}{xmax}{ymin}{ymax}{x の目もり}{y の目もり}{x の名前}{y の名前}`：わくは、いちばん外の格子点から「ゆとり」だけ外に（ふつう 0.5、外向きの長い矢印があるときは 0.9）。

**(b) 主役の6つの場（5章の約束。名前と順番は 8-5 で決めた）**：8-5 図2
```latex
\begin{bkfigure}
\begin{tabular}{@{}c@{\hspace{9mm}}c@{\hspace{9mm}}c@{}}
\kviiiepanelS[scale=0.28]{\x}{\y}{}{（ア）広がる $(x,\ y)$} &
\kviiiepanelS[scale=0.28]{-\x}{-\y}{}{（イ）集まる $(-x,\ -y)$} &
\kviiiepanelS[scale=0.56]{1}{0}{}{（ウ）そろった $(1,\ 0)$} \\[1mm]
\kviiiepanelS[scale=0.28]{-\y}{\x}{}{（エ）うず $(-y,\ x)$} &
\kviiiepanelS[scale=0.28]{\y}{0}{}{（オ）ずれ $(y,\ 0)$} &
\kviiiepanelS[scale=0.28]{\x}{0}{}{（カ）側溝 $(x,\ 0)$} \\
\end{tabular}
\bkfigcaption{主役の6つの場。どの図も同じ割合で縮めてある（（ウ）だけは2倍の割合）。}
\end{bkfigure}
```
- 8-7・8-9・8-10・8-11 では「8-5 の（エ）うず」のように、記号と名前で指す。1つずつ使うときは `\kviiiepanel`（1目もり 6 mm、下のことば2行）か `\kviiiepanelS`。
- 図に何かを足すときは3つめの引数に（点線のマス：`\draw[bkOrange!85!black, line width=1.2pt, dash pattern=on 3pt off 2pt] (-0.5,-0.5) rectangle (0.5,0.5);`、流線：`\kviiiestream{-\y}{\x}{1.5,0}{100}{0.1}`）。
- 4つ以上を1段に並べない（132 mm をこえる）。

**(c) 中心で大きくなる場（点電荷・わき出し）**：8-5 図6
```latex
\kviiieset{xmin=-3, xmax=3, ymin=-3, ymax=3, step=1, scale=0.85, skip={\x*\x+\y*\y<0.1}}
\foreach \kviiiea in {0,30,...,330} {\kviiiestream{\x/pow(\x*\x+\y*\y,1.5)}{\y/pow(\x*\x+\y*\y,1.5)}{{0.3*cos(\kviiiea)},{0.3*sin(\kviiiea)}}{30}{0.1}}
\kviiiefield{\x/pow(\x*\x+\y*\y,1.5)}{\y/pow(\x*\x+\y*\y,1.5)}
\filldraw[fill=bkOrange, draw=bkInk, line width=0.5pt] (0,0) circle[radius=1.6mm];
```

**(d) 池（8-5・8-9・8-11。わき出し S (1.5, 2.5)、吸いこみ K (4.5, 1.5)、Q＝4 m²/s）**：8-5 図4
```latex
\begin{tikzpicture}[x=15mm, y=15mm]
  \kviiieset{xmin=0.25, xmax=5.75, ymin=0.25, ymax=3.75, step=0.5, scale=0.2}
  \fill[bkBlue!6] (0,0) rectangle (6,4);
  \kviiiefield{0.6366*((\x-1.5)/((\x-1.5)^2+(\y-2.5)^2)-(\x-4.5)/((\x-4.5)^2+(\y-1.5)^2))}{0.6366*((\y-2.5)/((\x-1.5)^2+(\y-2.5)^2)-(\y-1.5)/((\x-4.5)^2+(\y-1.5)^2))}
  \draw[bkGray, line width=0.8pt] (0,0) rectangle (6,4);
\end{tikzpicture}
```
- 0.6366 は $Q/(2\pi)=4/(2\pi)$。格子をマスのまん中（0.25 からはじめて 0.5 ごと）にすると、S・K の上に点が来ない。わき出しのマス $[1,2]\times[2,3]$ の4辺から出る量は 右1.218・左0.833・上0.914・下1.035、合計 4.000（Python で確かめた。古い見本の数と同じ）。
- 流線（S から K へ）は Python で計算した点を `\draw[kviiie stream] (…) -- (…) …;` で写したもの（`tex/ch8-05.tex` の `\kviiifpondlines`）。古い見本の `ch8-9-data.tex` の矢印は、長さを別の割合で縮めてあるので、この部品の図とまぜない。

**(e) 等高線と勾配（主役の山）**：8-4 図1・図3
- 主役の山の地図に $-\mathrm{grad}\,h$ の場を重ねる：`\kviiiefield[arrow={kviiie field, draw=bkOrange!85!black, line width=1.1pt}]{0.02*\x}{0.04*\y}`（`arrow=` で矢印のスタイルを変えられる）。
- 1点の grad は `\draw[kviiie grad] (P) -- ++(…);`、ボールの向きは `\draw[kviiie down] (P) -- ++(…);`。直角の印は 8-4 の `\kviiieright`。

**(f) 流線** `\kviiiestream[線の形]{F_x}{F_y}{x0,y0}{歩数}{1歩の長さ}`
- 出発点から、場の向きに1歩ずつ進んだ点を結ぶ（2次のルンゲ・クッタ。6-2 のオイラー法の改良版）。歩数を負にすると逆向きにたどる。1歩は 0.05〜0.1 目もり、1本100歩くらいまで。
- 閉じた流線（うずの円）は `\draw[kviiie stream] (0,0) circle (r);` でもよい。込み入った力線（棒磁石など）は Python で計算して点を写す（8-5 の `\kviiifdipole`）。

### 4-5 Python で同じ図をかくとき
- 2章 2-3 の `quiver` の型を使う。紙面の図は、この部品で tikz にかき直す（Python の画像は貼らない）。
- `quiver(x, y, Fx, Fy, angles='xy', scale_units='xy', scale=s)` は「大きさ s の矢印を1目もりにかく」（8-5 ⑤で説明）。この部品の `scale` は「大きさ1を何目もりにかくか」なので、$\text{scale}=1/s$ が同じ図になる。
