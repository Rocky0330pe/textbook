# 第三者のライセンス（texmf の組版用ソフトウェア・書体）

`texmf/` の組版用ソフトウェアは、それぞれの作者が定めたライセンスで提供されているものです。リポジトリ全体の利用規約（`LICENSE`。非営利利用許諾）は**これらには適用されません**（利用規約 第7条）。各ファイルの先頭の著作権表示も、そのまま残してください。

| フォルダ（texmf/ の中） | ソフトウェア | 版 | ライセンス | 全文 | 入手元 |
| --- | --- | --- | --- | --- | --- |
| `tex/luatex/luatexja` | LuaTeX-ja（© The LuaTeX-ja project ほか。一部のファイルは ASCII MEDIA WORKS・Unicode, Inc. の表示あり） | 20231230.0 | 修正 BSD ライセンス（3条項） | `LuaTeX-ja_COPYING.txt` | https://github.com/luatexja/luatexja |
| `tex/luatex/luaotfload` | luaotfload（© Luaotfload Development Team・PRAGMA ADE / ConTeXt Development Team） | v3.24 | GNU GPL 第2版（「それ以降の版」は適用しない） | `luaotfload_COPYING.txt`・`GPL-2.0.txt` | https://github.com/latex3/luaotfload |
| `tex/luatex/lualibs` | lualibs（© PRAGMA ADE / ConTeXt Development Team ほか） | v2.76 | GNU GPL 第2版 | `GPL-2.0.txt` | https://github.com/latex3/lualibs |
| `tex/luatex/lua-uni-algos` | lua-uni-algos（© Marcel Krüger） | v0.4 | LaTeX Project Public License 1.3 以降 | `LPPL-1.3c.txt` | https://github.com/zauguin/lua-uni-algos |
| `tex/luatex/lualatex-math` | lualatex-math（© Philipp Stephani） | v1.12 | LaTeX Project Public License 1.3c 以降 | `LPPL-1.3c.txt` | https://github.com/phst/lualatex-math |

- ソースは各入手元のタグから、変更せずに取ってきたものです（入れ方は `tools/setup-sandbox.sh`）。GPL の部分のソースは、`texmf/` のそのフォルダそのものです。
- `tex/latex/luatexbase-compat`（旧 luatexbase の代わりの小さなファイル）と `tex/luatex/luatexja/luatexja.cfg`（既定の和文書体を BIZ UD にする設定）は委員会で用意したもので、リポジトリの利用規約に従います。
- 書体（`tex/fonts/`）は SIL Open Font License 1.1 です（`tex/fonts/OFL.txt`・`tex/fonts/OFL-KleeOne.txt`）。
