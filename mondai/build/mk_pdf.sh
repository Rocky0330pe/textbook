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
python3 "$ROOT/mondai/build/mq_pages.py" "mq$n"
