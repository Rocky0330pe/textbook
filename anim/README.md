# 補助教材のアニメーション（anim/）

数学シリーズ1〜9巻・物理シリーズ1〜5巻の図とグラフを、ホームページで動かせるようにしたもの（第33回・第34回）。

- `items/<id>.js`：1つの項目（候補の ID：m1-01〜m4-29、p1-01〜p2-35。`docs/補助教材_アニメーション/候補_*.md`）
- `lib/`：共通の部品（core.js：ページ・スライダー・再生・2次元の描き方、plot3d.js：3次元、anim.css：見た目）
- `build/mk_anim.js`：組み立てる。`dist/<id>.html`（これ1つで動く。外のファイルを読みこまない）と、目次 `dist/index.html` を作る
- `build/check.js`：自動の確かめ（エラー・空のキャンバス・スマートフォンの幅）。`--shots フォルダ` で画像を保存
- 書き方：`tools/BRIEF-anim.md`

```bash
node anim/build/mk_anim.js
```

```bash
node anim/build/check.js --shots /tmp/anim-shots
```

PDF からのリンクは `…/<id>.html#<場面の key>`。`#key&名前=値` で値を決めて開ける。
`dist/` はコミットしない（ホームページへ送るときに組み立てる）。
