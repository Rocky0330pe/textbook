// 補助教材のアニメーションを組み立てる：node anim/build/mk_anim.js [id …]
//   anim/items/<id>.js（1つの項目）に、anim/lib の部品を入れて、anim/dist/<id>.html（これ1つで動く）を作る。
//   外のファイルは読みこまない。書体は端末のもの（容量の見積もり：docs/補助教材_アニメーション/容量の見積もり.md）。
//   項目のファイルの頭に、次の行を書く：
//     // @id m2-19
//     // @title 回る点の影：単位円と sin
//     // @vol 数学4            （数学1〜9・物理1〜5。いちばん主になる巻）
//     // @uses 3d              （3次元の部品を使うときだけ）
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const LIB = path.join(ROOT, 'lib'), ITEMS = path.join(ROOT, 'items'), DIST = path.join(ROOT, 'dist');
const css = fs.readFileSync(path.join(LIB, 'anim.css'), 'utf8');
const core = fs.readFileSync(path.join(LIB, 'core.js'), 'utf8');
const p3d = fs.readFileSync(path.join(LIB, 'plot3d.js'), 'utf8');
fs.mkdirSync(DIST, { recursive: true });

function meta(src) {
  const m = {};
  for (const line of src.split('\n').slice(0, 15)) { const r = line.match(/^\/\/\s*@(\w+)\s+(.*)$/); if (r) m[r[1]] = r[2].trim(); }
  return m;
}
const want = process.argv.slice(2);
const files = fs.readdirSync(ITEMS).filter(f => /^[mp]\d-\d\d.*\.js$/.test(f)).sort();
const all = [];
let total = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(ITEMS, f), 'utf8');
  const m = meta(src);
  if (!m.id || !m.title) { console.error('頭の @id・@title がない：' + f); process.exitCode = 1; continue; }
  if (m.id + '.js' !== f) { console.error('ファイルの名前と @id がちがう：' + f); process.exitCode = 1; continue; }
  all.push(m);
  if (want.length && !want.includes(m.id)) continue;
  const uses = (m.uses || '').split(/\s+/);
  const js = core + (uses.includes('3d') ? '\n' + p3d : '') + '\n' + src;
  const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${m.title.replace(/《([^|》]+)\|[^》]+》/g, '$1')}</title>
<style>${css}</style>
</head>
<body>
<script>${js.replace(/<\/script>/gi, '<\\/script>')}</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(DIST, m.id + '.html'), html);
  total += Buffer.byteLength(html);
}
// 目次（巻ごと）
const ORDER = ['数学1', '数学2', '数学3', '数学4', '数学5', '数学6', '数学7', '数学8', '数学9', '物理1', '物理2', '物理3', '物理4', '物理5'];
const NAMES = { 数学1: '数学 第1巻『かぞえる・はかる』', 数学2: '数学 第2巻『数と量のことば』', 数学3: '数学 第3巻『関数とデータ』', 数学4: '数学 第4巻『形と向き』', 数学5: '数学 第5巻『変化をつかむ』', 数学6: '数学 第6巻『未来を計算する』', 数学7: '数学 第7巻『まとめて計算する』', 数学8: '数学 第8巻『空間に広がる量』', 数学9: '数学 第9巻『波と変化を読みとく』', 物理1: '物理 第1巻『力学』', 物理2: '物理 第2巻『熱学』', 物理3: '物理 第3巻『波動』', 物理4: '物理 第4巻『電磁気学』', 物理5: '物理 第5巻『原子』' };
const plain = s => s.replace(/《([^|》]+)\|[^》]+》/g, '$1');
let idx = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>動かしてみる：図とグラフのアニメーション</title><style>${css}
ul.ix{padding-left:1.2em}ul.ix li{margin:4px 0}ul.ix a{color:var(--a)}h2{font-size:1.05rem;margin:22px 0 6px;border-bottom:1px solid var(--line)}</style></head><body>
<header class="an"><h1>動かしてみる：図とグラフのアニメーション</h1><div class="from">工学を理解するための数学・物理シリーズの補助教材（${all.length} 項目）</div></header><main class="an">`;
for (const v of ORDER) {
  const its = all.filter(m => (m.vol || '') === v);
  if (!its.length) continue;
  idx += `<h2>${NAMES[v]}</h2><ul class="ix">` + its.map(m => `<li><a href="${m.id}.html">${plain(m.title)}</a>　<small>${m.from ? plain(m.from) : ''}</small></li>`).join('') + '</ul>';
}
idx += '</main></body></html>\n';
fs.writeFileSync(path.join(DIST, 'index.html'), idx);
console.log(`組み立てた：${want.length ? want.length : all.length} 項目（目次は ${all.length} 項目）、合わせて ${(total / 1024).toFixed(0)} KB`);
