#!/bin/bash
# 使い方: build.sh 1 2 3 ...（省略で全巻）
cd "$(dirname "$0")/tex"
vols="${@:-1 2 3 4 5 6 7 8 9}"
for n in $vols; do
  # 2026-10-31：途中で切れたルビの記録（volN.ltjruby）は LuaTeX-ja が黙って使わなくなるので、先に消す
  f=vol$n.ltjruby
  if [ -f $f ] && [ "$(wc -l < $f)" -gt 1 ] && ! tail -n 1 $f | grep -qE '^lrob\[-?[0-9]+\]=-?[0-9]+$'; then echo "$f がこわれているので消した"; rm -f $f; fi
  timeout 600 lualatex -interaction=nonstopmode vol$n.tex > /dev/null 2>&1
  timeout 600 lualatex -interaction=nonstopmode vol$n.tex > /dev/null 2>&1
  e=$(grep -c "^!" vol$n.log); p=$(pdfinfo vol$n.pdf 2>/dev/null | awk '/Pages/{print $2}')
  ob=$(grep -c "Overfull" vol$n.log)
  echo "vol$n: pages=$p errors=$e overfull=$ob"
done
