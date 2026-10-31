# 物理を理解するための数学（全9巻）・ガイドブック・物理シリーズ：組版ソース

編集委員会が LuaLaTeX で組んでいる教科書のソース一式です。GitHub Actions で PDF を自動で組みます。

- 移し方と毎日の使い方：`docs/GitHub/GitHub移行_手順書_Ver1.md`
- 決まりごと（構成・組版環境・ブランチ・版の番号・無料枠）：`docs/GitHub/GitHub運用_仕様書_Ver1.md`
- 教科書そのものの決まり：`docs/仕様書/`（仕様書・構成案）、`docs/議事録/`（第3回〜第16回）、`docs/修正事項/`

## PDF を手に入れる

| ほしいもの | 場所 |
| --- | --- |
| 版を決めた PDF（納品の名前つき） | 右側の **Releases**（タグ `vol6-ver2` などごと） |
| 直している途中の PDF | **Actions** タブ → 実行の1つ → 下の **Artifacts**（7日間） |
| 好きな巻をいま組む | **Actions** → 「組版」→ **Run workflow** → 巻を入力（`all`、`6 7`、`guide` など） |

## 手元で組む（Linux・Ubuntu 24.04 の TeX Live 2023）

```bash
scripts/ci-build.sh 6          # 第6巻（もくじのページ合わせ・カバーまで）。結果は out/
scripts/ci-build.sh guide      # ガイドブック2冊
scripts/ci-build.sh all        # 第1〜9巻とガイドブック
```

## フォルダ

| フォルダ・ファイル | 中身 |
| --- | --- |
| `series.py`・`gen.py`・`pages_actual.json` | 全巻の章の元データ、もくじなどを作るスクリプト、組んだ実際のページ |
| `tex/` | 本文（`chN-MM.tex`）、巻の親ファイル（`volN.tex`）、共通の部品（`bk-*.sty`）、ガイドブック（`guide-*.tex`）、書体（`fonts/`）、案内役の絵（`img/`） |
| `phys/`・`tex/p1-*`・`tex/ph*` | 物理シリーズ（作業を止めている） |
| `texmf/` | 固定版の LuaTeX-ja など（`texmf/README.md`） |
| `tools/` | ページ合わせ・確認のスクリプト、執筆と確認の指示書（BRIEF・PROMPT・FIX） |
| `checks/` | 検算に使った Python（巻ごと） |
| `scripts/` | 組版（`ci-build.sh`）、組む巻の判定、納品の名前づけ |
| `.github/workflows/build.yml` | GitHub Actions の設定 |
| `docs/` | 仕様書・議事録・修正事項・この移行の文書 |

書体：BIZ UD明朝・BIZ UDゴシック・Klee One（SIL Open Font License 1.1。`tex/fonts/OFL*.txt`）。
