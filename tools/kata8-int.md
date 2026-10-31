# 「名前と操作」の型（第8巻・組 V8-4、10月29日）

依頼者の指示（10月29日 13:34）「操作の名前（面積分）と実際の操作（定積分）の違いは相当わかりにくく、どのような操作をすれば求められるのかも場合によりけりなので、この場合はどうすれば良いのかを丁寧にする必要がある」を、紙面の形にした型です。
**積分が出てくる章（8-6・8-7・8-8・8-11、それを使う 8-9・8-10・8-12・8-14）と、8-0 の予告・巻末の「積分の地図」は、この型で書きます。**
下のコードは `tex/ch8-06.tex` の先頭にあるもので、試し組み（`python3 tools/tryv.py 8-6 …`）でエラー0・はみ出し0を確かめてあります。8-7 は同じものを `kviiih` で使っています（`tex/ch8-07.tex`）。

**頭文字の置きかえ**：コードの `kviiig`（8-6 の頭文字）を、自分の章の頭文字に全部置きかえて、章のファイルの先頭に写します（`sed 's/kviiig/kviiii/g'` で 8-8、`kviiil` で 8-11、`kviiij` で 8-9 …。巻末は `kviiiz` など、ほかとぶつからない名前）。共通のファイル（bk-*.sty）には入れません（直したい所は報告に）。

---

## 0. 考え方（全組で同じことばを使う）

- 積分の記号（∬・∭・∫_C・∮・∯）は「**タイルに分けて、1枚ずつ量をかけて、たし合わせ、タイルを細かくした先**」という**操作の名前**。記号を見ただけでは、まだ計算はできない。
- 実際の値は、場所を数で表して、**ふつうの定積分（第5巻の $\int_a^b\dots\dd x$）のくり返し**に直して求める。
- 「∫ の数＝場所を表す数の数」：道は1つ（$t$）、面は2つ、立体は3つ。◯は「閉じている」という印で、形（円）や面積ではない。どの道・面かは下つきの $C$・$S$ が決める。
- ことば：「名前」「ふつうの定積分」「直す」「楽をする」「場合」「タイル」「1枚の量」。**「実際の操作」「累次積分」は、それぞれ1回だけ紹介し、ふだんは「ふつうの定積分に直す」「定積分を2回」と言う。**

## 1. 3つの段（名前の段 → 直す段 → 楽をする段）

| 段 | すること | 札の形（色だけにたよらない） |
| --- | --- | --- |
| ①**名前の段** | 記号を読む：**何を**（$f$、$\vec F\cdot\dd\vec r$、$\vec F\cdot\vec n$）・**どこで**（下つきの $D$・$C$・$S$・$V$）・**1枚の量**（$\dd A$、$\dd s$、$\dd\vec r$、$\vec n\,\dd S$） | 白い地・**点線**の枠（オレンジの線）。式の「名前」の枠と同じ形 |
| ②**直す段** | (a) 場所を数で表す →（b）1枚の量をその数で書く（$\dd A=\dd x\,\dd y$、$r\,\dd r\,\dd\theta$、$\dd\vec r=\vec r\,'(t)\,\dd t$…）→（c）数の範囲を決める →（d）ふつうの定積分を計算 | うすい地・**実線**の枠（巻の色）。式の「ふつうの定積分」の枠と同じ形 |
| ③**楽をする段** | 直す前に必ず確かめる：(ア) 対称性（一定なら外に出す・0になる）(イ) 分ける・ひく (ウ) 定理で取りかえる（ポテンシャル・ガウス・ストークス）(エ) 数値（表計算でタイルをたす） | 巻の色で**ぬりつぶし**・白い字 |

- **本文**：3つの段の見出しは `\kviiigdanhead{1}{見出し}`（「①名前の段」の札＋見出し）。1つの積分の説明の中で ①→②→③ の順に出す。章の3段（`\bkstage` の目・手・式）とは別もの（その中の小見出しの1つ下の段）。
- **例題の中**：番号なしの小さな札 `\kviiigdan{1}`（名前）・`\kviiigdan{2}`（直す）・`\kviiigdan{3}`（楽をする）を行の頭に置く。**③を使ったときは、②の前に置く**（流れ図で先に問うので）。計算そのものは `\shiki` の中（＝計算の段）。
- 例題の形（必ずこの順。**「名前」の札の行は、積分しない例題でも必ず書く**：「名前は ∬ だが、ここでは積分しない（対称で外に出す）」）：
```latex
\begin{reidai}[題]
問題文\par
\kangaekata \kviiigbaai{長方形の板}{8-6}{A}\par
\kviiigdan{1}\enspace $\displaystyle\iint_D\sigma\,\dd A$：板の上で「$\sigma$×タイル」をたす。\par
\kviiigdan{3}\enspace （使うときだけ）対称性で…\par
\kviiigdan{2}\enspace 内側は $y$ を止めて $x$ で $0$ から $2$ まで、外側は $y$ で $0$ から $1$ まで。\par
\shiki …（式の変形は1行に1つ。\kviiia などで字下げ）\par
\kotae …
\end{reidai}
```

## 2. 「名前と操作」の対応表（8-6 の最初・8-0 の予告・巻末の積分の地図）

列：**タイル（絵）／名前（記号）／何をたすか（1枚の量）／ふつうの定積分に直した形（章）**。タイルの絵は `\kviiigpic{1〜7}`（1 細い長方形、2 面のタイル、3 小さな箱、4 道の1歩（長さ）、5 道の1歩（矢印）、6 曲がった面のタイル、7 向きのついたタイル）。

```latex
\begin{bkcenter}
\begin{bktable}{colspec={Q[c,m,17mm] Q[c,m,30mm] Q[l,m,30mm] X[l,m]}, row{2-Z}={font=\small}, rowsep=3pt, colsep=4pt}
タイル & 名前（記号） & 何をたすか（1枚の量） & ふつうの定積分に直した形 \\
\kviiigpic{1} & $\displaystyle\int_a^b f\,\dd x$ & $f$×細い長方形のはば $\dd x$ & そのまま（第5巻） \\
\kviiigpic{2} & $\displaystyle\iint_D f\,\dd A$ & $f$×タイルの面積 $\dd A$ & 場所を2つの数で表し、定積分を2回（8-6） \\
\kviiigpic{3} & $\displaystyle\iiint_V f\,\dd V$ & $f$×小さな箱の体積 $\dd V$ & 場所を3つの数で表し、定積分を3回（8-6） \\
\kviiigpic{4} & $\displaystyle\int_C f\,\dd s$ & $f$×1歩の長さ $\dd s$ & 道を1つの数 $t$ で表し、定積分を1回（8-7） \\
\kviiigpic{5} & $\displaystyle\int_C\vec F\cdot\dd\vec r$ & 力と1歩の矢印 $\dd\vec r$ の内積 & 道を $t$ で表し、定積分を1回（8-7） \\
\kviiigpic{6} & $\displaystyle\iint_S f\,\dd S$ & $f$×曲がったタイルの面積 $\dd S$ & 面を2つの数で表し、重積分に（8-8） \\
\kviiigpic{7} & $\displaystyle\iint_S\vec F\cdot\vec n\,\dd S$ & 矢印と、向きのついたタイル $\vec n\,\dd S$ の内積 & 面を2つの数で表し、重積分に（8-8） \\
 & $\displaystyle\oint_C$\quad $\displaystyle\oiint_S$ & ◯は「閉じている」印 & 上と同じ。定理で取りかえられる（8-11） \\
\end{bktable}
\bktabcaption{積分の名前と、ふつうの定積分に直した形。}
\end{bkcenter}
```
- 8-0 の予告（半ページ）は、この表の「名前」と「直した形」の2列だけでよい。巻末の積分の地図は、この表＋全体の流れ図＋場合の記号の索引（記号・章・例題の番号）。
- まだ学んでいない行は「（8-7 で）」のように章を書き、**中身は書きすぎない**。

## 3. 場合分けの表（各章の柱）

**列：記号／こんなとき（見分け方）／手順（ふつうの定積分に直す）／例題**。表の上に題の帯 `\kviiigcasetitle{8-6}{題}`（「場合分けの表8-6」の札）。題の帯があるので `\bktabcaption` はつけない（「表3」と「表8-6」がまぎれないように）。表は1ページに入らなければ2つに分け、2つめの帯に「（つづき）」。

```latex
\kviiigcasetitle{8-6}{重積分：どんなときに、どう直す？}
\begin{bkcenter}
\begin{bktable}{colspec={Q[c,m,10mm] Q[l,m,33mm] X[l,m] Q[l,m,17mm]}, row{2-Z}={font=\small}, rowsep=3pt, colsep=4pt}
記号 & こんなとき & 手順（ふつうの定積分に直す） & 例題 \\
\kviiigcase{A} & 範囲が長方形 & $\displaystyle\int_c^d\Bigl(\int_a^b f\,\dd x\Bigr)\dd y$。内側では $y$ を止める。順番は自由 & 例題1 \\
\kviiigcase{A$'$} & …（′ は \kviiigcase{A$'$}） & … & 例題2 \\
\end{bktable}
\end{bkcenter}
```
- **場合の記号**（章ごと。巻末の索引もこの記号）：
  - **8-6 重積分**：A 長方形／A′ 長方形で $f=g(x)h(y)$（かけ算）／B 境目が曲線・三角形（たて線か横線で切る）／C 円・おうぎ形・輪（極座標 $r\,\dd r\,\dd\theta$）／C′ 円で $f$ が $r$ だけ（輪 $2\pi r\,\dd r$）／D 立体で切り口の面積がわかる（$\int A(z)\,\dd z$）／E 直方体・円柱・球（円柱座標・球座標）／F 簡単な形の和・差／G 対称性／H データだけ（表計算）。
  - **8-7 線積分**：A 軸に平行／B まっすぐなななめ／C $y=g(x)$ のグラフ／D 円・円弧／E 折れ線（区間ごと）／F 力が道と直角・平行で大きさ一定／G 保存力（$U$ の差）／H 閉じた道 ∮／I 長さでたす $\int f\,\dd s$／J データだけ（表計算）／K 状態の図（$p$-$V$ 図）。
  - **8-8 面積分**：A〜J（brief8-parts 3-2-3）。**8-11**：G1〜G7（ガウス）・S1〜S6（ストークス）。
- **表のすべての場合に、例題（またはじぶんでとこう）を1つ以上**。表の「例題」の列に番号を書く（`\bkreidairef{N}` は表の中では使わず「例題3」と書く。番号がずれたら直す）。

## 4. 例題の1行め：「場合：○○（表8-6のC）」

```latex
\kangaekata \kviiigbaai{円の面}{8-6}{C}\par          % → 場合：円の面（表8-6の[C]）
\kangaekata \kviiigbaai{円の面と対称性}{8-6}{C,G}\par % → 場合：円の面と対称性（表8-6の[C]と[G]）
```
- ○○は「どこを見てその場合だと決めたか」を短く（「範囲が三角形」「道が円」）。ほかの章の表を指すときも同じ形（8-8 から「（表8-6のC）」）。
- じぶんでとこうには書かない（例題と同じ形なので）。章末問題のこたえにも書かない。

## 5. 式の中で「名前」と「ふつうの定積分」を見分ける約束（デザイナー）

| | 枠 | 地 | 札（下に小さく） | コマンド |
| --- | --- | --- | --- | --- |
| **名前**（∬・∮…まだ計算できない記号） | **点線**・角丸・オレンジ（`bkOrange!85!black`） | 白 | 「名前」 | `\kviiigN{…}`・札つき `\kviiigNt{…}` |
| **ふつうの定積分**（数の範囲がついた ∫ のくり返し） | **実線**・角丸・巻の色 | 巻の色のうすい地（`bkTheme!8`） | 「ふつうの定積分」 | `\kviiigS{…}`・札つき `\kviiigSt{…}` |

```latex
\[ \kviiigNt{\iint_D\sigma\,\dd A}=\kviiigSt{\int_0^1\!\!\Bigl(\int_0^2(10+5x+2y)\,\dd x\Bigr)\dd y}=32 \]
```
- **点線＝まだ名前だけ、実線＝ここで計算できる**。線の形・地のあり／なし・札の3つで見分けられるので、白黒コピーや色の見分けにくい人にもわかる。中の字は黒（bkInk）。
- **使う所**（委員確認で必ずとなった所）：章で初めて「名前＝定積分」を書く所（札つき）、名前の段→直す段の変わり目の**大事な式のわく**、まとめ（たいせつ）、まちがえやすいところ（「名前」をそのまま計算しようとするまちがい）。例題の途中式すべてには使わない（ページがうるさくなる）。
- **文中には置かない**（行の間が広がる）。別の行（`\[ \]`）に立てる。

## 6. 流れ図の部品（ひし形の問い／四角の手順の2種類だけ。1ページに1つ）

**第14回の委員確認（r1・r2）で直した形。8-6（`tex/ch8-06.tex` の図5）と 8-7（図3）がこの形です。**

```latex
\begin{bkfigure}
\begin{tikzpicture}[x=1mm, y=0.9mm, kviiih q/.append style={aspect=4.6, inner sep=0.2mm}]
  \node[kviiih do, text width=76mm] (s) at (46,0) {記号を読む（名前の段）：何を・どの道で（向き）};
  \node[kviiih q] (q1) at (33,-18) {データだけ・数値で？};
  \node[kviiih do, text width=40mm, anchor=west] (rJ) at (71,-18) {表計算で…\enspace\kviiihcase{J}};
  \node[kviiih q] (q3) at (33,-66) {閉じた道（∮）？};
  \node[kviiih do, text width=40mm, anchor=west] (rH) at (71,-66) {1周を下の問いで計算\enspace\kviiihcase{H}};
  \node[kviiih q] (q4) at (33,-84) {力が式で書いてない？};
  ……
  \node[kviiih do, text width=104mm] (end) at (60,-199) {確かめ：…};
  % 「はい」は右へ、「いいえ」は下へ（「いいえ」の札は線の左）
  \foreach \q/\r in {q1/rJ,q3/rH,…} {\draw[kviiih go] (\q) -- node[kviiih yn, above] {はい} (\r);}
  \foreach \q/\r in {q1/qK,…,q9/rT} {\draw[kviiih go] (\q) -- node[kviiih yn, left=1mm] {いいえ} (\r);}
  % 「下の問いへ」の四角（H・E、8-6 の F・G）は、左の列の次の問いの上へもどる矢印
  \draw[kviiih go, shorten >=0.4mm] (rH.south) |- (33.8,-75.5);
  % 計算した四角は、右はしの1本の線（バス）にまとめて「確かめ」へ
  \foreach \n in {rJ,rK,rG,rF,rA,rB,rC,rD,rT} {\draw[bkInk!60, line width=0.7pt, shorten <=1.5mm] (\n.east) -- (\n.east -| 127,0);}
  \draw[bkInk!60, line width=0.7pt] (127,-18) -- (127,-199);
  \draw[kviiih go, shorten <=0pt] (127,-199) -- (end.east);
\end{tikzpicture}
\bkfigcaption{…の流れ図。ひし形は問い、四角はすること。…のあとは左の列の次の問いへもどる。計算した四角からは、右の線をたどって最後の「確かめ」へ。}
\end{bkfigure}
```

### 6-1 形の決まり
- **ひし形 `q`**＝問い、**四角 `do`**＝すること。この2つ以外の形は使わない。**1ページに1つ**。
- 問いは左に**たて1列**。「はい」は右の四角（または右の2つめのひし形）へ、「いいえ」は下の問いへ。**「いいえ」の札は線の左**（右から来るもどりの矢印とぶつからない）。
- **どの四角にも、入る矢印と出る矢印がある**（行き止まりを作らない）。
  - 計算が終わる四角（場合の記号つき）→ 右はしのバス（細い灰色の線 `bkInk!60`）にまとめて、いちばん下の「確かめ」の四角へ矢印1本。
  - 「下の問いへ」と書いた四角（8-6 の F・G、8-7 の H・E）→ 四角の下から、左の列の**次の問いの上**へもどる矢印（`|-` で折れる）。
  - 最後の「いいえ」も四角で受ける（8-7 の「道を $\vec r(t)$ で表す」）。その四角もバスへ。
- 場合の記号は、**すべて**どこかの四角に入れる（記号のない四角を作らない。「直方体」だけの四角は×→「直方体・ほかの形：範囲を内側から決めて3回 E」）。
- 問いの文は、**1行（15字まで）**がよい。2行のひし形は高さが2倍近くなり、10こ並ぶと1ページに入らない（8-7 で起きた）。`aspect=4.6` の平たいひし形にし、`y=0.9mm` くらいで1ページ（約200 mm）に収める。くわしい意味は場合分けの表の「こんなとき」に書く。
- 楽をする段の問い（データ・対称性・分ける・定理・保存力・閉じている）を上に、直す段の問い（形）を下に。

### 6-2 問いの文の決まり（はい・いいえが1つに決まる文）
- **だれが答えても同じ答えになる文**にする。「対称？」のように「何について」があいまいな問いは×。
  - 8-6：「対称性で0・同じ？」→「折り返し・回転で0や同じになる？」、「切り口の面積がわかる？」→「体積で、切り口の面積がわかる？」（球の慣性モーメントで D に行かないように）
  - 8-7：「保存力？」→「$U$ のわかる保存力？」（問題に $U$ が書いてあるか、本文で作ったものだけ）、「直角・平行で一定？」→「力が式で書いてない？」（摩擦力のように、式でなく大きさと向きで決まる力。式で書いた $\vec F_2$ が円の上で道と平行でも「いいえ」）、「データだけ？」→「データだけ・数値で？」（線分で近い値を出す例題も J に着く）
- 問題の文に、答えを決めるのに必要なことを書いておく（8-7 例題7 の「$\vec F_1=(y,\ x)$（$U=-xy$）」）。

### 6-3 例題を1つずつ流して確かめる（必ずやる）
流れ図を作ったら（直したら）、**その章のすべての例題とじぶんでとこう**を、流れ図の上から順にたどる。
1. 例題ごとに、1つずつの問いに「はい／いいえ」を答え、着いた四角の記号を書きとめる。
2. 着いた記号が、例題の1行め「場合：…（表8-□の○）」と同じかを見る。
3. ちがったら、**問いの順・問いの文**を直す（または、例題の1行めを、本当にたどる道すじどおりに2つの記号で書く：8-6 例題6「G と C′」、8-7 例題4「H と D」）。
4. 楽をする段の四角（G・H・E・F など）を通る例題は、「通った順」に書く。
5. 本文の例題の前に「例題を、流れ図でたどってみよう」の表（列：例題／題／「はい」と答えた問い／着いた所）を置くと、読む人も確かめられる（8-6・8-7 で置いた）。
6. 報告に「例題○題をたどり、すべて表の記号に着いた」と書く。

### 6-4 場合分けの表と流れ図の置き場所
- **表と流れ図は見開き**（表を左ページ、流れ図を右ページ）。表が1ページに入らないときは、表を左右の2ページに分け、流れ図はその直後の1ページに。
- 表がページの途中から始まって流れ図とはなれないよう、表の前の文（流れ図の使い方・「どの場合かな？」の練習）の量で左ページの頭に表が来るようにする。tryv の画像で、表が偶数ページ（左）、流れ図が次の奇数ページ（右）にあるのを確かめる。
- 表の帯の下に「A′・C′ の『′』は『A のなかま』という印。微分の印ではない」と1行（8-6）。

## 7. 章の中での置き場所（8-6 で使った並び）

1. **目でわかる**：やってみよう（表計算でタイルをたす）→ ①名前の段（記号の読み方。対応表をここで）。
2. **手でわかる**：表の行の合計の合計＝列の合計の合計 → ②直す段（いちばん簡単な場合 A）→ ここまでで十分。
3. **式でわかる**：場合分けの表と流れ図（見開きか、続けて2ページ）→ 場合ごとの小見出し（B・C…）→ ③楽をする段（対称性・分ける・データ）→ せいかくに言うと。
4. **たいせつ（まとめ）**：3つの段の札の3行＋場合分けの表を bktable で短く再掲（列：記号／こんなとき／直し方。8-6・8-7 と同じ形）。名前と定積分の枠の式も1つ。
5. **例題**：表の場合の順。1行めに `\kviiigbaai`。
6. **まちがえやすいところ**：「名前」をそのまま計算しようとする（∬ を「2回かける」と読む・$f\times$面積とする）を1つ入れる。

## 8. コード（章のファイルの先頭に。`kviiig` を置きかえる）

```latex
\makeatletter
\colorlet{kviiigNc}{bkOrange!85!black}% 名前の枠の線（点線）
\colorlet{kviiigSc}{bkTheme}% ふつうの定積分の枠の線（実線）
\colorlet{kviiigSb}{bkTheme!8}% ふつうの定積分の地
\tikzset{
  kviiig dan/.style={font=\sffamily\bfseries\footnotesize, rounded corners=1.2mm, inner xsep=1.6mm, inner ysep=0.5mm, line width=0.9pt},
  kviiig dan1/.style={kviiig dan, draw=kviiigNc, dash pattern=on 2.2pt off 1.4pt, fill=white, text=bkInk},
  kviiig dan2/.style={kviiig dan, draw=kviiigSc, fill=kviiigSb, text=bkInk},
  kviiig dan3/.style={kviiig dan, draw=bkTheme, fill=bkTheme, text=bkOn},
  kviiig name/.style={draw=kviiigNc, line width=0.9pt, dash pattern=on 2.2pt off 1.4pt, rounded corners=1.2mm, inner xsep=1.2mm, inner ysep=1.2mm, fill=white},
  kviiig seki/.style={draw=kviiigSc, line width=0.9pt, rounded corners=1.2mm, inner xsep=1.2mm, inner ysep=1.2mm, fill=kviiigSb},
  kviiig tag/.style={font=\sffamily\bfseries\footnotesize, text=bkInk, inner sep=0.4mm},
  kviiig q/.style={diamond, aspect=2.4, draw=bkYellow!75!black, line width=0.9pt, fill=bkYellowBg, font=\sffamily\footnotesize, align=center, inner sep=0.3mm, text=bkInk},
  kviiig do/.style={rectangle, draw=\bkTT, line width=0.9pt, fill=white, rounded corners=0.6mm, font=\sffamily\footnotesize, align=center, inner xsep=1.5mm, inner ysep=1.2mm, text=bkInk},
  kviiig go/.style={-{Stealth[length=2.2mm]}, line width=0.9pt, bkInk!75, shorten <=1.5mm, shorten >=1.5mm},
  kviiig yn/.style={font=\sffamily\bfseries\footnotesize, text=bkInk, fill=white, inner sep=0.5mm},
}
% 段の札（例題の中で）  \kviiigdan{1|2|3}
\newcommand\kviiigdan[1]{\tikz[baseline=(d.base)]\node[kviiig dan#1] (d) {\vphantom{あ}\ifcase#1\or 名前\or 直す\or 楽をする\fi};}
% 段の見出し（本文で）  \kviiigdanhead{1|2|3}{見出し}
\newcommand\kviiigdanhead[2]{\par\addvspace{8pt}\Needspace{7\baselineskip}\noindent
  \tikz[baseline=(d.base)]\node[kviiig dan#1, font=\sffamily\bfseries\small, inner ysep=0.8mm] (d) {\vphantom{あ}\ifcase#1\or ①\,名前の段\or ②\,直す段\or ③\,楽をする段\fi};%
  \hspace{0.7\zw}{\sffamily\bfseries\color{\bkTT}#2}\par\nobreak\vspace{3pt}\noindent\ignorespaces}
% 場合の札  \kviiigcase{C}（′ は \kviiigcase{A$'$}）
\newcommand\kviiigcase[1]{\tikz[baseline=(c.base)]\node[fill=bkTheme, text=bkOn, font=\sffamily\bfseries\small, rounded corners=0.8mm, inner xsep=1mm, inner ysep=0.6mm, minimum width=5.4mm] (c) {\vphantom{Ag}#1};}
% 例題の1行め  \kviiigbaai{ことば}{8-6}{C}（場合が2つなら {C,G}）
\newcommand\kviiigbaai[3]{{\sffamily\bfseries 場合：}#1（表#2の\kviiig@cases#3,\@nil）}
\def\kviiig@cases#1,#2\@nil{\kviiigcase{#1}\ifx\relax#2\relax\else と\kviiig@cases#2\@nil\fi}
% 式の中の「名前」と「ふつうの定積分」
\newcommand\kviiigN[1]{\tikz[baseline=(n.base)]\node[kviiig name] (n) {$\displaystyle #1$};}
\newcommand\kviiigS[1]{\tikz[baseline=(n.base)]\node[kviiig seki] (n) {$\displaystyle #1$};}
\newcommand\kviiigNt[1]{\tikz[baseline=(n.base)]{\node[kviiig name] (n) {$\displaystyle #1$};\node[kviiig tag, anchor=north] at ([yshift=-0.8mm]n.south) {名前};}}
\newcommand\kviiigSt[1]{\tikz[baseline=(n.base)]{\node[kviiig seki] (n) {$\displaystyle #1$};\node[kviiig tag, anchor=north] at ([yshift=-0.8mm]n.south) {ふつうの定積分};}}
% 場合分けの表の題の帯  \kviiigcasetitle{8-6}{題}
\newcommand\kviiigcasetitle[2]{\par\addvspace{6pt}\Needspace{8\baselineskip}\noindent\begin{tikzpicture}[baseline=(t.base)]
  \node[fill=bkTheme, text=bkOn, font=\sffamily\bfseries\small, rounded corners=1mm, inner xsep=2mm, inner ysep=1mm] (t) {場合分けの表\,#1};
  \node[anchor=west, font=\sffamily\bfseries, text=\bkTT, inner sep=0pt] at ([xshift=2mm]t.east) {#2};
  \end{tikzpicture}\par\nobreak\vspace{3pt}}
% タイルの小さな絵（対応表の左の列）  \kviiigpic{1〜7}：tex/ch8-06.tex の先頭を写す（長いのでここでは略）
\makeatother
```
（`\kviiigpic` の中身は `tex/ch8-06.tex` の先頭からそのまま写してください。）

## 9. 試し組みで確かめたこと
- `\oiint`（∯）・`\oint`・`\iint`・`\iiint` は、いまの数式フォント（Latin Modern Math）で出る（8-6 の試し組みで確認）。
- 札・枠・ひし形・四角は、エラー0・1.7pt 超のはみ出し0（tryv 8-6）。
- 文中の `\kviiigN`・`\kviiigS` は行の間を広げるので、別の行に立てる。
- 表の中で `\kviiigcase` を使うと、行の高さが少しふえる（`rowsep=3pt` でちょうどよい）。
