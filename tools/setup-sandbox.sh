#!/bin/bash
# 日本語TeXが入っていないクラウド環境（TeX Live 2023/Debian）で、GitHubからLuaTeX-jaなどを入れる。
# ふつうのPC（TeX Live / MacTeX フルインストール）では不要。
set -e
T=${TEXMFHOME:-$HOME/texmf}/tex; S=$(mktemp -d)
cd $S
git clone -q --depth 1 --branch 20231230.0 https://github.com/luatexja/luatexja.git
git clone -q --depth 1 --branch v3.24 https://github.com/latex3/luaotfload.git
git clone -q --depth 1 --branch v2.76 https://github.com/latex3/lualibs.git
git clone -q --depth 1 --branch v0.4 https://github.com/zauguin/lua-uni-algos.git
git clone -q --depth 1 --branch v1.12 https://github.com/phst/lualatex-math.git
mkdir -p $T/luatex/{luatexja,luaotfload,lualibs,lua-uni-algos,lualatex-math} $T/latex/luatexbase-compat
cp luaotfload/src/*.lua luaotfload/src/*.sty luaotfload/src/*.cnf luaotfload/src/auto/* luaotfload/src/fontloader/runtime/* luaotfload/src/fontloader/misc/* $T/luatex/luaotfload/
(cd lualibs && luatex -interaction=batchmode lualibs.dtx >/dev/null 2>&1 || true; cp lualibs*.lua $T/luatex/lualibs/)
cp lua-uni-algos/lua-uni-*.lua $T/luatex/lua-uni-algos/
(cd lualatex-math && luatex -interaction=batchmode lualatex-math.ins >/dev/null 2>&1 || true; cp lualatex-math.sty lualatex-math.lua $T/luatex/lualatex-math/)
cp -r luatexja/src/* $T/luatex/luatexja/
(cd $T/luatex/luatexja && for f in *.ins; do lualatex -interaction=batchmode $f >/dev/null 2>&1 || true; done)
D=$(cd "$(dirname "$0")" && pwd)/sandbox-files
cp $D/luatexbase*.sty $D/luatexbase-ltjcompat.lua $T/latex/luatexbase-compat/
cp $D/luatexja.cfg $T/luatex/luatexja/
mkdir -p ~/.fonts && cp "$(dirname "$0")"/../tex/fonts/*.ttf ~/.fonts/ && fc-cache -f >/dev/null
mktexlsr ${TEXMFHOME:-$HOME/texmf} >/dev/null 2>&1 || true
echo "done"
