#!/bin/bash
# 第13回編集委員会（物理第1巻）：物理シリーズの巻を組む（数学の build.sh の物理版）
# 使い方: ./buildp.sh 1      （巻の番号。省略で 1。第1巻だけが本文入り。第2〜5巻は表紙・もくじだけ）
# 巻全体は lualatex が約 3.5 GB 使うので、2つの席を両方とって組む：
#   flock /tmp/bk-lualatex-slot0.lock flock /tmp/bk-lualatex-slot1.lock ./buildp.sh 1
# ページ合わせ：./buildp.sh 1 → python3 tools/syncpages.py p1 → python3 phys/gen_phys.py → ./buildp.sh 1 → python3 tools/check_pages.py p1
cd "$(dirname "$0")/tex"
vols="${@:-1}"
for n in $vols; do
  timeout 900 lualatex -interaction=nonstopmode ph$n.tex > /dev/null 2>&1
  timeout 900 lualatex -interaction=nonstopmode ph$n.tex > /dev/null 2>&1
  e=$(grep -c "^!" ph$n.log); p=$(pdfinfo ph$n.pdf 2>/dev/null | awk '/Pages/{print $2}')
  ob=$(grep -o "Overfull \\\\hbox ([0-9.]*pt" ph$n.log | awk -F'[(p]' '$2+0>1.7' | wc -l)
  ov=$(grep -o "Overfull \\\\vbox ([0-9.]*pt too high) has occurred while \\\\output" ph$n.log | awk -F'[(p]' '$2+0>3' | wc -l)
  miss=$(grep -o "BKPAGE missing [^ ]*" ph$n.log | wc -l)
  und=$(grep -c "Reference .* undefined" ph$n.log)
  echo "ph$n: pages=$p errors=$e overfull(>1.7pt)=$ob vbox(>3pt)=$ov missing_chapters=$miss undefined_refs=$und"
done
