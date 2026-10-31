# 第7巻の「型」（組 V7-1 が決めて配る。10月29日）

ほかの組は、この型をそのまま使ってください。下の例は、すべて `tex/ch7-01.tex` の中で試し組みして、
**エラー0・はみ出し0** で組めることを確かめてあります（7-1 の本文でも同じ形で使っています）。
部品の名前の頭文字 `kviib` は 7-1 のものです。**自分の章の頭文字に置きかえて**、章のファイルの先頭に写してください
（7-2 → `kviic`、7-3 → `kviid`、7-4 → `kviie`、7-5 → `kviif`、7-6 → `kviig`、7-7 → `kviih`、7-8 → `kviii`、7-9 → `kviij`、7-10 → `kviik`、7-11 → `kviil`）。

---

## 1. 行列とベクトルの組み方

### 1-1 行列・ベクトルは別の行（\[ \]）に立てる
- 文中（`$ $` の中）に `\begin{pmatrix}` を置かない（行の字の間がのびる）。かならず別の行に：
```latex
\[ A=\begin{pmatrix} 2 & 1\\ 1 & 2 \end{pmatrix} \]
\[ \vec x=\begin{pmatrix} x\\ y \end{pmatrix},\qquad A\vec x=\begin{pmatrix} 2x+y\\ x+2y \end{pmatrix} \]
```
- かっこはいつも **丸かっこ `pmatrix`**（`bmatrix` の角かっこは使わない。行列式の `vmatrix` は 7-4 で「専門書の書き方」として見せるときだけ）。
- 成分の間は `&`、行の終わりは `\\`。行列の中の負の数は `-1`（`$-1$` の中の負号）。分数の成分は `\frac13` ではなく `\dfrac{1}{3}`、または外にくくり出す：`\dfrac{1}{3}\begin{pmatrix} 2 & -1\\ -1 & 2 \end{pmatrix}`。
- 小数の成分は小数第3位まで（物理 力-7 と同じ）。途中で丸めたときは「小さなちがいは丸めのため」と1行。
- 行列×ベクトル、行列×行列は、記号を並べるだけ（`A\vec x`、`AB`）。`\cdot` や `\times` は入れない。

### 1-2 文字と記号（委員会の決定）
| もの | 書き方 | 例 |
| --- | --- | --- |
| 行列 | 細字の大文字 | `$A$`、`$R(\theta)$`、`$J$`、`$K$` |
| ベクトル | 矢印 `\vec`、成分は**たて書き** | `$\vec x$`、`$\vec b$`、`$\vec 0$` |
| 成分 | 小文字に下つき2つ（**行が先、列があと**） | `$a_{12}$`（1行め2列め）、`$a_{ij}$`（$i$ 行め $j$ 列め） |
| 転置 | 立てたサンセリフの T | `$A^{\mathsf T}$` |
| 単位行列・零行列 | `$I$`・`$O$` | `$AI=IA=A$` |
| 行列式・逆行列 | `$\det A$`・`$A^{-1}$` | |
| 大きさ | 「2×2 行列」「2行3列の行列」 | `$2\times3$` 行列 |

- **太字**：この本は unicode-math なので `\boldsymbol` は太字にならない。太字のベクトル・行列（専門書の書き方を見せるとき）は `\symbf{x}`・`\symbf{A}`、太字のギリシャ文字や斜体の太字は `\symbfit{\sigma}`・`\symbfit{n}` を使う（物理 力-9 の応力の行列は `\symbfit{\sigma}`）。
- 文中で成分を言うときは「1行め2列めの成分 $a_{12}$」のように、ことばと記号を両方。7-1 で「$a_{21}$ は2行め1列め（すいようびの2時間め＝行が先）」と教えている。
- 文中でベクトルを言うときは `$(x,\ y)$` も使ってよい（7-1・7-2 で「同じもの」と見せる）。
- numpy は列ベクトルも横1行で表示する（3-3 を見る）。

---

## 2. 「行と列をなぞる」図（行列の積の型）

**色の約束（全組共通）**
| 役 | 色 | 塗り | 字に色をつけるとき |
| --- | --- | --- | --- |
| 行（よこ） | オレンジ | `bkOrange!20`、わく `bkOrange!80!black` | `\textcolor{bkOrange!80!black}{2}` |
| 列（たて） | 青 | `bkBlue!14`、わく `bkBlue!80!black` | `\textcolor{\bkTT}{120}` |
| 答えの成分（行と列が出会う所） | 緑 | `bkGreen!20`、わく `bkGreen!60!black` | `\textcolor{bkGreen!50!black}{420}` |

- 青の字は bkBlue ではなく `\bkTT` を使う（白い地に巻の色の細い字を置かない、の決まり）。
- 7-2 以降で「1列め・2列めの矢印（物差しの矢印の行き先）」をかくときは、**1列め＝赤 `bkRed`、2列め＝緑 `bkGreen!60!black`**（6 の家の絵と同じ）。

**章の先頭に置く部品**（tikz の matrix ライブラリを使う。`\usetikzlibrary{matrix}` は章のファイルの先頭に書いてよい）
```latex
\usetikzlibrary{matrix}
\makeatletter
\tikzset{
  kviib mat/.style={matrix of math nodes, ampersand replacement=\&,
    left delimiter=(, right delimiter=),
    nodes={minimum width=8mm, minimum height=6.5mm, inner sep=0pt, anchor=center},
    column sep=0pt, row sep=0pt, inner sep=0.6mm},
  kviib row/.style={fill=bkOrange!20, draw=bkOrange!80!black, line width=0.9pt, rounded corners=1.5mm},
  kviib col/.style={fill=bkBlue!14, draw=bkBlue!80!black, line width=0.9pt, rounded corners=1.5mm},
  kviib ans/.style={fill=bkGreen!20, draw=bkGreen!60!black, line width=0.9pt, rounded corners=1.5mm}}
% 帯をうしろに敷く  \kviibhl{スタイル}{左上のセル}{右下のセル}
\newcommand\kviibhl[3]{\begin{scope}[on background layer]
  \draw[#1] ([xshift=-0.6mm, yshift=0.3mm]#2.north west) rectangle ([xshift=0.6mm, yshift=-0.3mm]#3.south east);\end{scope}}
\makeatother
```
**使い方**（行列×ベクトル。セルの名前は「行列の名前-行-列」：`N-1-2` は N の1行め2列め）
```latex
\begin{bkfigure}
\begin{tikzpicture}[x=1mm, y=1mm]
  \matrix (N) at (0,0) [kviib mat] {2 \& 3\\ 2 \& 1\\};
  \matrix (p) [kviib mat, anchor=west] at ([xshift=6mm]N.east) {120\\ 60\\};
  \node[anchor=west] (eq) at ([xshift=3.5mm]p.east) {$=$};
  \matrix (b) [kviib mat, anchor=west] at ([xshift=3.5mm]eq.east) {420\\ 300\\};
  \kviibhl{kviib row}{N-1-1}{N-1-2}   % 1行め
  \kviibhl{kviib col}{p-1-1}{p-2-1}   % 列
  \kviibhl{kviib ans}{b-1-1}{b-1-1}   % 答えの成分
  \node[anchor=north, font=\small] at ([yshift=-3mm]p.south)
    {$\textcolor{bkOrange!80!black}{2}\times\textcolor{\bkTT}{120}+\textcolor{bkOrange!80!black}{3}\times\textcolor{\bkTT}{60}=420$};
\end{tikzpicture}
\bkfigcaption{1行めと列をなぞる。…}
\end{bkfigure}
```
- 成分の区切りは `\&`（`&` ではない。囲みの中でもこわれないように）。
- かっこは matrix の外に出るので、となりの行列は `xshift=6mm`、「＝」の前後は `3.5mm` あける（これより近いとかっこが重なる）。
- 行列×行列も同じ。答え (1,2) 成分なら、`\kviibhl{kviib row}{L-1-1}{L-1-2}`、`\kviibhl{kviib col}{R-1-2}{R-2-2}`、`\kviibhl{kviib ans}{C-1-2}{C-1-2}`。
- 2つの場面（1行めと2行め）を見せるときは、図を2つ横に並べるか、上下に並べる（1つの図で全部を塗らない）。

---

## 3. 方眼の家の絵（主役の図）

### 3-1 家の頂点（全組共通）
**もとの家**：頂点5つ（左下から反時計回り）と、右によせた戸（左右が対称でないので、裏返しが見分けられる）。
| 頂点 | ① | ② | ③ | ④ | ⑤ | 戸（4つのかど） |
| --- | --- | --- | --- | --- | --- | --- |
| もとの家 | (0, 0) | (2, 0) | (2, 2) | (1, 3) | (0, 2) | (1.25, 0)・(1.75, 0)・(1.75, 1)・(1.25, 1) |

**変換した家**（Python で確かめた）
| 行列 | ① | ② | ③ | ④ | ⑤ | 戸 |
| --- | --- | --- | --- | --- | --- | --- |
| 主役 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$ | (0, 0) | (4, 2) | (6, 6) | (5, 7) | (2, 4) | (2.5, 1.25)・(3.5, 1.75)・(4.5, 3.75)・(3.5, 3.25) |
| 横に2倍 $S=\begin{pmatrix}2&0\\0&1\end{pmatrix}$ | (0, 0) | (4, 0) | (4, 2) | (2, 3) | (0, 2) | (2.5, 0)・(3.5, 0)・(3.5, 1)・(2.5, 1) |
| ずらし $\begin{pmatrix}1&1\\0&1\end{pmatrix}$ | (0, 0) | (2, 0) | (4, 2) | (4, 3) | (2, 2) | (1.25, 0)・(1.75, 0)・(2.75, 1)・(2.25, 1) |
| 90°回す $R_{90}=\begin{pmatrix}0&-1\\1&0\end{pmatrix}$ | (0, 0) | (0, 2) | (−2, 2) | (−3, 1) | (−2, 0) | (0, 1.25)・(0, 1.75)・(−1, 1.75)・(−1, 1.25) |
| 裏返し $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$ | (0, 0) | (2, 0) | (2, −2) | (1, −3) | (0, −2) | (1.25, 0)・(1.75, 0)・(1.75, −1)・(1.25, −1) |

方眼の大きさの目安：主役は $x$ −1〜7、$y$ −1〜8。ずらしは $x$ −1〜5、$y$ −1〜4。$R_{90}$ は $x$ −4〜3、$y$ −1〜4。

### 3-2 部品（tikzpicture[x=5mm, y=5mm] の中で使う。1目もり＝5 mm）
```latex
\makeatletter
% 方眼と軸  \kviibgrid{xmin}{xmax}{ymin}{ymax}
\newcommand\kviibgrid[4]{%
  \draw[bkLine, line width=0.4pt, step=1] (#1,#3) grid (#2,#4);
  \draw[bkInk, line width=0.7pt, -{Stealth[length=2.2mm]}] (#1,0) -- ({#2+0.7},0) node[right, font=\footnotesize, inner sep=1pt] {$x$};
  \draw[bkInk, line width=0.7pt, -{Stealth[length=2.2mm]}] (0,#3) -- (0,{#4+0.7}) node[above, font=\footnotesize, inner sep=1pt] {$y$};
  \node[below left, font=\sffamily\footnotesize, inner sep=1.2pt] at (0,0) {O};}
% もとの家（灰色の点線）
\newcommand\kviibhousezero{%
  \filldraw[fill=bkGray!12, draw=bkGray, line width=0.8pt, dashed, line join=round] (0,0) -- (2,0) -- (2,2) -- (1,3) -- (0,2) -- cycle;
  \draw[bkGray, line width=0.6pt, dashed] (1.25,0) -- (1.25,1) -- (1.75,1) -- (1.75,0);}
% 行列 (a b; c d) をかけた家  \kviibhouse[色]{a}{b}{c}{d}   ※ 引数は行列の「行の順」に a, b, c, d
\newcommand\kviibhouse[5][bkOrange]{%
  \begin{scope}[cm={#2,#4,#3,#5,(0,0)}]
    \filldraw[fill=#1!25, draw=#1!80!black, line width=1.1pt, line join=round] (0,0) -- (2,0) -- (2,2) -- (1,3) -- (0,2) -- cycle;
    \filldraw[fill=white, draw=#1!80!black, line width=0.8pt] (1.25,0) -- (1.75,0) -- (1.75,1) -- (1.25,1) -- cycle;
  \end{scope}}
% 1列め（赤）と2列め（緑）の矢印＝物差しの矢印 (1,0)・(0,1) の行き先  \kviibbasis{a}{b}{c}{d}
\newcommand\kviibbasis[4]{%
  \draw[bkRed, line width=1.3pt, -{Stealth[length=2.4mm]}] (0,0) -- (#1,#3);
  \draw[bkGreen!60!black, line width=1.3pt, -{Stealth[length=2.4mm]}] (0,0) -- (#2,#4);}
\makeatother
```
**使い方**
```latex
\begin{bkfigure}
\begin{tikzpicture}[x=5mm, y=5mm]
  \kviibgrid{-1}{7}{-1}{8}
  \kviibhousezero
  \kviibhouse{2}{1}{1}{2}        % 主役の行列（オレンジ）
  \kviibbasis{2}{1}{1}{2}
  \begin{scope}[xshift=55mm]     % 横に並べるときは mm で動かす
    \kviibgrid{-1}{5}{-1}{4}\kviibhousezero
    \kviibhouse[bkPurple]{1}{1}{0}{1}   % ずらし
  \end{scope}
\end{tikzpicture}
\bkfigcaption{…}
\end{bkfigure}
```
- **色の約束**：もとの家＝灰色の点線、変換した家＝主役 `bkOrange`、ずらし `bkPurple`、回す `bkGreen`、横に2倍・裏返し `bkRed`（色だけでなく、図の下の行列やことばでも区別する）。
- `cm={a,c,b,d,(0,0)}` は tikz の決まりで「列の順」に書くので、部品の中で入れかえてある。部品を使えば、行列を**行の順**に `{a}{b}{c}{d}` と書けばよい。線の太さ・点線は変換されない。
- 頂点の名前や座標の字は、変換した図の上に `\node[font=\footnotesize]` で置く（線から 1.5 mm 以上はなす）。図のはばは 132 mm 以内（囲みの中は 122 mm 以内）。1目もり5 mm で主役の方眼は 40 mm×45 mm。

---

## 4. 表計算の画面（\bksheet）での行列のおき方

### 4-1 おき方の約束（物理 力-5 の `=MMULT(MINVERSE(A2:F7),G2:G7)` と同じ並び）
1. **1行めは見出し**（「行列 $A$」「$\vec x$」「$A\vec x$」）。
2. **行列は A2 から**（左上が A2）。2×2 なら A2:B3、3×3 なら A2:C4。
3. **ベクトルは行列のすぐ右の列**（2×2 なら C2:C3、3×3 なら D2:D4）。行列×行列なら、右の行列をすぐ右に（2×2 なら C2:D3）。
4. **答えは、そのすぐ右**（2×2 の行列×ベクトルなら D2:D3）。間に空いた列を入れない（空いたセルが範囲に入ると #VALUE! になる）。
5. 色：行列のマス `bkTheme!12`、ベクトルのマス `bkGreen!14`、答えのマス `bkYellow!35`（下の `\colorlet` で名前をつけて `\SetCell{bg=…}`）。
6. 画面の上に「数式バー」（どのセルに何を入れたか）を `\kviibfx{セル}{式}` で置く。

### 4-2 部品
```latex
\makeatletter
% 数式バー  \kviibfx{D2}{=MMULT(A2:B3,C2:C3)}
\newcommand\kviibfx[2]{\tikz[baseline=(f.base)]{\node[draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, font=\sffamily\footnotesize, minimum width=12mm] (c) {#1};
  \node[anchor=west, draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, minimum width=50mm, text width=46mm, align=left, font=\ttfamily\footnotesize] (f) at ([xshift=1mm]c.east) {#2};}}
\colorlet{kviibM}{bkTheme!12}\colorlet{kviibV}{bkGreen!14}\colorlet{kviibR}{bkYellow!35}
\makeatother
```
### 4-3 使い方
```latex
\begin{bkcenter}
\kviibfx{D2}{=MMULT(A2:B3,C2:C3)}\par\vspace{1mm}
\bksheet{4}{14}{%
1 & \SetCell[c=2]{c} 行列 $A$ & & \SetCell{c} $\vec x$ & \SetCell{c} $A\vec x$ \\
2 & \SetCell{bg=kviibM} 2 & \SetCell{bg=kviibM} 3 & \SetCell{bg=kviibV} 120 & \SetCell{bg=kviibR} 420 \\
3 & \SetCell{bg=kviibM} 2 & \SetCell{bg=kviibM} 1 & \SetCell{bg=kviibV} 60 & \SetCell{bg=kviibR} 300 \\}
\bktabcaption{…}
\end{bkcenter}
```
- `\bksheet` は7列（A〜G）まで。3×3 の行列×行列（A2:C4・D2:F4・答え G2:I4）は入らないので、答えを下の行（A6:C8）に置き、「答えは A6 から」と書く。
- 範囲は「左上のセル:右下のセル」。**MMULT の範囲のえらび方**：①左の行列の範囲、②右の行列（ベクトル）の範囲の順。左の行列の列の数と、右の行列の行の数が同じでないと #VALUE!（7-1 の「かけられる大きさ」）。
- **確定のしかた（7-1 で書いた文。ほかの章は「7-1 と同じように確定する」でよい）**：答えの左上のセル（D2）に式を入れて Enter を押すと、新しい Excel（Microsoft 365）や Google スプレッドシートでは、答えが下のセルにも自動で広がる。古い Excel や LibreOffice では、先に答えのマス全部（D2:D3）をえらんでから式を入れ、Ctrl＋Shift＋Enter で確定する（Microsoft のサポートページで確かめた）。
- 関数：`MMULT`（かけ算）・`TRANSPOSE`（転置）・`MINVERSE`（逆行列）・`MDETERM`（行列式）。成分ごとのかけ算 `=A2*C2` とまちがえないこと（7-1 のまちがえやすいところ）。

---

## 5. Python の型（bkcode・bkcodeout）

```latex
\begin{bkcode}[Python]
import numpy as np            \# 行列の道具 numpy を np という名前で使う
A = np.array([[2, 3],
              [2, 1]])        \# 行列は1行ずつ [ ] でくくって書く
p = np.array([120, 60])       \# ベクトル（たての列も、横に書く）
print(A @ p)                  \# 行列×ベクトルは @
\end{bkcode}
\begin{bkcodeout}[実行結果]
[420 300]
\end{bkcodeout}
```
**決まり**
0. **プログラムの枠と実行結果は同じページに**（第7巻 r1 の決定）：枠の前に `\Needspace{行数\baselineskip}` を入れる（minipage で包むと、枠の中に空いた行が出ることがあった）。
1. **`\begin{bkcode}[Python]` と `\begin{bkcodeout}[実行結果]` の [ ] をかならず書く。** 書かないと、実行結果の1行めが `[420 300]` のように `[` で始まるとき、それが枠の題名として食べられてしまう（試し組みで起きた）。
2. 1行めは `import numpy as np`。行列は `np.array([[2, 1], [1, 2]])` で**行ごとに** `[ ]`。2×2 は上のように2行に分けて、たてに並べて見せてよい（3×3 は3行に）。
3. ベクトルは `np.array([1, 0])`（横に書く。数学のたて書きのベクトルと同じもの）。表示も `[2 1]` と横1行。
4. 行列×ベクトル・行列×行列は `A @ x`、`A @ B`。**`A * B` は成分ごとのかけ算**（別物。7-1 のまちがえやすいところ）。転置は `A.T`、単位行列は `np.eye(2)`、逆行列 `np.linalg.inv(A)`、行列式 `np.linalg.det(A)`、連立方程式 `np.linalg.solve(A, b)`、固有値 `np.linalg.eig(A)`。
5. コメントの `#` は `\#`、`%` は `\%`、`{` `}` は `\{` `\}`、`_` は `\_`。字下げと改行はそのまま出る。1行は全角で約40字（半角80字）まで。
6. **実行結果は、本当に実行して出たものをそのまま写す**（numpy は数をそろえるため空白を入れる：`[[ 0.66666667 -0.33333333]` のように）。小数が長いときは、プログラムの頭に `np.set_printoptions(precision=3, suppress=True)` を入れて3けたにしてよい（そのときは「表示を小数第3位までにする」とコメント）。
7. `np.linalg.det(A)` は `2.9999999999999996` のように出ることがある（2-19 の 0.1 の話と同じ、丸めのずれ）。そのまま見せて理由を1行。
8. 試した版：Python 3、numpy 2.5（`[420 300]`、`[[420 440]` / ` [300 280]]` の表示を確かめた）。

---

## 6. 主役の行列と、同じ場面の数（brief7-parts 5章の約束1 の再掲。7-1 で使った形）
- 主役 $A=\begin{pmatrix}2&1\\1&2\end{pmatrix}$（7-1 では「この巻の主役」として紹介だけ。7-2 から使う）。
- くだもの屋：個数の表 $\begin{pmatrix}2&3\\2&1\end{pmatrix}$（1行め＝ソラさん：りんご2・みかん3、2行め＝ミナさん：りんご2・みかん1）、値段 $\begin{pmatrix}120\\60\end{pmatrix}$（お店A：りんご120円・みかん60円）、合計 $\begin{pmatrix}420\\300\end{pmatrix}$。お店B：りんご100円・みかん80円、値段の表 $\begin{pmatrix}120&100\\60&80\end{pmatrix}$、合計の表 $\begin{pmatrix}420&440\\300&280\end{pmatrix}$。
- 3-6 の回路：$\begin{pmatrix}4&2\\2&4\end{pmatrix}\begin{pmatrix}I_1\\I_2\end{pmatrix}=\begin{pmatrix}9\\6\end{pmatrix}$（答え 2 A・0.5 A は 7-5 で）。
- 4-11 の看板：$\begin{pmatrix}-\cos30°&\cos60°\\\sin30°&\sin60°\end{pmatrix}\begin{pmatrix}T_1\\T_2\end{pmatrix}=\begin{pmatrix}0\\100\end{pmatrix}$（7-1 では式を行列に書くだけ）。
- 3つのばね（物理 力-16。$k=\qty{100}{N/m}$、球の重さ $W=\qty{0.98}{N}$）：$\begin{pmatrix}2k&-k&0\\-k&2k&-k\\0&-k&k\end{pmatrix}\begin{pmatrix}u_1\\u_2\\u_3\end{pmatrix}=\begin{pmatrix}W\\W\\W\end{pmatrix}$（7-1 で「$u$ でまとめて行列で書く」手順を見せた。答え 0.0294・0.0490・0.0588 m は 7-5 で）。物理 力-16 の表計算も「行列 A2:C4、右辺 D2:D4、答え E2:E4」で、この型と同じ並び。
- 6-14 の台車：係数の行列 $\begin{pmatrix}-110&10\\10&-110\end{pmatrix}$（$m=1$、$k=100$、$K=10$）。7-1 で「係数の表は行列」と書いた。


## 7. 委員確認 r1 で決まったこと（共通）
- こたえ（`\bkjans`・`\bkpans`）の行列は smallmatrix を使わず、「1行め $(5,\ 6)$、2行め $(3,\ 2)$」、ベクトルは $(13,\ 7)$ と書く（7-2・7-3 の書き方）。
- 章末問題の★：基本は章の★の低いほう、チャレンジは高いほう（★が1つの章はチャレンジを1つ上げる）。
- 字の色に明るい bkBlue・bkPurple を使わない（\bkTT か bkInk、または bkBlue!80!black など）。
