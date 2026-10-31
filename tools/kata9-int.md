# 「名前と操作」の型（第9巻・組 V9-2、10月29日）

依頼者の指示（10月29日 13:34）「操作の名前と実際の操作の違いは相当わかりにくく、どのような操作をすれば求められるのかも場合によりけりなので、この場合はどうすれば良いのかを丁寧にする必要がある」を、第9巻の紙面の形にした型です。**第8巻の型（`tools/kata8-int.md`）をそのまま受けつぎ**、第9巻で足したのは次の3つだけです。
1. **実線の札が4種類**：「ふつうの定積分」「表を引く」「部分分数」「行列の計算」（第15回の決定9。字で区別し、色だけにたよらない）。
2. 例題の直す段の札に、どの道具かをそえる `\kixcnaosu{1〜4}`（「直す：表を引く」の1枚の札）。場合分けの表の「手順」の頭にも札を置く。
3. 名前と操作の対応表（9-0 の予告・巻末の「変換の地図」・9-13）の小さな絵 `\kixcpic{1〜7}`。

**使う章**：9-1〜9-11 のすべて（9-1 は予告、9-2 が柱、9-3〜9-11 で同じ型をくり返す）、9-0 の予告、9-12（名前の段だけで読み「直す段は表9-○の○」）、9-13、巻末の変換の地図。
下のコード（8章）は、試し組み（`python3 tools/tryv.py 9-2 …`）でエラー0・はみ出し0を確かめてあります。

**頭文字の置きかえ**：コードの `kixc`（9-2 の頭文字）を、自分の章の頭文字に全部置きかえて、章のファイルの先頭に写します。

| 章 | 頭文字 | 置きかえ |
| --- | --- | --- |
| 9-0 | kixa | `sed 's/kixc/kixa/g'` |
| 9-1 | kixb | `sed 's/kixc/kixb/g'` |
| 9-2 | kixc | そのまま |
| 9-3 | kixd | `sed 's/kixc/kixd/g'` |
| 9-4 | kixe | 〃 |
| 9-5 | kixf | 〃 |
| 9-6 | kixg | 〃 |
| 9-7 | kixh | 〃 |
| 9-8 | kixi | 〃 |
| 9-9 | kixj | 〃 |
| 9-10 | kixk | 〃 |
| 9-11 | kixl | 〃 |
| 9-12 | kixm | 〃 |
| 9-13 | kixn | 〃 |
| 巻末（変換の地図） | kixz | 〃 |

（a から数えて N+1 番めの英小文字。章の中の自分の部品も同じ頭文字で：`\kixchead`・`\kixcbox` など。）共通のファイル（bk-*.sty）には入れません（直したい所は報告に）。`\foreach` の変数も `\kixcq` のように頭文字をつける。

---

## 0. 考え方（全組で同じことばを使う）

- $a_n$・$b_n$・$c_n$・$F(\omega)$・$\mathcal L[f(t)]$・$\mathcal L^{-1}[F(s)]$・$G(s)$・$e^{At}$ は**操作の名前**。記号を見ただけでは、まだ数は出ない。
  - $a_n$：「1周期で、$f$ に $\cos n\omega_0t$ をかけてたし合わせ、$\frac2T$ 倍」という操作の名前。
  - $\mathcal L[f(t)]$：「$0$ から $\infty$ まで、$f$ に $e^{-st}$ をかけてたす」という操作の名前。
  - $\mathcal L^{-1}[F(s)]$：「ラプラス変換すると $F(s)$ になる $f(t)$」の名前（名前の上の式＝複素数の積分は使わない）。
  - $G(s)$：「はじめの値を0にしたときの、出てくるもの÷入れるもの」の名前。
  - $e^{At}$：「$I+At+\frac{(At)^2}{2!}+\cdots$ という無限に続くたし算」の名前。
- 実際の値は、次の4つの道具（**実際の操作**＝実線の札）のどれかに直して求める。
  1. **ふつうの定積分**（第5巻の $\int_a^b\cdots\,dt$。区間に分ける・部分積分・広義積分）
  2. **表を引く**（変換表・性質の表。表の行は1回だけ自分で作ってから引く）
  3. **部分分数**（3-8。表にある形 $\frac{1}{s-p}$ に分ける）
  4. **行列の計算**（固有値・対角化・逆行列：第7巻）
- 5つめの「**数値**」（表計算・FFT・Python の `expm`）は、③楽をする段の (エ) とする（第8巻と同じ。札は「楽をする」）。公式で書き直す・対称性で0・最終値の定理のように**積分も変換もしない**ものも③。
- ことば：「名前」「直す」「楽をする」「場合」「道具」。**「実際の操作」は各章で1回だけ紹介し、ふだんは「ふつうの定積分に直す」「表を引く」「部分分数に分ける」「行列の計算にする」と言う。**

## 1. 3つの段（名前の段 → 直す段 → 楽をする段）

| 段 | すること | 札の形（色だけにたよらない） |
| --- | --- | --- |
| ①**名前の段** | 記号を読む：**何に**（$f$）・**何をかけて**（$\cos n\omega_0t$・$e^{-jn\omega_0t}$・$e^{-j\omega t}$・$e^{-st}$）・**どこからどこまで**（1周期・$-\infty$〜$\infty$・$0$〜$\infty$）・**何を何でわるか**（$Y\div U$） | 白い地・**点線**の枠（オレンジの線）。札の字「名前」 |
| ②**直す段** | (a) どの道具に直すかを決める（4つの実線の札のどれか）→ (b) 区間・形・範囲を決める → (c) 計算する | うすい地・**実線**の枠（巻の色）。札の字「直す」、例題では「直す：表を引く」 |
| ③**楽をする段**（②の前に必ず確かめる） | (ア) **積分しない**：公式で書き直せる・表にある・性質（ずらす・微分）・最終値だけ (イ) **対称性**：偶関数・奇関数で0、半分の2倍 (ウ) **分ける**：区間ごと・項ごと (エ) **数値**：表計算・Python | 巻の色で**ぬりつぶし**・白い字。札の字「楽をする」 |

- **本文**：3つの段の見出しは `\kixcdanhead{1}{見出し}`（「①名前の段」の札＋見出し）。1つの操作の説明の中で ①→②→③ の順に出す。章の3段（`\bkstage` の目・手・式）とは別もの（その中の1つ下の段）。
- **例題の中**：番号なしの小さな札を行の頭に置く。`\kixcdan{1}`（名前）・`\kixcdan{3}`（楽をする）・`\kixcnaosu{1〜4}`（「直す：ふつうの定積分」「直す：表を引く」「直す：部分分数」「直す：行列の計算」）。道具を言わないときは `\kixcdan{2}`（「直す」だけ）。**③を使ったときは、②の前に置く**（流れ図で先に問うので）。計算そのものは `\shiki` の中。
- 例題の形（必ずこの順。**「名前」の札の行は、積分・変換しない例題でも必ず書く**：「名前は $b_n$ だが、ここでは積分しない（公式で書き直す）」「名前は $\mathcal L$ だが、ここでは表を引くだけ」）：
```latex
\begin{reidai}[題]
問題文\par
\kangaekata \kixcbaai{区間ごとに一定}{9-2}{B}\par
\kixcdan{1}\enspace $b_n$：1周期で $f$ に $\sin n\omega_0t$ をかけてたし、$\tfrac{2}{T}$ 倍。\par
\kixcdan{3}\enspace （使うときだけ）奇関数なので $a_n=0$。\par
\kixcnaosu{1}\enspace 1周期を、$f=1$ の区間と $f=-1$ の区間に分ける。\par
\shiki …（式の変形は1行に1つ。bkhenkei か、章の字下げの部品で）\par
\kotae …
\end{reidai}
```

## 2. 名前と操作の対応表（9-0 の予告・巻末の変換の地図・9-13）

列：**絵／名前（記号）／名前の意味（何をかけて、どこからどこまでたすか）／実際の操作（実線の札）／章**。絵は `\kixcpic{1〜7}`：1 フーリエ係数（1周期の波に cos をかける）、2 複素係数（回る矢印）、3 フーリエ変換（−∞〜∞ の両向きの軸とパルス）、4 ラプラス変換（0 から、$e^{-st}$ で小さくなる面積）、5 逆ラプラス変換（$s$ の平面の極 ×）、6 伝達関数（$U\to$ 箱 $G\to Y$）、7 $e^{At}$（行列とうずまき）。

```latex
\begin{bkcenter}
\begin{bktable}{colspec={Q[c,m,17mm] Q[c,m,24mm] X[l,m] Q[l,m,30mm] Q[c,m,11mm]}, row{2-Z}={font=\small}, rowsep=3pt, colsep=3pt}
絵 & 名前（記号） & 名前の意味 & 実際の操作 & 章 \\
\kixcpic{1} & $a_n$・$b_n$ & 1周期で $f$ に $\cos n\omega_0t$・$\sin n\omega_0t$ をかけてたし、$\frac2T$ 倍 & \kixcop{1} & 9-1・9-2 \\
\kixcpic{2} & $c_n$ & 1周期で $f$ に $e^{-jn\omega_0t}$ をかけてたし、$\frac1T$ 倍 & \kixcop{1} & 9-3 \\
\kixcpic{3} & $F(\omega)$ & $-\infty$〜$\infty$ で $f$ に $e^{-j\omega t}$ をかけてたす & \kixcop{1}\par\kixcop{2} & 9-4 \\
\kixcpic{4} & $\mathcal L[f(t)]$ & $0$〜$\infty$ で $f$ に $e^{-st}$ をかけてたす & \kixcop{2} & 9-5・9-6 \\
\kixcpic{5} & $\mathcal L^{-1}[F(s)]$ & ラプラス変換すると $F(s)$ になる $f(t)$ & \kixcop{3}\par\kixcop{2} & 9-7 \\
\kixcpic{6} & $G(s)$ & はじめの値を0にして、$Y(s)\div U(s)$ & \kixcop{2} & 9-8 \\
\kixcpic{7} & $e^{At}$ & $I+At+\frac{(At)^2}{2!}+\cdots$ & \kixcop{4} & 9-10・9-11 \\
\end{bktable}
\bktabcaption{名前と、実際の操作（どの道具に直すか）。}
\end{bkcenter}
```
- 9-0 の予告は、「名前（記号）」と「実際の操作」の2列＋章だけでもよい。まだ学んでいない行は「（9-5 で）」と章を書き、**中身は書きすぎない**。
- 巻末の変換の地図＝この表＋全体の流れ図（brief9-parts 3-2-0 (3)）＋2つの世界の図（kata9.md）＋場合の記号の索引（記号・章・例題の番号）。

## 3. 場合分けの表（各章の柱）

**表は6つ**：表9-2（フーリエ係数。9-1 で一部を予告、9-3 で J を足して再掲）・表9-4（フーリエ変換）・表9-6（ラプラス変換。9-5 は A・B・E だけ予告）・表9-7（逆ラプラス変換）・表9-8（伝達関数）・表9-11（$e^{At}$。9-10 で予告）。場合の記号は brief9-parts.md 3-2-1〜3-2-6 のとおり（A〜I など）。**番号は「表のある章」の番号**（9-1 の例題も「表9-2のB」と書く）。

**列：記号／こんなとき（見分け方）／手順（頭に札）／例題**。手順の頭には、その場合で使う**道具の札**を置く：実線の `\kixcop{1〜4}`（直す段）か、ぬりつぶしの `\kixcdan{3}`（楽をする段：積分しない・対称性・数値）。表の上に題の帯 `\kixccasetitle{9-2}{題}`（「場合分けの表9-2」の札）。帯があるので `\bktabcaption` はつけない。表が1ページに入らなければ2つに分け、2つめの帯に「（つづき）」。

```latex
\kixccasetitle{9-2}{フーリエ係数：どんなときに、どう求める？}
\begin{bkcenter}
\begin{bktable}{colspec={Q[c,m,10mm] Q[l,m,32mm] X[l,m] Q[c,m,13mm]}, row{2-Z}={font=\small}, rowsep=3pt, colsep=4pt}
記号 & こんなとき & 手順 & 例題 \\
\kixccase{A} & すでに $\sin$・$\cos$ の和や積で書ける & \kixcdan{3}\enspace 積分しない。公式で書き直して係数を読む & 1 \\
\kixccase{B} & 区間ごとに一定（方形波） & \kixcop{1}\enspace 区間に分けて定積分。$\cos n\pi=(-1)^n$ & 2 \\
\end{bktable}
\end{bkcenter}
```
- **表のすべての場合に、例題（またはじぶんでとこう）を1つ以上**。表の「例題」の列に番号を書く（表の中では `\bkreidairef` を使わず数字で。番号がずれたら直す）。
- 表の帯の下に、記号の読み方を1行（「′ は『A のなかま』という印。微分の印ではない」など、必要なときだけ）。
- たいせつの「場合のまとめ」も同じ表の形（列：記号／こんなとき／直し方）。

## 4. 例題の1行め：「場合：○○（表9-2のB）」

```latex
\kangaekata \kixcbaai{区間ごとに一定}{9-2}{B}\par            % → 場合：区間ごとに一定（表9-2の[B]）
\kangaekata \kixcbaai{奇関数で、区間ごとに一定}{9-2}{D,B}\par  % → 場合：…（表9-2の[D]と[B]）
```
- ○○は「どこを見てその場合だと決めたか」を短く（「区間ごとに一定」「分母が1次式のかけ算」）。
- **場合が2つのときは、流れ図で通った順に書く**（楽をする段の四角→直す段の四角）。
- ほかの章の表を指すときも同じ形（9-7 から「（表9-6のC）」）。じぶんでとこう・章末問題のこたえには書かない。

## 5. 式の中で「名前」と「実際の操作」を見分ける約束（デザイナー）

| | 枠 | 地 | 札（下に小さく） | コマンド |
| --- | --- | --- | --- | --- |
| **名前**（$b_n$・$\mathcal L[\ ]$・$G(s)$・$e^{At}$…まだ数の出ない記号） | **点線**・角丸・オレンジ（`bkOrange!85!black`） | 白 | 「名前」 | `\kixcN{…}`・札つき `\kixcNt{…}` |
| **実際の操作**（ここで計算できる形） | **実線**・角丸・巻の色 | 巻の色のうすい地（`bkTheme!8`） | 「ふつうの定積分」「表を引く」「部分分数」「行列の計算」の4つ | `\kixcS{…}`・札つき `\kixcSt{1〜4}{…}` |

```latex
\[ \kixcNt{b_n}=\kixcSt{1}{\frac{2}{T}\int_0^T f(t)\sin n\omega_0t\,dt} \]
\[ \kixcNt{\mathcal L[e^{-2t}]}=\kixcSt{2}{\frac{1}{s+2}} \]
\[ \kixcNt{\mathcal L^{-1}\Bigl[\frac{1}{(s+1)(s+2)}\Bigr]}=\kixcSt{3}{\frac{1}{s+1}-\frac{1}{s+2}}\to e^{-t}-e^{-2t} \]
\[ \kixcNt{e^{At}}=\kixcSt{4}{Pe^{Dt}P^{-1}} \]
```
- **点線＝まだ名前だけ、実線＝ここで計算できる**。線の形・地のあり／なし・札の字の3つで見分けられる（白黒コピーでもわかる）。中の字は黒（bkInk）。
- **使う所**：章で初めて「名前＝実際の操作」を書く所（札つき）、名前の段→直す段の変わり目の大事な式、たいせつ、まちがえやすいところ（名前をそのまま計算しようとする・名前と道具の取りちがえ）。例題の途中式すべてには使わない。
- **文中には置かない**（行の間が広がる）。別の行（`\[ \]`）に立てる。1行に2つ並べると、はば（132 mm）をこえやすい（試し組みで13 pt はみ出した）。**1行に1つ**。

## 6. 流れ図の部品（ひし形の問い／四角の手順の2種類だけ。1ページに1つ）

第8巻の 8-6・8-7 の形（`tex/ch8-07.tex` の図）をそのまま使う。ひし形は `kixc q`（平たい `aspect=4.6`）、四角は `kixc do`、矢印は `kixc go`、はい・いいえは `kixc yn`。**ひし形と四角の字は `align=flush center`**（`align=center` に `text width` をつけると、短い字が「記 号 を 読 む」のように間がのびる。試し組みで見つけたので型で直した）。

```latex
\begin{bkfigure}
\begin{tikzpicture}[x=1mm, y=0.9mm]
  \node[kixc do, text width=76mm] (s) at (46,0) {記号を読む（名前の段）：どの波 $f$・周期 $T$・どの係数か};
  \node[kixc q] (q1) at (33,-18) {式がなく、はかった値だけ？};
  \node[kixc do, text width=40mm, anchor=west] (rI) at (71,-18) {表計算で和\enspace\kixccase{I}};
  \node[kixc q] (q2) at (33,-36) {……？};
  \node[kixc do, text width=40mm, anchor=west] (rE) at (71,-36) {……下の問いへ\enspace\kixccase{E}};
  ……
  \node[kixc do, text width=40mm] (rT) at (33,-150) {最後の「いいえ」も四角で受ける\enspace\kixccase{H}};
  \node[kixc do, text width=104mm] (end) at (60,-168) {確かめ：……};
  \draw[kixc go] (s.south -| q1) -- (q1);
  % 「はい」は右へ、「いいえ」は下へ（「いいえ」の札は線の左）
  \foreach \kixcq/\kixcr in {q1/rI,q2/rE,…} {\draw[kixc go] (\kixcq) -- node[kixc yn, above] {はい} (\kixcr);}
  \foreach \kixcq/\kixcr in {q1/q2,…,qN/rT} {\draw[kixc go] (\kixcq) -- node[kixc yn, left=1mm] {いいえ} (\kixcr);}
  % 「下の問いへ」の四角は、四角の下から、左の列の次の問いの上へもどる矢印
  \draw[kixc go, shorten >=0.4mm] (rE.south) |- (33.8,-45.5);
  % 計算が終わる四角は、右はしの1本の線（バス）にまとめて「確かめ」へ
  \foreach \kixcn in {rI,…,rT} {\draw[bkInk!60, line width=0.7pt, shorten <=1.5mm] (\kixcn.east) -- (\kixcn.east -| 127,0);}
  \draw[bkInk!60, line width=0.7pt] (127,-18) -- (127,-168);
  \draw[kixc go, shorten <=0pt] (127,-168) -- (end.east);
\end{tikzpicture}
\bkfigcaption{……の流れ図。ひし形は問い、四角はすること。○・○のあとは左の列の次の問いへもどる。計算した四角からは、右の線をたどって最後の「確かめ」へ。}
\label{bk:9-N:fig-flow}
\end{bkfigure}
```
- 「下の問いへ」のもどり矢印の行き先の y は、**次のひし形の上のはし**（ひし形の中心の y＋約9.5。y=0.9mm のとき）。試し組みの画像で、矢印の先がひし形の角に届いているか拡大して確かめる。
- ひし形の右に四角を置くときは `anchor=west` で x=71 から、はば40 mm（右はしは 113 mm＋枠）。バスは x=127。

### 6-1 形の決まり（第8巻の委員確認の決まり。必ず守る）
- **ひし形 `q`**＝問い、**四角 `do`**＝すること。この2つ以外の形は使わない。**1ページに1つ**。
- 問いは左に**たて1列**。「はい」は右の四角へ、「いいえ」は下の問いへ。**「いいえ」の札は線の左**。
- **どの四角にも、入る矢印と出る矢印がある**（行き止まりを作らない）。
  - 計算が終わる四角（場合の記号つき）→ 右はしのバス（細い灰色の線 `bkInk!60`）にまとめて、いちばん下の「確かめ」の四角へ矢印1本。
  - 「下の問いへ」と書いた四角（表9-2の E・F・D、表9-6の B・F・D・C、表9-7の F・G、表9-8の A・D・C・B、表9-11の G など）→ 四角の下から、左の列の**次の問いの上**へもどる矢印（`|-` で折れる）。
  - 最後の「いいえ」も四角で受ける。その四角もバスへ。
- 場合の記号は、**すべて**どこかの四角に入れる（記号のない四角を作らない）。
- 問いの文は、**1行（15字まで）**がよい。2行のひし形は高さが2倍近くなる。`y=0.9mm` で1ページ（約200 mm）に10こまで。くわしい意味は場合分けの表の「こんなとき」に。
- 楽をする段の問い（式がなく、はかった値だけ・公式で書ける・平均だけ・最終値だけ・落ち着くかだけ）を上に、直す段の問い（形）を下に。
- 「確かめ」の四角には、その表の確かめ方を書く（表9-2：何項かたしたグラフがもとの波に近づくか・パーセバル。表9-7：$t=0$ の値・最終値・オイラー法の表。表9-11：$t=0$ で $I$）。

### 6-2 問いの文の決まり（はい・いいえが1つに決まる文）
- **だれが答えても同じ答えになる文**にする。「対称？」→「グラフが縦軸で折り返して重なるか、原点で半回転して重なる？」のように「何が・どうなる」を書く（長ければ、表の「こんなとき」に書いて、ひし形は「偶関数か奇関数？」）。
- 問題の文に、答えを決めるのに必要なことを書いておく（「周期 $2\pi$ の」「はじめの値はすべて0」）。

### 6-3 例題を1つずつ流して確かめる（必ずやる）
流れ図を作ったら（直したら）、**その章のすべての例題とじぶんでとこう**を、流れ図の上から順にたどる。
1. 例題ごとに、1つずつの問いに「はい／いいえ」を答え、着いた四角の記号を書きとめる。
2. 着いた記号が、例題の1行め「場合：…（表9-□の○）」と同じかを見る。
3. ちがったら、**問いの順・問いの文**を直す（または、例題の1行めを、本当にたどる道すじどおりに2つの記号で書く：「D と B」）。
4. 楽をする段の四角を通る例題は、「通った順」に書く。
5. 本文の例題の前に「例題を、流れ図でたどってみよう」の表（列：例題／題／「はい」と答えた問い／着いた所）を置く。
6. 報告に「例題○題・じぶんでとこう○題をたどり、すべて表の記号に着いた」と書く。

### 6-4 場合分けの表と流れ図の置き場所
- **表と流れ図は見開き**（表を左ページ＝偶数、流れ図を右ページ＝奇数）。表が1ページに入らないときは表を左右の2ページに分け、流れ図はその直後の1ページに。
- 表の前の文（流れ図の使い方・「どの場合かな？」の練習）の量で、左ページの頭に表が来るようにする。tryv の画像で確かめる。

## 7. 章の中での置き場所（第8巻 8-6・8-7 と同じ並び）

1. **目でわかる**：やってみよう（表計算で数を先に見る）→ ①名前の段（記号の読み方。対応表の1行をここで）。
2. **手でわかる**：表計算の数と、いちばん簡単な場合の②直す段 → ここまでで十分（`\bkkokomade`）。
3. **式でわかる**：場合分けの表と流れ図（見開き）→ 場合ごとの小見出し → ③楽をする段 → せいかくに言うと。
4. **たいせつ（まとめ）**：3つの段の札の3行＋場合分けの表を bktable で短く再掲。名前（点線）と実際の操作（実線）の枠の式も1つ。
5. **例題**：表の場合の順。1行めに `\kixcbaai`、2行めに `\kixcdan{1}` の名前の行。
6. **まちがえやすいところ**：「名前」をそのまま計算しようとする・道具の取りちがえ（例：$\mathcal L^{-1}$ を「$e^{st}$ をかけて積分」としてしまう、$b_n$ を $f$ の値と思う）を1つ入れる。

## 8. コード（章のファイルの先頭に。`kixc` を置きかえる）

```latex
\makeatletter
%% ===== 「名前と操作」の型（tools/kata9-int.md、組 V9-2）。頭文字 kixc は章ごとに置きかえる =====
\colorlet{kixcNc}{bkOrange!85!black}% 名前の枠の線（点線）
\colorlet{kixcSc}{bkTheme}% 実際の操作の枠の線（実線）
\colorlet{kixcSb}{bkTheme!8}% 実際の操作の地
\tikzset{
  kixc dan/.style={font=\sffamily\bfseries\footnotesize, rounded corners=1.2mm, inner xsep=1.6mm, inner ysep=0.5mm, line width=0.9pt},
  kixc dan1/.style={kixc dan, draw=kixcNc, dash pattern=on 2.2pt off 1.4pt, fill=white, text=bkInk},
  kixc dan2/.style={kixc dan, draw=kixcSc, fill=kixcSb, text=bkInk},
  kixc dan3/.style={kixc dan, draw=bkTheme, fill=bkTheme, text=bkOn},
  kixc name/.style={draw=kixcNc, line width=0.9pt, dash pattern=on 2.2pt off 1.4pt, rounded corners=1.2mm, inner xsep=1.2mm, inner ysep=1.2mm, fill=white},
  kixc seki/.style={draw=kixcSc, line width=0.9pt, rounded corners=1.2mm, inner xsep=1.2mm, inner ysep=1.2mm, fill=kixcSb},
  kixc tag/.style={font=\sffamily\bfseries\footnotesize, text=bkInk, inner sep=0.4mm},
  kixc q/.style={diamond, aspect=4.6, draw=bkYellow!75!black, line width=0.9pt, fill=bkYellowBg, font=\sffamily\footnotesize, align=flush center, inner sep=0.2mm, text=bkInk},
  kixc do/.style={rectangle, draw=\bkTT, line width=0.9pt, fill=white, rounded corners=0.6mm, font=\sffamily\footnotesize, align=flush center, inner xsep=1.5mm, inner ysep=1.2mm, text=bkInk},
  kixc go/.style={-{Stealth[length=2.2mm]}, line width=0.9pt, bkInk!75, shorten <=1.5mm, shorten >=1.5mm},
  kixc yn/.style={font=\sffamily\bfseries\footnotesize, text=bkInk, fill=white, inner sep=0.5mm},
}
% 実際の操作の4種類の名前（実線の札の字）  1 ふつうの定積分　2 表を引く　3 部分分数　4 行列の計算
\def\kixc@op#1{\ifcase#1\or ふつうの定積分\or 表を引く\or 部分分数\or 行列の計算\fi}
% 段の札（例題の中で）  \kixcdan{1|2|3}
\newcommand\kixcdan[1]{\tikz[baseline=(d.base)]\node[kixc dan#1] (d) {\vphantom{あ}\ifcase#1\or 名前\or 直す\or 楽をする\fi};}
% 直す段の札に、どの道具かをそえる（例題の中で）  \kixcnaosu{1|2|3|4} →「直す：表を引く」
\newcommand\kixcnaosu[1]{\tikz[baseline=(d.base)]\node[kixc dan2] (d) {\vphantom{あ}直す：\kixc@op{#1}};}
% 実線の札だけ（表の「手順」の頭・本文）  \kixcop{1|2|3|4}
\newcommand\kixcop[1]{\tikz[baseline=(d.base)]\node[kixc dan2] (d) {\vphantom{あ}\kixc@op{#1}};}
% 段の見出し（本文で）  \kixcdanhead{1|2|3}{見出し}
\newcommand\kixcdanhead[2]{\par\addvspace{8pt}\Needspace{7\baselineskip}\noindent
  \tikz[baseline=(d.base)]\node[kixc dan#1, font=\sffamily\bfseries\small, inner ysep=0.8mm] (d) {\vphantom{あ}\ifcase#1\or ①\,名前の段\or ②\,直す段\or ③\,楽をする段\fi};%
  \hspace{0.7\zw}{\sffamily\bfseries\color{\bkTT}#2}\par\nobreak\vspace{3pt}\noindent\ignorespaces}
% 場合の札  \kixccase{C}（′ は \kixccase{A$'$}）
\newcommand\kixccase[1]{\tikz[baseline=(c.base)]\node[fill=bkTheme, text=bkOn, font=\sffamily\bfseries\small, rounded corners=0.8mm, inner xsep=1mm, inner ysep=0.6mm, minimum width=5.4mm] (c) {\vphantom{Ag}#1};}
% 例題の1行め  \kixcbaai{ことば}{9-2}{C}（場合が2つなら {D,B}：通った順）
\newcommand\kixcbaai[3]{{\sffamily\bfseries 場合：}#1（表#2の\kixc@cases#3,\@nil）}
\def\kixc@cases#1,#2\@nil{\kixccase{#1}\ifx\relax#2\relax\else と\kixc@cases#2\@nil\fi}
% 式の中の「名前」（点線）と「実際の操作」（実線）
\newcommand\kixcN[1]{\tikz[baseline=(n.base)]\node[kixc name] (n) {$\displaystyle #1$};}
\newcommand\kixcNt[1]{\tikz[baseline=(n.base)]{\node[kixc name] (n) {$\displaystyle #1$};\node[kixc tag, anchor=north] at ([yshift=-0.8mm]n.south) {名前};}}
\newcommand\kixcS[1]{\tikz[baseline=(n.base)]\node[kixc seki] (n) {$\displaystyle #1$};}
% 札つきの実線の枠  \kixcSt{1|2|3|4}{式}（札の字：ふつうの定積分・表を引く・部分分数・行列の計算）
\newcommand\kixcSt[2]{\tikz[baseline=(n.base)]{\node[kixc seki] (n) {$\displaystyle #2$};\node[kixc tag, anchor=north] at ([yshift=-0.8mm]n.south) {\kixc@op{#1}};}}
% 場合分けの表の題の帯  \kixccasetitle{9-2}{題}
\newcommand\kixccasetitle[2]{\par\addvspace{6pt}\Needspace{8\baselineskip}\noindent\begin{tikzpicture}[baseline=(t.base)]
  \node[fill=bkTheme, text=bkOn, font=\sffamily\bfseries\small, rounded corners=1mm, inner xsep=2mm, inner ysep=1mm] (t) {場合分けの表\,#1};
  \node[anchor=west, font=\sffamily\bfseries, text=\bkTT, inner sep=0pt] at ([xshift=2mm]t.east) {#2};
  \end{tikzpicture}\par\nobreak\vspace{3pt}}
% 名前と操作の対応表の小さな絵  \kixcpic{1〜7}
%  1 フーリエ係数（1周期で cos をかける）　2 複素係数（回る矢印）　3 フーリエ変換（−∞〜∞）
%  4 ラプラス変換（0から、e^{-st} で小さく）　5 逆ラプラス変換（s の平面の極）　6 伝達関数（箱）　7 e^{At}（行列とうずまき）
\newcommand\kixcpic[1]{\begin{tikzpicture}[x=1mm, y=1mm, baseline=(current bounding box.center)]
  \ifcase#1\or
  \draw[bkGray, line width=0.4pt] (0,4) -- (14,4);
  \draw[bkInk, line width=0.8pt] (1,4) -- (1,7) -- (7,7) -- (7,1) -- (13,1) -- (13,4);
  \draw[bkTheme, line width=0.8pt, dash pattern=on 1.6pt off 0.9pt, domain=1:13, samples=40, smooth] plot (\x,{4+2.6*cos(30*(\x-1))});
  \draw[bkInk, line width=0.5pt] (1,-0.6) -- (1,-1.6) -- (13,-1.6) -- (13,-0.6);
  \or
  \draw[bkGray, line width=0.4pt] (2,4) -- (12,4) (7,-0.5) -- (7,8.5);
  \draw[bkInk, line width=0.7pt] (7,4) circle (3.6);
  \draw[bkTheme, line width=1.1pt, -{Stealth[length=1.6mm]}] (7,4) -- ({7+3.6*cos(-40)},{4+3.6*sin(-40)});
  \draw[bkInk, line width=0.6pt, -{Stealth[length=1.3mm]}] ({7+5*cos(10)},{4+5*sin(10)}) arc (10:-60:5);
  \or
  \draw[bkInk, line width=0.6pt, {Stealth[length=1.4mm]}-{Stealth[length=1.4mm]}] (0,1) -- (14,1);
  \draw[bkInk, line width=0.8pt] (1.5,1) -- (5.5,1) -- (5.5,6.5) -- (8.5,6.5) -- (8.5,1);
  \draw[bkTheme, line width=0.8pt, dash pattern=on 1.6pt off 0.9pt, domain=1.5:12.5, samples=50, smooth] plot (\x,{1+2.2*(1+cos(80*(\x-7)))/2});
  \or
  \draw[bkInk, line width=0.6pt, -{Stealth[length=1.4mm]}] (1,1) -- (14,1);
  \draw[bkInk, line width=0.6pt] (1,0) -- (1,8.5);
  \fill[bkTheme!25, domain=1:13, samples=40, smooth] (1,1) -- plot (\x,{1+6.5*exp(-0.3*(\x-1))}) -- (13,1) -- cycle;
  \draw[bkTheme, line width=0.8pt, domain=1:13, samples=40, smooth] plot (\x,{1+6.5*exp(-0.3*(\x-1))});
  \or
  \draw[bkGray, line width=0.4pt] (0,4) -- (14,4) (10,-0.5) -- (10,8.5);
  \foreach \kixcx/\kixcy in {3/4,6.5/6.8,6.5/1.2} {\draw[bkRed, line width=1pt] ({\kixcx-1},{\kixcy-1}) -- ({\kixcx+1},{\kixcy+1}) ({\kixcx-1},{\kixcy+1}) -- ({\kixcx+1},{\kixcy-1});}
  \or
  \draw[bkInk, line width=0.6pt, -{Stealth[length=1.4mm]}] (0,4) -- (4,4);
  \draw[bkTheme, line width=0.8pt, fill=bkTheme!12] (4.4,1) rectangle (9.6,7);
  \node[font=\footnotesize, text=bkInk, inner sep=0pt] at (7,4) {$G$};
  \draw[bkInk, line width=0.6pt, -{Stealth[length=1.4mm]}] (10,4) -- (14,4);
  \or
  \draw[bkInk, line width=0.6pt] (1.6,0.5) -- (0.6,0.5) -- (0.6,7.5) -- (1.6,7.5) (5.4,0.5) -- (6.4,0.5) -- (6.4,7.5) -- (5.4,7.5);
  \foreach \kixcx/\kixcy in {2.3/2.3,4.7/2.3,2.3/5.7,4.7/5.7} {\fill[bkInk] (\kixcx,\kixcy) circle (0.5);}
  \draw[bkTheme, line width=0.8pt, domain=0:600, samples=80, smooth] plot ({10.5+3.4*exp(-0.0035*\x)*cos(\x)},{4+3.4*exp(-0.0035*\x)*sin(\x)});
  \fi
\end{tikzpicture}}
\makeatother
```
- 9-1 の `tex/ch9-01.tex`（kixb）と 9-2 の `tex/ch9-02.tex`（kixc）の先頭にあるものと同じ。

## 9. 試し組みで確かめたこと
- 札・枠・ひし形・四角・小さな絵は、エラー0（tryv 9-2）。`\mathcal L`・`\mathcal L^{-1}` は今の数式フォントで出る。
- `\kixcNt`・`\kixcSt` を1行に2組ならべると、はば 132 mm を13 pt こえた → 1行に1組。
- `kixc do`・`kixc q` は `align=flush center`（`center` だと短い字の間がのびる）。
- 表の中の `\kixcop`・`\kixcdan` は行の高さが少しふえる（`rowsep=3pt` でちょうどよい）。1つのセルに札を2枚（「部分分数」「表を引く」）縦に置くときは `\par` で区切る。
- 文中の `\kixcN`・`\kixcS` は行の間を広げるので、別の行に立てる。
- `tools/kata9.md`（V9-1）の部品（`kixcN`・`kixcK`・`kixcS` の色、`\kixcfx`、`kixc world` など）と同じ章に入れても、名前はぶつからない（9-1・9-2 で両方を入れて、エラー0・はみ出し0）。色の `kixcS` とコマンドの `\kixcS` は別もの。
- 9-2 の流れ図（`tex/ch9-02.tex` の図4）は、「下の問いへ」の四角が2種類：F・D は左の列の次の問いへ、E は右の線をたどって形の問い（区間ごとに一定？）へもどる（F・D の問いをとばすため。`(rE.east) -- (120,-72) -- (120,-126.5) -- (34.6,-126.5)`）。バスの x=127 より内側に通す。
- 例題の「楽をする」「直す」の行に、文と分数の式を続けて書くと、行の字の間がのびることがある（9-2 の例題2・6 で起きた）→ 式を `\kixca`（字下げの次の行）に分ける。
