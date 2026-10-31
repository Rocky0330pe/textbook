# texmf：組版に使う LuaTeX-ja などの固定版

Ubuntu 24.04 の TeX Live 2023（apt）には LuaTeX-ja が入っていないため、委員会の制作環境では次の版をこのフォルダに入れて使ってきました。組み上がり（行の折り返し・ページ送り）を変えないために、**この版のまま固定**します。`scripts/ci-build.sh` は `TEXMFHOME` をこのフォルダに向けて組みます。

| フォルダ | プロジェクト | 版（git のタグ） | 入手元 |
| --- | --- | --- | --- |
| `tex/luatex/luatexja` | LuaTeX-ja | 20231230.0 | https://github.com/luatexja/luatexja |
| `tex/luatex/luaotfload` | luaotfload | v3.24（2023-08-19） | https://github.com/latex3/luaotfload |
| `tex/luatex/lualibs` | lualibs | v2.76（2023-07-13） | https://github.com/latex3/lualibs |
| `tex/luatex/lua-uni-algos` | lua-uni-algos | v0.4 | https://github.com/zauguin/lua-uni-algos |
| `tex/luatex/lualatex-math` | lualatex-math | v1.12 | https://github.com/phst/lualatex-math |
| `tex/latex/luatexbase-compat` | 旧 luatexbase の互換ファイル（委員会で用意したもの） | ― | `tools/sandbox-files/` |
| `tex/luatex/luatexja/luatexja.cfg` | 既定の和文書体を BIZ UD にする設定（委員会で用意したもの） | ― | `tools/sandbox-files/` |

- 入れ方は `tools/setup-sandbox.sh` に残してあります（同じタグを取ってきて、ここに置く手順）。
- それぞれのソフトのライセンスは、上の入手元のリポジトリに書かれているもの（LuaTeX-ja は BSD 系、luaotfload・lualibs は GPL v2、lualatex-math などは LPPL）に従います。リポジトリを公開にするときは、各入手元のライセンス表示をこのフォルダに入れてください。
- 版を上げるのは「全巻にかかる修正」として委員会で決めてからにします（上げると全巻のページ送りが変わることがあります）。
