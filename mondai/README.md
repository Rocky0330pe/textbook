# 問題集のエンジンと、練習プリント作成アプリ（第28回・第29回）

| ファイル | 中身 |
| --- | --- |
| `core.js` | 種つきの乱数、わざの登録、問題の作り方、文の書き出し（本の LaTeX・アプリの HTML）、検算 |
| `v1/` | 第1巻のわざ（`[a-f]_*.js`）、部の見開き（`parts.js`）、目録（`CATALOG.md`）、書き方の手引き（`README.md`） |
| `build/check.js` | わざの検査：`node mondai/build/check.js 1` |
| `build/mk_book.js`・`build/mk_pdf.sh` | 本を組む：`mondai/build/mk_pdf.sh 1`（`tex/mq1.pdf`） |
| `build/mk_app.js` | アプリを1つの HTML にまとめる：`node mondai/build/mk_app.js`（`mondai/dist/print.html`） |
| `app/` | アプリの画面（`app.html`）と動き（`app.js`） |

## アプリの置き場所（依頼者の指示 11月6日）

- ホームページのリポジトリ **Rocky0330pe/homepage** の **`apps/print/index.html`**（公開すると https://3ryu-eng.com/apps/print/ ）。
- 送り方：
  1. ホームページのリポジトリを、公開用のブランチ（`claude/dreamy-lamport-9rc922`）の**最新**から取り直す（履歴を作り直したことがあるので、古い履歴のまま送らない）。
  2. 別のブランチ **`add-print-app`** を作り、`mondai/dist/print.html` を `apps/print/index.html` として入れて push する。**公開用のブランチには直接送らない。**
  3. ホームページの側に「送った」と伝える。ホームページの側が中身を確かめて取りこみ、教科書のページからリンクを張る。
- 守ること：外のサーバーのファイルを読まない（スクリプト・書体はファイルの中。読めるのは Google Fonts だけ）、API キーを書かない、1つのファイルは 50MB 未満。
- 本の PDF は、教科書と同じく、このリポジトリのリリース（`q1-ver1` など）で配る。
