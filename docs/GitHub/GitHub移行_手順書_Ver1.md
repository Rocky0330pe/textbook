# GitHub 移行 手順書 Ver1

LaTeX の教科書づくりを GitHub に移す手順です。移すものは「GitHub移行キット」（zip の中の `butsuri-sugaku` フォルダ）にまとめてあります。キットには、組版のソース・書体・固定版の LuaTeX-ja・検算の Python・仕様書と議事録・GitHub Actions（GitHub の上で PDF を自動で組むしくみ）の設定がすべて入っていて、GitHub に置くだけで PDF を組めます。決まりごとの詳細は「GitHub運用_仕様書_Ver1.md」にあります。

**かかる時間**：手順1〜3 で約30分（そのほかに、GitHub が PDF を組むのを待つ時間）。

## 全体の流れ

| 手順 | すること | だれが | 時間 |
| --- | --- | --- | --- |
| 1 | GitHub に空の非公開リポジトリを作る | 依頼者 | 5分 |
| 2 | キットの中身をリポジトリに入れる | Claude（おすすめ）または依頼者 | 5〜20分 |
| 3 | Actions で試しに組み、PDF をダウンロードして確かめる | 依頼者 | 操作5分＋待ち時間 |
| 4 | 以後の作業のしかた（Ver2 など） | 依頼者と Claude | ― |

---

## 手順1　空のリポジトリを作る

1. GitHub にサインインする（アカウントがなければ https://github.com/signup で無料のアカウントを作る）。
2. 右上の「＋」→「New repository」を押す（または https://github.com/new を開く）。
3. 次のように入れる。

   | 欄 | 入れるもの |
   | --- | --- |
   | Repository name | `butsuri-sugaku`（ほかの名前でもよい） |
   | Description | 物理を理解するための数学：組版ソース（任意） |
   | 公開範囲 | **Private**（非公開） |
   | Add a README file / .gitignore / license | **どれも付けない**（空のまま作る。キットに入っているため） |

4. 「Create repository」を押す。できたページのアドレス（例 `https://github.com/GitHubのユーザー名/butsuri-sugaku`）を控える。

## 手順2　キットの中身を入れる

3つのやり方があります。いちばん簡単なのは A です。

**どのやり方でも、入れただけでは PDF は組まれません**（最初の push では組まない設定にしてあります）。組むのは手順3です。

### A　Claude に任せる（おすすめ）

1. このチャットで「`GitHubのユーザー名/butsuri-sugaku` にキットを入れて」と伝える。
2. Claude がリポジトリへの書きこみの許可を求めます。画面に GitHub の許可の案内が出たら、そのリポジトリへのアクセスを許可してください（Claude の GitHub 連携をまだ使っていない場合は、連携の設定から始まります）。
3. Claude が次を行い、結果を報告します。
   - キットの中身を1つのコミットにして `main` に入れる（説明：「移行：第1〜9巻・ガイドブック・物理シリーズの組版ソース（2026年10月31日の版）」）
   - そのコミットに `migration-2026-10-31` のタグをつける（このタグでは組まない）
   - GitHub 上でファイルの数と大きさを確かめる
4. **うまくいかないとき**：GitHub の許可の都合で、ワークフローのファイル（`.github/workflows/build.yml`）だけが入らないことがあります。そのときは Claude がそう伝えるので、下の「ワークフローだけ手で足すとき」を行ってください。

### B　GitHub Desktop で入れる（コマンドを使わない）

1. https://desktop.github.com から GitHub Desktop をインストールし、GitHub のアカウントでサインインする。
2. 「File」→「Clone repository」→ 手順1のリポジトリを選び、置き場所（例 `~/Documents/教科書作成/github`）を決めて「Clone」。手元に `~/Documents/教科書作成/github/butsuri-sugaku` という空のフォルダができる。
3. キットの zip（`GitHub移行キット_butsuri-sugaku_Ver1.zip`）をダブルクリックで開き、できた `butsuri-sugaku` フォルダの**中身全部**を、手順2のフォルダにコピーする。
   - Finder では `.github`・`.gitignore`・`.gitattributes` が見えません（名前が「.」で始まるため）。⌘＋Shift＋.（ピリオド）で表示して、これらもコピーされたか確かめてください。
   - 手順2のフォルダの中にある `.git` フォルダ（GitHub Desktop が作ったもの）は消したり上書きしたりしないでください。
4. GitHub Desktop の左に約950個の変更が出る。左下の Summary に「移行：組版ソース一式」と書き、「Commit to main」を押す。
5. 上の段のボタン（「Publish branch」または「Push origin」と出る）を押して、GitHub に送る。
6. タグをつける：左の「History」で、いま作ったコミットを右クリック →「Create Tag…」→ `migration-2026-10-31` → もう一度上の段の「Push origin」。（難しければ、Claude に「migration のタグをつけて」と頼んでも構いません。）

※ ブラウザの「Add file → Upload files」は使わないでください。GitHub の文書では、ブラウザから入れられるのは1回に100ファイルまで・1ファイル 25 MiB までで、約950ファイルを入れるには何十回もかかり、「.」で始まるフォルダも入れそこないやすいためです。

### C　コマンドで入れる（Mac のターミナル）

Git をはじめて使う Mac では、次の準備がいります。

1. ターミナルで `git --version` と打つ。「コマンドライン・デベロッパツールをインストールしますか」と出たら「インストール」を押す。
2. 名前とメールアドレスを登録する（コミットに記録される。メールアドレスは GitHub の Settings → Emails にある `…@users.noreply.github.com` をすすめる）。
   ```bash
   git config --global user.name "あなたの名前"
   git config --global user.email "ID+ユーザー名@users.noreply.github.com"
   ```
3. GitHub CLI でサインインする（push のときにパスワードを聞かれないようにするため）。https://cli.github.com からインストールし、`gh auth login` →「GitHub.com」→「HTTPS」→「Authenticate Git with your GitHub credentials?」に Yes → ブラウザでログイン。
   - GitHub CLI を使わずに「Personal access token」を使う場合は、**`workflow` の権限が必要**です（classic のトークンなら `repo` と `workflow`、fine-grained なら Contents と Workflows を書きこみ可にする）。この権限がないと、ワークフローのファイルを含む push が断られます。

準備ができたら、zip をダウンロードのフォルダから `~/Documents/教科書作成` に移して、次を実行します。

```bash
cd ~/Documents/教科書作成
unzip GitHub移行キット_butsuri-sugaku_Ver1.zip     # butsuri-sugaku フォルダができる
cd butsuri-sugaku
git init -b main
git add -A
git commit -m "移行：第1〜9巻・ガイドブック・物理シリーズの組版ソース（2026年10月31日の版）"
git remote add origin https://github.com/GitHubのユーザー名/butsuri-sugaku.git
git push -u origin main
git tag migration-2026-10-31 && git push origin migration-2026-10-31
```

### ワークフローだけ手で足すとき

（A でワークフローだけが入らなかった場合）GitHub のリポジトリのページで「Add file」→「Create new file」→ 名前の欄に `.github/workflows/build.yml` と入れ、キットの同じ名前のファイル（テキストエディットなどで開く）の中身を全部貼りつけて「Commit changes」。

### 入ったことを確かめる

リポジトリのページを開き、次が見えれば成功です。

- 上の段に `.github`・`checks`・`docs`・`phys`・`scripts`・`src-img`・`tex`・`texmf`・`tools` のフォルダ
- 下に `README.md` の内容（「物理を理解するための数学（全9巻）…」）が表示されている
- 「Actions」タブに「組版」がある

## 手順3　試しに組む

最初は短いガイドブックで試します。

1. リポジトリの「Actions」タブ → 左の「組版」→ 右の「Run workflow」。
2. 「組む巻」の欄に `guide` と入っていることを確かめて（最初から `guide` が入っています）、緑の「Run workflow」を押す。
3. 実行が始まる（黄色の丸）。**10〜15分ほど**で緑のチェックになる（初回は TeX Live のインストールとフォントの準備で少し長くかかる）。
4. 実行をクリック → ページの下の「Artifacts」の `pdf-guide` を押すと zip がダウンロードされる。中の `guide-kids.pdf` と `guide-adult.pdf` を開き、**ページ数（35・103）と見た目が Ver1 と同じ**であることを確かめる（委員会の試験では、全ページの文字と位置が一致しました）。
5. 「Summary」に、ページ数・エラー・はみ出しの表が出ている。エラーは 0 のはずです。

**全巻を確かめるとき**は、2. で欄の `guide` を消して `all` と入れる。巻ごとに別のジョブで同時に組み（最大5つずつ）、**待ち時間は 40〜60 分ほど**です。無料枠（毎月約 2,000 分）のうち、全巻1回で約 120〜180 分を使うので、全巻を組むのは月に数回までにしてください（仕様書 6章）。

**第1巻・第2巻について**：GitHub で組んだ第1巻・第2巻は、渡した Ver4 と一部のページ（題名の2行目にルビがある章の初めのページ、ルビの位置など）で組み方が少しちがいます。Ver4 のあとに直した共通部品が入ることと、Ver4 を組んだときの作業環境の不具合（ルビの位置の記録がこわれていた）によるもので、GitHub で組んだほうが正しい形です（仕様書 9章）。ページ数ともくじは同じです。第3巻・第9巻・ガイドブックは、渡した版と全ページ一致しました。

**赤い×になったとき**：実行をクリック → 赤い×のジョブ → 「組む」のステップを開くと理由が出ます。`log-…` の Artifacts にログが入っています。Claude に「Actions の○○が失敗した」と伝えれば調べます。

## 手順4　以後の作業のしかた

### 依頼者がすること

| したいこと | すること |
| --- | --- |
| 直しを頼む | これまでどおりチャットで指示する（または GitHub の「Issues」に書く） |
| 途中の PDF を見る | これまでどおりチャットにも PDF を添付します。GitHub で見るときは、Claude が知らせるプルリクエスト →「Checks」→ 実行の「Artifacts」 |
| 版を確定する（渡してもらう） | プルリクエストを開き、「Merge pull request」を押して `main` に取りこむ（Claude に「取りこんでよい」と伝えるだけでもよい）。それだけで、Actions がその巻を組み、20〜30分で「Releases」にその版（例 `vol6-ver3`）の PDF が並ぶ（下の「版を渡すしくみ」） |
| 確定した PDF・tex 一式をもらう | 「Releases」→ その版 →「…_納品の名前のPDF一式.zip」（中は納品の名前の PDF）と「Source code (zip)」（これが tex 一式） |
| 好きな巻をいま組む | 「Actions」→「組版」→「Run workflow」→ 巻を入力（`6`、`6 7`、`guide` など） |

### Claude がすること（第6巻 Ver2 の例）

1. リポジトリを手元に複製（clone）し、作業用のブランチ `work/vol6-ver2` を作る。
2. 指示から指摘を洗い出し、委員で修正方針を決めて `tools/FIX-vol6-ver2.md` に書く（これまでと同じ）。
3. 直してコミットし、委員会の作業環境で組んで確かめる。委員会の最終確認をし、議事録を `docs/議事録/` に入れる。
4. push してプルリクエストを作る。Actions が第6巻を組み、合否が出る。
5. 依頼者に、PDF（チャットに添付）とプルリクエストのリンクを知らせる。
6. Claude は、プルリクエストの中で `versions.json` のその巻の番号を上げておく（例 `"6": 3`）。依頼者が取りこむと、Actions が第6巻を組み、タグ `vol6-ver3` とリリースを作って PDF を添付する。

### 版を渡すしくみ（第18回で決定）

依頼者の操作は「取りこみ（Merge）」だけ。タグやリリースを画面で作る必要はない。

1. リポジトリの `versions.json` に、各巻のいまの版の番号を書いておく（例 `{"6": 2, "7": 2, "guide": 1}`）。
2. Claude は、Ver3 などを作るプルリクエストの中で、その巻の番号を1つ上げる。
3. プルリクエストが `main` に取りこまれると、Actions が番号の上がった巻を見つけて、組む → タグ（`vol6-ver3` など）を作る → リリースに PDF と納品の名前の zip を添付する、までを行う。
4. 組版が赤い×になったときは、タグもリリースも作らない。Claude が直して、手動の実行（「Run workflow」の「リリースするタグ」の欄に `vol6-ver3` など）でやり直す。
5. これまでどおり、「Releases」の画面で決まりの形のタグを作っても、その巻を組んで PDF を添付する（予備の方法）。

これまでの納品（PDF・tex の zip・検算ファイル・議事録をチャットに添付）も、必要なあいだは続けます。

## 困ったときは

| 困ったこと | 原因と対処 |
| --- | --- |
| push したのに Actions が動かない | 最初の push と、`docs/` などの文書だけを変えたときは組みません（仕様書 5.1）。手で組むときは「Run workflow」 |
| 「もくじのずれ」が 0 にならない | 組み直しても章の始まりのページが動いています。Artifacts の `check_pages_N.txt` を Claude に見せてください |
| 黄色の注意で「pages_actual.json を更新した」と出た | 組んでいるあいだに、もくじのページを合わせました。Claude がその値をコミットします |
| Actions の時間を使い切った | GitHub からメールが来ます。翌月まで待つか、支払い方法と上限額を設定するか、リポジトリを公開にする（原稿が公開されるので依頼者の判断） |
| 100 MB をこえるファイルを入れられない | GitHub は 100 MB をこえるファイルを受けつけません。組んだ PDF はリポジトリに入れず、リリースに添付します（`.gitignore` で除いてあります） |
| 手元の Mac で組みたい | 正式な PDF は GitHub（Actions）で組んだものとします。Mac の TeX（MacTeX）は版がちがい、行の折り返しやページが変わることがあるため、Mac で組む手順は用意していません |
| GitHub をやめたい | 「Code」→「Download ZIP」で全部を取り出せます。これまでと同じ zip の形で手元に残ります |

## 参考（GitHub の公式の文書）

- GitHub が用意する実行環境（ランナー）の性能：https://docs.github.com/en/actions/reference/runners/github-hosted-runners
- Actions の料金と無料枠：https://docs.github.com/en/billing/concepts/product-billing/github-actions
- Actions の上限（1ジョブ6時間など）：https://docs.github.com/en/actions/reference/limits
- ブラウザからファイルを入れるときの上限：https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- 大きなファイルの扱い：https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github
