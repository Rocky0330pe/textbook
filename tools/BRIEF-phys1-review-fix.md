# 物理第1巻 委員確認の指摘を直す組への手引き（第21回）

## 始める前に
1. worktree の HEAD が `d260e22` をふくまないときは、`git merge --ff-only d260e22` で進める。
2. 組むときは `export TEXMFHOME=$PWD/texmf`（リポジトリの根で）。
3. 読むもの：
   - `docs/修正事項/物理第1巻_委員確認/決定_第21回.md`（巻全体の決定 K-1〜K-20。いちばん優先）
   - 自分の組の指摘 `docs/修正事項/物理第1巻_委員確認/R?_*.md`
   - `tools/BRIEF-phys1.md` の6章（第19回の決定）
   - 前の直しの記録 `tools/FIX-phys1-?.md`（同じ章のもの）

## 直すときの決まり
- 直してよいのは、自分の組の章の原稿（`tex/p1-NN.tex`）と、組で決めたファイルだけ。共通の部品（`tex/*.sty`）、`phys/series_phys.py`、ほかの組の章は直さない。要るものは最後の報告に書く。
- 漢字の置きかえは1か所ずつ読んで手で行う。`checks/物理第1巻/fixB/kanji.py` などの、原稿を上書きするスクリプトは動かさない。
- 章の題名（`\phchapter`）、共通の節の題、さくいんの読み（`\bkidx` の1つめ）、数学の巻が引いている物理の文・数は変えない。
- 札（`\bkreidairef` など）のあとに `\nobreak` や `\,` を足さない（K-5 で共通部品が直した）。
- 数を変えたら Python で検算し、スクリプトを `checks/物理第1巻/委員確認/` に置く。

## 確かめ（章ごとに必ず）
1. `python3 tools/tryp.py 力-N 画像のフォルダ --kotae`：エラー0・1.7pt 超のはみ出し0・ページの下へのはみ出し0・**偶数ページ**（メモのページなし）。
2. `python3 tools/check_overlap.py tex/tryp-p1-NN.pdf --out 画像のフォルダ`：赤い枠の候補を画像で見て、本物の重なりを直す。
3. 直した所のページを画像で見る（見出しだけがページの最後に残っていないか、下3分の1をこえる空きがないか、字の間ののびた行がないか）。
4. 画像や一時ファイルは scratchpad に置き、リポジトリに入れない（`tex/tryp-*` は消す）。

## 記録と報告
- 直しの記録を `tools/FIX-phys1-review-<組>.md` に書く。指摘の No・直したこと・直さなかったときは理由、の表にする。
- worktree のブランチにコミットする。コミットメッセージの最後に、次の2行を入れる。
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01Q88U4g24nbFPimYUMadros
  ```
- 最後の報告は短く書く。章ごとのページ数、確かめの結果、直さなかった指摘、事務局に頼むこと（共通部品・series_phys.py・巻末・数学の側）。
