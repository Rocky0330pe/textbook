#!/usr/bin/env bash
# 本を組む（GitHub Actions と、手元の Linux：Ubuntu 24.04 の TeX Live 2023。Mac では使えない）。
#
# 使い方:  scripts/ci-build.sh 対象 [対象 ...]
#   1〜9     数学シリーズの第1〜9巻（本文＋カバー展開図）
#   guide    ガイドブック（子ども用・大人用）
#   p1〜p5   物理シリーズ（第1巻は作業途中。第2〜5巻は表紙・もくじだけ）
#   all      1〜9 と guide
#
# 1冊ごとの流れ（委員会で使ってきた手順と同じ）:
#   gen.py → lualatex 2回 → check_pages.py（もくじのページと実際のページ）
#   → ずれがあれば syncpages.py → gen.py → lualatex 2回 → check_pages.py（最大2回）
#   → カバー展開図（wrap）→ ログの集計（エラー・はみ出し・未定義の参照・ない章）
# 組んだ PDF とログは out/ に集める。
# ルビの位置の記録（*.ltjruby）がこわれていると LuaTeX-ja が黙ってそれを使わずに組むので、
# 組む前にこわれた記録を消し、ログに読みこみの失敗があればエラーとして数える（2026年10月31日に追加）。
#
# 環境変数:
#   TEXMFHOME   省略時はこのリポジトリの texmf/（同梱の LuaTeX-ja など）
#   BK_TIMEOUT  lualatex 1回の上限秒数（省略時 3600）
#   BK_STRICT   1 にすると、エラー・ずれが残ったときに失敗（終了コード1）で終わる
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export TEXMFHOME="${TEXMFHOME:-$ROOT/texmf}"
TIMEOUT="${BK_TIMEOUT:-3600}"
OUT="$ROOT/out"
mkdir -p "$OUT"
SUMMARY="$OUT/summary.md"
FAIL=0

# 和文フォントを OS に見せる（luatexja.cfg の既定の和文フォントが file: で探すため）
mkdir -p "$HOME/.fonts"
cp "$ROOT"/tex/fonts/*.ttf "$HOME/.fonts/" 2>/dev/null || true
fc-cache -f >/dev/null 2>&1 || true

targets=("$@")
[ ${#targets[@]} -eq 0 ] && targets=(all)
expanded=()
for t in "${targets[@]}"; do
  if [ "$t" = all ]; then expanded+=(1 2 3 4 5 6 7 8 9 guide); else expanded+=("$t"); fi
done

if [ ! -f "$SUMMARY" ]; then
  echo "| 対象 | ページ | エラー | はみ出し(>1.7pt) | 未定義の参照 | ない章 | もくじのずれ | 時間 |" > "$SUMMARY"
  echo "| --- | --- | --- | --- | --- | --- | --- | --- |" >> "$SUMMARY"
fi

lua2() {  # lualatex を2回
  local f="$1"
  # こわれた（途中で切れた）ルビの記録を消す
  # （正しい記録は、1行目が local lrob=…、最後の行が lrob[番号]=数 で終わる）
  if [ -f "$ROOT/tex/$f.ltjruby" ] && [ "$(wc -l < "$ROOT/tex/$f.ltjruby")" -gt 1 ] \
       && ! tail -n 1 "$ROOT/tex/$f.ltjruby" | grep -qE '^lrob\[-?[0-9]+\]=-?[0-9]+$'; then
    echo "  $f.ltjruby がこわれているので消した"; rm -f "$ROOT/tex/$f.ltjruby"
  fi
  ( cd "$ROOT/tex" && for i in 1 2; do
      timeout "$TIMEOUT" lualatex -interaction=nonstopmode "$f.tex" > /dev/null 2>&1 || true
    done )
}

stats() {  # ログを集計して表の1行を書く
  local name="$1" label="$2" zure="$3" sec="$4"
  local log="$ROOT/tex/$name.log" pdf="$ROOT/tex/$name.pdf"
  local p e ob und miss
  p=$(pdfinfo "$pdf" 2>/dev/null | awk '/^Pages/{print $2}')
  e=$(grep -c -E '^!|\.ltjruby:[0-9]+:' "$log" 2>/dev/null); e=${e:-0}
  ob=$(grep -o 'Overfull \\hbox ([0-9.]*pt' "$log" 2>/dev/null | awk -F'[(p]' '$2+0>1.7' | wc -l)
  und=$(grep -c 'Reference .* undefined' "$log" 2>/dev/null); und=${und:-0}
  miss=$(grep -o 'BKPAGE missing [^ ]*' "$log" 2>/dev/null | wc -l)
  echo "| $label | ${p:-なし} | $e | $ob | $und | $miss | $zure | ${sec}秒 |" >> "$SUMMARY"
  echo "$label: pages=${p:-none} errors=$e overfull=$ob undefined=$und missing=$miss zure=$zure time=${sec}s"
  [ -f "$pdf" ] && cp "$pdf" "$OUT/"
  [ -f "$log" ] && cp "$log" "$OUT/"
  if [ -z "$p" ] || [ "$e" != 0 ]; then FAIL=1; fi
  if [ "$zure" != "-" ] && [ "$zure" != 0 ]; then FAIL=1; fi
  return 0
}

zure_of() {  # check_pages.py の「ずれ: N」（読めなければ空）
  python3 "$ROOT/tools/check_pages.py" "$1" > "$OUT/check_pages_$1.txt" 2>&1
  awk -F'[: （]+' '/^ずれ/{print $2}' "$OUT/check_pages_$1.txt" | tail -1
}

usable() {  # PDF ができていて、ログにエラーがない
  local f="$1"
  [ -f "$ROOT/tex/$f.pdf" ] && ! grep -q '^!' "$ROOT/tex/$f.log" 2>/dev/null
}

cd "$ROOT"
python3 gen.py > /dev/null

for t in "${expanded[@]}"; do
  t0=$(date +%s)
  case "$t" in
    [1-9])
      echo "== 第${t}巻 =="
      lua2 "vol$t"
      z=$(zure_of "$t")
      k=0
      while [ -n "$z" ] && [ "$z" != 0 ] && [ $k -lt 2 ] && usable "vol$t"; do
        echo "  もくじのページがずれている（$z か所）→ syncpages → gen → 組み直し"
        python3 tools/syncpages.py "$t" > /dev/null
        python3 gen.py > /dev/null
        lua2 "vol$t"
        z=$(zure_of "$t"); k=$((k+1))
      done
      if [ $k -gt 0 ]; then
        # その巻の分だけを保存する（全巻を別々のジョブで組んだとき、ほかの巻の値を消さないように）
        python3 -c 'import json,sys; d=json.load(open("pages_actual.json")); json.dump({sys.argv[1]: d[sys.argv[1]]}, open(sys.argv[2],"w"), ensure_ascii=False, indent=1)' "$t" "$OUT/pages_actual_$t.json"
        msg="第${t}巻：組んでいるあいだにもくじのページを合わせた。pages_actual_${t}.json の値を pages_actual.json の \"$t\" に写してコミットしてください"
        echo "  $msg"; [ -n "${GITHUB_ACTIONS:-}" ] && echo "::warning::$msg"
      fi
      ( cd tex && timeout "$TIMEOUT" lualatex -interaction=nonstopmode "wrap$t.tex" > /dev/null 2>&1 || true )
      [ -f "tex/wrap$t.pdf" ] && cp "tex/wrap$t.pdf" "$OUT/"
      stats "vol$t" "第${t}巻" "${z:-?}" $(( $(date +%s) - t0 ))
      ;;
    guide)
      echo "== ガイドブック =="
      lua2 guide-kids; stats guide-kids "ガイドブック（子ども用）" - $(( $(date +%s) - t0 ))
      t0=$(date +%s)
      lua2 guide-adult; stats guide-adult "ガイドブック（大人用）" - $(( $(date +%s) - t0 ))
      ;;
    p[1-5])
      n=${t#p}
      echo "== 物理第${n}巻 =="
      python3 phys/gen_phys.py > /dev/null
      lua2 "ph$n"
      z=$(zure_of "p$n")
      ( cd tex && timeout "$TIMEOUT" lualatex -interaction=nonstopmode "phwrap$n.tex" > /dev/null 2>&1 || true )
      [ -f "tex/phwrap$n.pdf" ] && cp "tex/phwrap$n.pdf" "$OUT/"
      stats "ph$n" "物理第${n}巻" "${z:-?}" $(( $(date +%s) - t0 ))
      ;;
    *) echo "知らない対象: $t"; FAIL=1 ;;
  esac
done

echo; cat "$SUMMARY"
if [ "${BK_STRICT:-0}" = 1 ]; then exit $FAIL; fi
exit 0
