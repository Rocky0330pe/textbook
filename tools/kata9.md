# 第9巻の「型」：表計算・Python・2つの世界の図・FFT の図（組 V9-1 が決めて配る。10月29日）

ほかの組は、この型をそのまま使ってください（第8巻の `tools/kata8.md` と同じ置き方）。
「名前と操作」の札・場合分けの表・流れ図は、組 V9-2 の `tools/kata9-int.md` を使います（この型とは別）。

下のコードは、すべて `tex/ch9-00.tex`（9-0、頭文字 `kixa`）の中で試し組みして、**エラー0・はみ出し0** で組めることを確かめてあります
（9-0 の本文でも同じ形で使っています。2章の 1-4〜1-6・4章の DFT の図は、9-0 の本文には使っていませんが、9-0 のファイルに一時的に入れて組めることを確かめました）。
部品の名前の頭文字 `kixa` は 9-0 のものです。**自分の章の頭文字に置きかえて**、章のファイルの先頭（`\makeatletter … \makeatother` の中）に写してください
（`sed 's/kixa/kixb/g'` で 9-1。9-2 → `kixc`、9-3 → `kixd`、9-4 → `kixe`、9-5 → `kixf`、9-6 → `kixg`、9-7 → `kixh`、9-8 → `kixi`、9-9 → `kixj`、9-10 → `kixk`、9-11 → `kixl`、9-12 → `kixm`、9-13 → `kixn`、巻末 → `kixz`）。
kata9-int.md の部品と同じ頭文字を使ってかまいません（名前はぶつかりません：この型は `kixaN`・`kixaK`・`kixaS`・`kixaW`・`kixaF`・`kixaP`、`kixa base`・`kixa wave`・`kixa spec`・`kixa splane`・`kixa sig`・`kixa part`・`kixa bar`・`kixa dot`・`kixa world`・`kixa bridge`・`kixa blab`、`\kixafx`・`\kixaworlds`・`\kixapole`・`\kixazero`。kata9-int は `kixaNc`・`kixaSc`・`kixaSb`、`kixa dan…`・`kixa name`・`kixa seki`・`kixa tag`・`kixa q`・`kixa do`・`kixa go`・`kixa yn` ほか）。

---

## 0. この型で使う主役の数（全組共通。brief9-parts 5章の約束。Python（numpy 2.5.3・scipy 1.18.1）で確かめた）

- **ラの音**：\qty{440}{Hz}・\qty{880}{Hz}・\qty{1320}{Hz}、大きさ 1・0.5・0.25（9-0 の表2・図6、9-4）。周期 \qty{2.27}{ms}（1/440 s）、波長 \qty{0.773}{m}（340 m/s。8-13 の例題と同じ）。
  合計の値（ms ごと）：0 → 0.000、0.25 → 1.348、0.5 → 0.955、0.75 → 0.438、1 → 0.252、1.25 → −0.217、1.5 → −0.423、1.75 → −0.884、2 → −1.376、2.25 → −0.172。いちばん大きい値 1.388（0.299 ms）。
- **FFT**：1秒に8000回（`fs = 8000`）で1秒分（8000点）→ `rfft` の大きさ `2*abs(X)/N` は 440・880・1320 Hz で 1・0.5・0.25（周波数のきざみ 1 Hz、0〜4000 Hz の4001本）。
- **8点の DFT**（手計算用）：$x_m=\sin\frac{2\pi\cdot2m}{8}$（$m=0\sim7$）→ $|X_k|$ は $k=2$ と $k=6$ で4、ほかは0（$X_2=-4j$、$X_6=4j$）。
- **方形波（4-9 の形）を4項までたす**：$\theta=90°$ で $1-\frac13+\frac15-\frac17=0.7238$（4-9 の0.724）。高さ1にそろえる $\frac4\pi$ 倍で 0.9216。
- **かけて平均（36点のまん中の値、5°・15°・…・355°）**：高さ1の方形波×$\sin n\theta$ の平均の2倍 → $n=1$ 1.2749（本当 $\frac4\pi=1.2732$）、$n=3$ 0.4293（0.4244）、$n=5$ 0.2629（0.2546）、$n=2$ は0。
- **ラプラス変換の数値積分**（台形、$\Delta t=0.1$、0〜10、$s=2$）：$\mathcal L[1]$ → 0.50167（表は $\frac1s=0.5$）、$\mathcal L[t]$ → 0.24917（$\frac{1}{s^2}=0.25$）。$t=10$ で $e^{-20}=2.1\times10^{-9}$（ここで打ち切ってよい理由）。
- **冷めるお湯**：オイラー法（1分ずつ）80・77・74.15・71.44・68.87・66.43・64.11・61.90・59.81・57.81・55.92 ℃、式 $20+60e^{-0.05t}$ で10分 56.39 ℃。
- **車A・車B**：`np.roots([1, 3, 2])` → `[-2. -1.]`、`np.roots([1, 2, 5])` → `[-1.+2.j -1.-2.j]`。$x(1)$ は 0.600・0.014。

---

## 1. 表計算：行は時刻、列は成分

### 1-1 置き方の約束（全組共通）
1. **A列は時刻**（または、はかった点の番号・角 $t$〔°〕）。上から下へ時間が進む（2-18・6-2 の続き）。
2. **1行めは成分の名前**：周波数（Hz）か番号 $n$（1, 3, 5, … のように数で入れる。式から読むため）。A1 は見出し（`$t$＼Hz`、`$t$＼$n$` など。単位は表の説明に書く）。
3. **たす表**（成分から波を作る）は、**2行めに成分の大きさ**を入れ、3行めから下が時刻。
   **分ける表**（波から成分を見つける：9-1・9-2 の「かけて平均」、9-4 の DFT）は、2行めから下が時刻で、**いちばん下の行に成分の大きさ**が出てくる。
4. 式は**1つのマスに1つだけ**入れて、全体にコピーする。`$` の印で「いつも1行め（2行め）を読む」「いつもA列を読む」（kata8 の1-1 と同じ考え）：
   - たす表：`B3` に `=B$2*SIN(2*PI()*B$1*$A3/1000)`（A列が ms、1行めが Hz のとき）。`B$1`・`B$2` は行の前の `$`、`$A3` は列の前の `$`。
   - 角 $t$〔°〕の表：`=B$2*SIN(B$1*RADIANS($A3))`（表計算の SIN はラジアンで受けとるので RADIANS で直す：6-9）。
5. **右の列に合計**（`=SUM(B3:D3)`）、または「かけた値」。注目するマスは色 `kixaS`（黄）。
6. 色：1行め（成分）のマス `kixaN`（オレンジのうすい色）、2行め（大きさ）のマス `kixaK`（緑のうすい色）。**色だけで区別しない**（本文で「B1（440 Hz）」のように番地と中身を両方書く）。
7. 画面の上に数式バー `\kixafx{セル}{式}` を置く（式の中の `$` は `\$`、`^` は `\^{}`）。本文でも式を1回は文で書き、**式の1つ1つの部分のわけ**を番号つきで書く（9-0 ②の①〜④：`2*PI()*B$1` は1秒に進む角、`$A3/1000` は ms を s に、など）。
8. `\bksheet` は**7列（A〜G）まで**。列のはば 15〜17 mm で、5列なら約 100 mm、6列なら約 115 mm。小数は第3位か第4位にそろえ、負の数は `$-0.211$`。途中の行は `$\vdots$` で省いてよい（何行めまであるかを説明に書く）。
9. 時間・単位の換算は単位つき：「時刻を ms から s に直す（\qty{1000}{ms/s} でわる）」。

### 1-2 部品（章の先頭の `\makeatletter … \makeatother` の中に。3章の部品といっしょに写す）
```latex
\colorlet{kixaN}{bkOrange!16}% 1行め（成分の番号・周波数）のマス
\colorlet{kixaK}{bkGreen!16}% 2行め（成分の大きさ）のマス
\colorlet{kixaS}{bkYellow!45}% 合計・注目するマス
% 表計算の数式バー  \kixafx{セル}{式}（式の中の $ は \$、^ は \^{}）
\newcommand\kixafx[2]{\tikz[baseline=(f.base)]{\node[draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, font=\sffamily\footnotesize, minimum width=12mm] (c) {#1};
  \node[anchor=west, draw=bkLine, line width=0.6pt, fill=white, minimum height=5.5mm, inner xsep=2mm, minimum width=78mm, text width=74mm, align=left, font=\ttfamily\footnotesize] (f) at ([xshift=1mm]c.east) {#2};}}
```

### 1-3 たす表（9-0 の表2。ラの音の3つの成分）
```latex
\begin{bkcenter}
\kixafx{B3}{=B\$2*SIN(2*PI()*B\$1*\$A3/1000)}\par\vspace{1mm}
\bksheet{5}{17}{%
1 & \SetCell{c} $t$＼Hz & \SetCell{bg=kixaN} 440 & \SetCell{bg=kixaN} 880 & \SetCell{bg=kixaN} 1320 & \SetCell{c} 合計 \\
2 & \SetCell{c} 大きさ & \SetCell{bg=kixaK} 1 & \SetCell{bg=kixaK} 0.5 & \SetCell{bg=kixaK} 0.25 & \\
3 & 0 & 0.000 & 0.000 & 0.000 & 0.000 \\
4 & 0.25 & 0.637 & 0.491 & 0.219 & \SetCell{bg=kixaS} 1.348 \\
5 & 0.5 & 0.982 & 0.184 & $-0.211$ & 0.955 \\
⋯（9-0 の表2は12行め 2.25 ms まで）
12 & 2.25 & $-0.063$ & $-0.063$ & $-0.047$ & $-0.172$ \\}
\bktabcaption{3つの成分をたす表（小数第3位まで）。A列の時刻 $t$ の単位は ms、1行めは成分の周波数（Hz）、2行めは成分の大きさ。}
\end{bkcenter}
```
- 表の前の本文に「B3 の式を B3:D12 にコピーし、E3 に `=SUM(B3:D3)` を入れて下へコピーする」と書く（表の説明は短く）。
- 表の数のグラフ（図）を、表のすぐあとに置く：成分は `kixa part`（細い線。破線・点線・一点鎖線で区別）、合計は `kixa sig`（太い線）、表の値は `kixa dot`（点）。凡例は軸の上に線の見本と字で（9-0 図5）。

### 1-4 たす表（角でかく形。9-1 の方形波：4-9 の $\sin\theta+\frac13\sin3\theta+\cdots$）
```latex
\begin{bkcenter}
\kixafx{B3}{=B\$2*SIN(B\$1*RADIANS(\$A3))}\par\vspace{1mm}
\bksheet{6}{15}{%
1 & \SetCell{c} $t$＼$n$ & \SetCell{bg=kixaN} 1 & \SetCell{bg=kixaN} 3 & \SetCell{bg=kixaN} 5 & \SetCell{bg=kixaN} 7 & \SetCell{c} 合計 \\
2 & \SetCell{c} 大きさ & \SetCell{bg=kixaK} 1 & \SetCell{bg=kixaK} 0.3333 & \SetCell{bg=kixaK} 0.2 & \SetCell{bg=kixaK} 0.1429 & \\
3 & 0 & 0.0000 & 0.0000 & 0.0000 & 0.0000 & 0.0000 \\
4 & 30 & 0.5000 & 0.3333 & 0.1000 & $-0.0714$ & 0.8619 \\
5 & 60 & 0.8660 & 0.0000 & $-0.1732$ & 0.1237 & 0.8165 \\
6 & 90 & 1.0000 & $-0.3333$ & 0.2000 & $-0.1429$ & \SetCell{bg=kixaS} 0.7238 \\
7 & 120 & 0.8660 & 0.0000 & $-0.1732$ & 0.1237 & 0.8165 \\
8 & 150 & 0.5000 & 0.3333 & 0.1000 & $-0.0714$ & 0.8619 \\
9 & 180 & 0.0000 & 0.0000 & 0.0000 & 0.0000 & 0.0000 \\}
\bktabcaption{方形波を4項までたす表（小数第4位まで）。A列は角 $t$（°）、1行めは番号 $n$、2行めは大きさ $\frac1n$（C2 は \texttt{=1/C1}）。}
\end{bkcenter}
```
- 90°の行（黄）が 4-9 の 0.724。項をふやすときは列を足さず、$n$ を 9, 11, … に変えた2枚めの表にする（7列まで）。9-1 の本文では 30°ごとより細かく（10°ごと、37行）してグラフにする。

### 1-5 分ける表（9-1・9-2 の「かけて平均」。高さ1の方形波の係数）
```latex
\begin{bkcenter}
\kixafx{C2}{=\$B2*SIN(C\$1*RADIANS(\$A2))}\par\vspace{1mm}
\bksheet{5}{17}{%
1 & \SetCell{c} $t$＼$n$ & \SetCell{c} 波 $f$ & \SetCell{bg=kixaN} 1 & \SetCell{bg=kixaN} 3 & \SetCell{bg=kixaN} 5 \\
2 & 5 & 1 & 0.0872 & 0.2588 & 0.4226 \\
3 & 15 & 1 & 0.2588 & 0.7071 & 0.9659 \\
4 & 25 & 1 & 0.4226 & 0.9659 & 0.8192 \\
$\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ \\
20 & 185 & $-1$ & 0.0872 & 0.2588 & 0.4226 \\
$\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ \\
37 & 355 & $-1$ & 0.0872 & 0.2588 & 0.4226 \\
38 & \SetCell{c} 平均×2 & & \SetCell{bg=kixaS} 1.2749 & \SetCell{bg=kixaS} 0.4293 & \SetCell{bg=kixaS} 0.2629 \\}
\bktabcaption{方形波（B列）に $\sin nt$ をかけた表。A列は角 $t$（°。5°から10°ごとの36点）。38行めは \texttt{=2*AVERAGE(C2:C37)}。本当の値は $\frac{4}{n\pi}$：1.2732・0.4244・0.2546。}
\end{bkcenter}
```
- いちばん下の行が「成分の大きさ」（分ける表）。なぜ「平均の2倍」かは 9-2（$\sin^2$ の平均が $\frac12$ だから）。点をふやすと本当の値に近づくことを、本文で1回見せる。
- 方形波は $f\sin nt$ が $t$ と $360°-t$ で同じ値になる（20行めと4行めが同じ）。この「同じになる」は 9-2 の偶関数・奇関数の入口。

### 1-6 数値積分の表（9-5・9-6 のラプラス変換。$\mathcal L[1]$ を $s=2$ で）
```latex
\begin{bkcenter}
\kixafx{E3}{=(D2+D3)/2*0.1}\par\vspace{1mm}
\bksheet{5}{17}{%
1 & \SetCell{c} $t$ & \SetCell{c} $f(t)$ & \SetCell{c} $e^{-2t}$ & \SetCell{c} $f\,e^{-2t}$ & \SetCell{c} 台形 \\
2 & 0 & 1 & 1.0000 & 1.0000 & \\
3 & 0.1 & 1 & 0.8187 & 0.8187 & 0.0909 \\
4 & 0.2 & 1 & 0.6703 & 0.6703 & 0.0745 \\
5 & 0.3 & 1 & 0.5488 & 0.5488 & 0.0610 \\
$\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ & $\vdots$ \\
102 & 10 & 1 & 0.0000 & 0.0000 & 0.0000 \\
103 & \SetCell{c} 合計 & & & & \SetCell{bg=kixaS} 0.50167 \\}
\bktabcaption{$\int_0^\infty f\,e^{-2t}\,\dd t$ を台形でたす表（$\Delta t=0.1$、$t=10$ まで）。C2 は \texttt{=EXP(-2*A2)}、D2 は \texttt{=B2*C2}、E103 は \texttt{=SUM(E3:E102)}。表の値は $\frac1s=0.5$。}
\end{bkcenter}
```
- 列は「$f$」「かけるもの」「かけた値」「台形1つ分」の順。$\infty$ のかわりに「$e^{-st}$ が十分小さくなる時刻まで」（$t=10$ で $e^{-20}=2.1\times10^{-9}$）と本文で1行。フーリエ変換の数値積分（9-4）も同じ並び（かけるものを $\cos\omega t$ と $\sin\omega t$ の2列に）。
- $s$ を変えて比べるときは、表を2枚にする（1つの表に $s$ を2つ入れない）。

### 1-7 1歩ずつ進める表（オイラー法：6-2 の形をそのまま。9-7 の「表を引いた答え」と比べる、9-11 の $(I+A\Delta t)^n$）
- 6-2・7-10 の表（A列が時刻、B列から状態、右に「変わる速さ」、$\Delta t$ は右上の1つのマス）をそのまま使う。新しい部品は要らない。
- 状態が2つ以上のとき（車A：$x$ と $\dot x$）は、1つの状態に1列（7-10 と同じ）。

---

## 2. Python の型（bkcode・bkcodeout）

第7巻・第8巻の型（`tools/kata7.md` の5、`tools/kata8.md` の2）をそのまま使う。そのうえで、第9巻では次を決める。

**決まり**
0. **プログラムの枠と実行結果は同じページに**：枠の前に `\Needspace{行数\baselineskip}`（コードの行数＋実行結果の行数＋4 くらい）。
1. `\begin{bkcode}[Python]` と `\begin{bkcodeout}[実行結果]` の [ ] をかならず書く（実行結果は `[` で始まることが多い）。
2. **1行は半角で68字まで（全角は2字と数える）**。コメントは33字めのあたりにそろえる。長いときは、コメントだけの行を上に置くか、式を `(` `)` の中で2行に分ける（9-0 の FFT の `x = (…` の形）。
3. `#` は `\#`、`_` は `\_`、`%` は `\%`、`{` `}` は `\{` `\}`。`^` は書けない（べき乗は `**`）。コメントに $s^2$ を書かない（「車A の特性方程式の解」のようにことばで）。
4. **文字の約束**：周波数の配列は `freq`（`f` は関数 $f(t)$ とまぎれるので使わない：第15回の決定8）。はかる回数は `fs`（本文の $f_{\mathrm s}$）、時刻は `t`、データは `x`、FFT の答えは `X`（小文字＝時間の世界、大文字＝周波数・$s$ の世界：brief9-parts 4章）。
5. **使う命令**（どれも「手で計算したあと、確かめに使う」と本文で言う。答えを Python に任せて途中式を省かない：kata9-int の決まり）：
   | 命令 | すること | 章 |
   | --- | --- | --- |
   | `np.fft.rfft(x)`、`np.fft.rfftfreq(N, 1/fs)` | 実数のデータを周波数の成分に（大きさは `2*np.abs(X)/N`。0 Hz の成分だけは `np.abs(X[0])/N`） | 9-0・9-4 |
   | `np.fft.fft(x)` | 8点の DFT を手計算と比べる（複素数のまま出る） | 9-4 |
   | `np.roots([1, 3, 2])` | 方程式の解（極）。係数は次数の高い順 | 9-0・9-7・9-9 |
   | `np.linalg.eigvals(A)`・`np.linalg.eig(A)` | 固有値（numpy 2.5 では `[-1.+0.j -2.+0.j]` のように複素数の形で出る：7-8 と同じ注） | 9-10・9-11 |
   | `scipy.linalg.expm(A*t)` | 行列の指数関数 $e^{At}$ | 9-11 |
   | `scipy.signal.residue`・`lsim` | 部分分数・応答（確かめにだけ。紙面には出さなくてよい） | 9-7・9-8 |
6. 小数の表示：`np.round(…, 3)` か、プログラムの頭に `np.set_printoptions(precision=4, suppress=True)`（「表示を小数第4位までにする」とコメント）。`-0.` が出る表示（`print(x)` で $\sin$ の値など）は見せない（`np.round(np.abs(X), 3)` のように、見せたい量だけ出す）。
7. **実行結果は本当に実行して出たものを写す**（numpy 2.5.3・scipy 1.18.1 で確かめた。下の結果はすべてこの版）。
8. 図は matplotlib でかけることを1回言い、紙面の図は3章の部品でかき直して、すぐ近くに置く（「Python で出した図を、本の形にかき直したもの」と1回書く）。`plt.show()` は図を画面に出す命令。

### 2-1 FFT（9-0 ④。実行結果は 0章の数と同じ）
```latex
\Needspace{17\baselineskip}
\begin{bkcode}[Python]
import numpy as np
fs = 8000                       \# 1秒に何回はかるか
t = np.arange(fs) / fs          \# 1/8000 秒ごとの 8000 個の時刻
x = (np.sin(2*np.pi*440*t) + 0.5*np.sin(2*np.pi*880*t)
     + 0.25*np.sin(2*np.pi*1320*t))   \# 3つの成分をたした音
X = np.fft.rfft(x)              \# FFT（周波数の世界へ）
freq = np.fft.rfftfreq(len(x), 1/fs)  \# 1つ1つの成分の周波数
A = 2*np.abs(X) / len(x)        \# 成分の大きさ（振幅）にそろえる
print(freq[A > 0.1])            \# 大きさが 0.1 より大きい周波数
print(np.round(A[A > 0.1], 3))  \# その大きさ（小数第3位まで）
\end{bkcode}
\begin{bkcodeout}[実行結果]
[ 440.  880. 1320.]
[1.   0.5  0.25]
\end{bkcodeout}
```
- `freq[A > 0.1]` は「大きさが0.1より大きい成分の周波数だけを取り出す」書き方（9-0 では文で1回説明した）。
- 9-4 で `2*np.abs(X)/len(x)` の「2」と「N でわる」のわけ（片側だけ見ているので2倍、N 個たしたので N でわる）を回収する。

### 2-2 8点の DFT（9-4。手計算の $|X_k|$ と比べる）
```latex
\Needspace{10\baselineskip}
\begin{bkcode}[Python]
import numpy as np
m = np.arange(8)                \# 点の番号 0, 1, …, 7
x = np.sin(2*np.pi*2*m/8)       \# 8点で2回くり返す sin
X = np.fft.fft(x)               \# 8点の DFT
print(np.round(np.abs(X), 3))   \# 大きさ |X\_k|（k = 0〜7）
\end{bkcode}
\begin{bkcodeout}[実行結果]
[0. 0. 4. 0. 0. 0. 4. 0.]
\end{bkcodeout}
```
（コメントの `X_k` の `_` は `\_` と書いてある。）

### 2-3 方程式の解（9-0 ⑥・9-7・9-9）と、行列の指数関数（9-11）
```latex
\Needspace{9\baselineskip}
\begin{bkcode}[Python]
import numpy as np
print(np.roots([1, 3, 2]))    \# 車A の特性方程式の解
print(np.roots([1, 2, 5]))    \# 車B の特性方程式の解
\end{bkcode}
\begin{bkcodeout}[実行結果]
[-2. -1.]
[-1.+2.j -1.-2.j]
\end{bkcodeout}
```
```latex
\Needspace{14\baselineskip}
\begin{bkcode}[Python]
import numpy as np
from scipy.linalg import expm
A = np.array([[0, 1],
              [-2, -3]])        \# 車A の状態の行列（7-8）
print(np.linalg.eigvals(A))     \# 固有値
np.set\_printoptions(precision=4, suppress=True)  \# 小数第4位まで
print(expm(A*1.0))              \# t = 1 の行列の指数関数
\end{bkcode}
\begin{bkcodeout}[実行結果]
[-1.+0.j -2.+0.j]
[[ 0.6004  0.2325]
 [-0.4651 -0.0972]]
\end{bkcodeout}
```
（コメントに `e^{At}` をそのまま書くとエラーになる（`^` と `{` `}`）。ことばで書く。）

---

## 3. 2つの世界の図（時間の世界を左、周波数の世界・$s$ の世界を右）

第9巻の初めての考えは、いつも**左に時間の世界（波形・動き）、右に周波数の世界（スペクトル）か $s$ の世界（極の点）**を並べた図で見せる（brief9-parts 3-0 の2）。上に2つの世界の見出しと、行き来の矢印（上が「→」、下が「←」）を置く。

### 3-1 色と線の約束（全組共通）
第9巻の巻の色（むらさき bkVol9）は bkPurple とにているので、波形・スペクトル・極には巻の色を使わない。**色だけで区別しない**（線の形・太さ・名前も変える）。

| 役 | スタイル | 色 | 形 | 本文・図での呼び方 |
| --- | --- | --- | --- | --- |
| 時間の世界の波形・動き（主役の線） | `kixa sig` | `kixaW`＝`bkBlue!80!black` | 1.4pt 実線 | 「太い線」「青い線」 |
| 成分（たす前の1つ1つ） | `kixa part` | `bkGreen!45!black` | 0.8pt 破線（2つめ・3つめは点線・一点鎖線に変える） | 「細い線」 |
| 2つめの動き（車B など） | `kixaF` に `dash pattern=on 4pt off 2pt` | `bkOrange!85!black` | 1.4pt 破線 | 「破線」「オレンジの破線」 |
| 表の値・はかった点 | `kixa dot` | `kixaW` | 半径 1.3pt の点 | 「点」 |
| 周波数の世界の成分（スペクトル） | `kixa bar` | `kixaF`＝`bkOrange!85!black` | はば 3pt の棒（`ycomb`）。棒が多いときは `line width=1.6pt` | 「棒」 |
| $s$ の世界の極 | `\kixapole{実部}{虚部}` | `kixaP`＝`bkRed!80!black` | ×（2.6 mm） | 「×」 |
| $s$ の世界の零点（9-9 から） | `\kixazero{実部}{虚部}` | `kixaP` | ○（半径 1.2 mm、白ぬき） | 「○」 |
| 2つの例の極を分けるとき | `\kixapole[kixaW]{…}`・`\kixapole[kixaF]{…}` | 青・オレンジ | ×（同じ形）＋**名前の札**（「車A」「車B」） | 「車A の×」 |
| 安定な左半分（9-9 から） | `\fill[bkGreen!10] (axis cs:xmin,ymin) rectangle (axis cs:0,ymax);` | うすい緑 | ぬり | 「うすい緑」（説明に必ず書く） |

- 見出しの箱：左「時間の世界」（青の枠 `kixaW`）、右「周波数の世界」か「$s$ の世界」（オレンジの枠 `kixaF`）。字はどちらも bkInk の太字。
- 行き来の矢印のことば（そろえる）：周波数の世界は上「分ける」・下「たし合わせる」（フーリエ級数）、または上「変換する」・下「もどす」（フーリエ変換）。$s$ の世界は上「翻訳する」・下「もどす」（9-0）、9-5 から上「ラプラス変換」・下「逆変換」でもよい。
- 図の中の字は `\footnotesize` 以上。字と線・目もり数字のあいだは 1.5 mm 以上（$s$ の世界の目もり数字は `xticklabel style={yshift=-1.4mm}` で×からはなす。9-0 で確かめた）。

### 3-2 部品（章の先頭の `\makeatletter … \makeatother` の中に。1-2 と同じ所）
```latex
\colorlet{kixaW}{bkBlue!80!black}% 時間の世界の線（波形・動き）
\colorlet{kixaF}{bkOrange!85!black}% 周波数の世界の棒
\colorlet{kixaP}{bkRed!80!black}% s の世界の点（×）
% グラフのスタイル（どれも scale only axis：はばと高さは軸の箱の大きさ）
\pgfplotsset{
  kixa base/.style={bkplot, scale only axis, width=47mm, height=28mm, axis lines=left, grid=none,
    every axis x label/.style={at={(axis description cs:0.5,0)}, anchor=north, yshift=-5mm, font=\sffamily\small, text=bkInk},
    every axis y label/.style={at={(axis description cs:0,1)}, anchor=south, yshift=1.5mm, font=\sffamily\small, text=bkInk}},
  kixa wave/.style={kixa base, extra y ticks={0}, extra y tick labels={0}, extra y tick style={grid=major, major grid style={bkInk!45, line width=0.5pt}}},
  kixa spec/.style={kixa base, ymin=0},
  kixa splane/.style={bkplot, scale only axis, width=47mm, height=47mm, axis equal image, grid=major,
    every axis x label/.style={at={(ticklabel* cs:1)}, anchor=north east, yshift=-0.5mm, font=\sffamily\small, text=bkInk},
    every axis y label/.style={at={(ticklabel* cs:1)}, anchor=south, yshift=1mm, font=\sffamily\small, text=bkInk}},
  kixa sig/.style={kixaW, line width=1.4pt, no markers, samples=241, smooth},
  kixa part/.style={bkGreen!45!black, line width=0.8pt, dash pattern=on 3pt off 1.5pt, no markers, samples=241, smooth},
  kixa bar/.style={ycomb, draw=kixaF, line width=3pt, no markers},
  kixa dot/.style={only marks, mark=*, mark size=1.3pt, kixaW}}
% 2つの世界の見出しと、行き来の矢印  \kixaworlds[見出しの高さ]{左の題}{右の題}{上の矢印（→）}{下の矢印（←）}
%     左の軸は at={(0mm,0mm)}、右の軸は at={(76mm,0mm)}（はば 47 mm）に置く。見出しは軸の上（ふつう 42 mm）
\tikzset{
  kixa world/.style={draw, line width=1pt, rounded corners=1.5mm, fill=white, font=\sffamily\bfseries\small, text=bkInk,
    minimum width=30mm, minimum height=7mm, inner xsep=2mm},
  kixa bridge/.style={-{Stealth[length=2.4mm]}, line width=1pt, bkInk!80},
  kixa blab/.style={font=\sffamily\footnotesize, text=bkInk, inner sep=0.8mm}}
\newcommand\kixaworlds[5][42mm]{%
  \node[kixa world, draw=kixaW] (kixaL) at (23.5mm,#1) {#2};
  \node[kixa world, draw=kixaF] (kixaR) at (99.5mm,#1) {#3};
  \draw[kixa bridge] ([yshift=1.3mm, xshift=1.5mm]kixaL.east) -- node[kixa blab, above] {#4} ([yshift=1.3mm, xshift=-1.5mm]kixaR.west);
  \draw[kixa bridge] ([yshift=-1.3mm, xshift=-1.5mm]kixaR.west) -- node[kixa blab, below] {#5} ([yshift=-1.3mm, xshift=1.5mm]kixaL.east);}
% s の世界の点（axis の中で）  \kixapole[色]{実部}{虚部}（×）  \kixazero[色]{実部}{虚部}（○）
\newcommand\kixapole[3][kixaP]{\draw[#1, line width=1.3pt] (axis cs:#2,#3) ++(-1.3mm,-1.3mm) -- ++(2.6mm,2.6mm) (axis cs:#2,#3) ++(-1.3mm,1.3mm) -- ++(2.6mm,-2.6mm);}
\newcommand\kixazero[3][kixaP]{\draw[#1, line width=1.1pt, fill=white] (axis cs:#2,#3) circle[radius=1.2mm];}
```

### 3-3 置き方の約束
- **左の軸は `at={(0mm,0mm)}`、右の軸は `at={(76mm,0mm)}`**。どちらも `scale only axis` で、はば 47 mm（`kixa base` の中で決めてある。変えない）。高さは左右で同じにする（ふつう 28 mm。$s$ の世界は 47 mm なので、左も `height=47mm`）。
  これで図全体のはばは約 131 mm（左の目もり数字から右の目もり数字まで）。**はばを 50 mm にすると、2.3pt はみ出した**（試し組みで確かめた）。
- **見出し `\kixaworlds` の高さ**＝軸の高さ＋14 mm（高さ 28 mm なら 42 mm（初めの値）、47 mm なら `\kixaworlds[63mm]`、17 mm の段を3つ重ねるなら `[71mm]`）。見出しの中心は左の軸のまん中（23.5 mm）と右の軸のまん中（99.5 mm）。
- **軸の名前は、横の軸は軸の下のまん中**（`kixa base` で決めてある。右はしに置くと右の図が 132 mm をこえる）、たての軸は軸の上。$s$ の世界は「実部」（右はしの下）・「虚部」（上）。
- 時間の世界の0の線：`kixa wave` は $y=0$ に細い線を引き、「0」の目もり数字をつける。目もり数字を出さないときは `extra y tick labels={}`（線は残る）。
- 周波数の世界の目もりは、成分のある所（440・880・1320）と、はし（0・2000）。数字どうしが 10 mm 以上はなれるように（2000 Hz を 47 mm にかくと 440 Hz ごとに約 10 mm）。
- 図の説明には、左右がそれぞれ何か（「左は時間の世界の波形（$p$ は空気の圧力の変化）、右は周波数の世界のスペクトル」）と、矢印の意味を書く。
- `\foreach` で軸をくり返すときは、軸の位置を `at={(0mm,\kixay mm)}` のように書く（9-0 図1）。

### 3-4 使い方（1）時間の世界と周波数の世界（9-0 図6）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\kixaworlds{時間の世界}{周波数の世界}{分ける}{たし合わせる}
\begin{axis}[kixa wave, at={(0mm,0mm)}, xmin=0, xmax=5, ymin=-1.6, ymax=1.6, xtick={0,1,...,5}, ytick={-1,1}, xlabel={時間 $t$（ms）}, ylabel={$p$}]
  \addplot[kixa sig, domain=0:5] {sin(158.4*x)+0.5*sin(316.8*x)+0.25*sin(475.2*x)};
\end{axis}
\begin{axis}[kixa spec, at={(76mm,0mm)}, xmin=0, xmax=2000, ymax=1.2, xtick={0,440,880,1320,2000}, ytick={0.25,0.5,1}, xlabel={周波数（Hz）}, ylabel={大きさ}]
  \addplot[kixa bar] coordinates {(440,1) (880,0.5) (1320,0.25)};
\end{axis}
\end{tikzpicture}
\bkfigcaption{同じ音の、2つの表し方。左は時間の世界の波形（$p$ は空気の圧力の変化）、右は周波数の世界のスペクトル。左から右へ行くのが「分ける」、右から左へ行くのが「たし合わせる」。}
\label{bk:9-N:fig-sekai}
\end{bkfigure}
```
- pgfplots の `sin` は**度**で計算する。$t$ を ms でかくとき、$\sin(2\pi\cdot440\,t)$ は `sin(158.4*x)`（$360\times0.44=158.4$）。秒でかくなら `sin(deg(2*pi*440*x))`。
- 同じ図を段に重ねる（3つの楽器など）ときは、段の高さ 17 mm、段の間 24 mm（9-0 図7。段の名前は左の軸の左に `anchor=east` で）。

### 3-5 使い方（2）時間の世界と $s$ の世界（9-0 図9：車A・車B）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\kixaworlds[63mm]{時間の世界}{$s$ の世界}{翻訳する}{もどす}
\begin{axis}[kixa wave, at={(0mm,0mm)}, height=47mm, xmin=0, xmax=5, ymin=-0.4, ymax=1.1, xtick={0,1,...,5}, ytick={-0.2,0.2,0.4,0.6,0.8,1}, yticklabel style={/pgf/number format/fixed}, xlabel={時間 $t$}, ylabel={$x$}]
  \addplot[kixa sig, domain=0:5] {2*exp(-x)-exp(-2*x)};
  \addplot[kixaF, line width=1.4pt, dash pattern=on 4pt off 2pt, no markers, samples=241, smooth, domain=0:5] {exp(-x)*(cos(deg(2*x))+0.5*sin(deg(2*x)))};
  \node[font=\sffamily\footnotesize, anchor=south west, text=kixaW, fill=white, inner sep=1pt] at (axis cs:1.6,0.52) {車A（実線）};
  \node[font=\sffamily\footnotesize, anchor=north west, text=kixaF, fill=white, inner sep=1pt] at (axis cs:2.2,-0.18) {車B（破線）};
\end{axis}
\begin{axis}[kixa splane, at={(76mm,0mm)}, xmin=-3, xmax=2, ymin=-2.5, ymax=2.5, xtick={-2,-1}, ytick={-2,-1,1,2}, xticklabel style={yshift=-1.4mm}, xlabel={実部}, ylabel={虚部}]
  \fill[bkGreen!10] (axis cs:-3,-2.5) rectangle (axis cs:0,2.5);
  \kixapole[kixaW]{-1}{0}\kixapole[kixaW]{-2}{0}
  \kixapole[kixaF]{-1}{2}\kixapole[kixaF]{-1}{-2}
  \node[font=\sffamily\footnotesize, anchor=south, text=kixaW, fill=white, inner sep=1pt] at (axis cs:-1.5,0.3) {車A};
  \node[font=\sffamily\footnotesize, anchor=west, text=kixaF, fill=white, inner sep=1pt] at (axis cs:-0.8,1.55) {車B};
\end{axis}
\end{tikzpicture}
\bkfigcaption{車A・車B の動き（左）と、特性方程式の解の場所（右の×）。右のうすい緑は、実部が負の左半分。}
\label{bk:9-N:fig-ten}
\end{bkfigure}
```
- `kixa splane` は `axis equal image`（実部と虚部の1目もりを同じ長さに。変えない：角度・距離がゆがむ）。範囲は横5目もり・たて5目もり（47 mm）がよい。極の虚部が大きいとき（RLC の $\pm9950j$ など）は、目もりを `1000` 単位にして説明に書く。
- 極の名前の札は、×から 1.5 mm 以上はなし、白い地をしく。

---

## 4. FFT の図（データのスペクトル）

### 4-1 データから計算したスペクトル（9-4・9-12）
- 3-4 と同じ2つの世界の図にする。右の棒の値は、**Python（2-1 の型）で計算した値を小数第3位まで `coordinates` に写す**（`np.round(A[A > 0.1], 3)` で出た数）。説明に「Python で出した値を、本の形にかき直したもの」と1回書く。
- 声や楽器のように棒が多いとき（20本以上）は `kixa bar` に `line width=1.6pt`（9-0 図2）。くり返さない音（手をたたく音など）の広がったスペクトルは、棒にせず `\addplot[fill=kixaF!35, draw=kixaF, line width=1pt, smooth] … \closedcycle;`（線とぬりで「広がり」を見せる）。
- 横の軸は Hz（`周波数（Hz）`）。$\omega$〔rad/s〕でかくときは `角周波数 $\omega$（rad/s）` と書き、Hz とまぜない。
- 9-0 図2 の「アプリの画面の例」のように、**作った図**（本物の測定でない図）は、説明に「形がわかりやすいように作った図」と必ず書く。

### 4-2 とびとびの点と DFT（9-4。2-2 の8点）
```latex
\begin{bkfigure}
\begin{tikzpicture}
\kixaworlds{時間の世界（8点）}{周波数の世界}{DFT}{もどす}
\begin{axis}[kixa wave, at={(0mm,0mm)}, xmin=0, xmax=8, ymin=-1.3, ymax=1.3, xtick={0,1,...,7}, ytick={-1,1}, xlabel={点の番号 $m$}, ylabel={$x_m$}]
  \addplot[kixa part, domain=0:8] {sin(90*x)};
  \addplot[kixa dot, mark size=1.8pt] coordinates {(0,0) (1,1) (2,0) (3,-1) (4,0) (5,1) (6,0) (7,-1)};
\end{axis}
\begin{axis}[kixa spec, at={(76mm,0mm)}, xmin=-0.5, xmax=7.5, ymax=4.8, xtick={0,1,...,7}, ytick={2,4}, xlabel={番号 $k$}, ylabel={$|X_k|$}]
  \addplot[kixa bar] coordinates {(0,0) (1,0) (2,4) (3,0) (4,0) (5,0) (6,4) (7,0)};
\end{axis}
\end{tikzpicture}
\bkfigcaption{8点のデータ（左の点）と、その DFT の大きさ（右の棒）。$k=2$ の棒は「8点で2回くり返す成分」。$k=6$ の棒は $k=2$ の鏡うつし（9-3 の負の周波数）。}
\end{bkfigure}
```
- 左は点（`kixa dot`）が主役。点を結ぶもとの波は細い線（`kixa part`）で、「もとの波」と説明に書く。
- 右の横の軸は番号 $k$。周波数（Hz）に直すときは $\frac{k}{N\Delta t}$（brief9-parts 4章）を本文で1行。

---

## 5. 試し組みで確かめたこと（tryv 9-0）
- 1章・3章・4章の部品とコードは、エラー0・1.7pt 超のはみ出し0（9-0：28ページ）。1-4〜1-6・4-2 の例は、9-0 のファイルの最後に一時的に入れて、エラー0・はみ出し0を確かめてから外した。
- 2つの世界の図：軸のはば 50 mm・右の軸 78 mm の置き方では 2.3pt はみ出した → 47 mm・76 mm に決めた。
- `kixa wave` の「0」の目もり数字が、軸の左に置いた段の名前（「音A」など）とぶつかった → その図だけ `extra y tick labels={}`。
- pgfmath は 16383 をこえる数で止まる（`cos(360*…)` の中で大きな数をかけない。9-0 の空気のこさの図で起きた）。
- 表計算の画面の1行めの見出しが長いと（「$t$（ms）＼Hz」）、行が2段になり表が高くなった → 見出しは短く（「$t$＼Hz」）、単位は表の説明に。
- 巻の色の字（`\bkTT`＝bkTheme＝むらさき）は、白地の上の見出し・札で読める濃さ（試し組みの画像で確かめた）。
