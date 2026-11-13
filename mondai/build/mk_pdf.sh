#!/bin/bash
# 問題集の本を組む：mondai/build/mk_pdf.sh 1
# 書き出し（mk_book.js）→ lualatex 2回 → 見開きのページの確かめ（mq_pages.py）
set -u
n="${1:-1}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
export TEXMFHOME="${TEXMFHOME:-$ROOT/texmf}"
node "$ROOT/mondai/build/mk_book.js" "$n" || exit 1
cd "$ROOT/tex"
for i in 1 2; do timeout 1200 lualatex -interaction=nonstopmode "mq$n.tex" > /dev/null 2>&1; done
# ページの参照が変わったと出たら、あと2回まで組み直す（わざの一覧のページ番号がずれないように。第9巻 R1-3）
for i in 1 2; do grep -q "Label(s) may have changed" "mq$n.log" || break; timeout 1200 lualatex -interaction=nonstopmode "mq$n.tex" > /dev/null 2>&1; done
python3 "$ROOT/mondai/build/mq_pages.py" "mq$n"
