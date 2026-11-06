// 練習プリントのアプリを、1つの HTML ファイルにまとめる：node build/mk_app.js
//   mondai/dist/print.html（これ1つで動く。サーバーもネットもいらない）
// 中身：app/app.html に、core.js・全巻の v*/[a-z]_*.js・parts.js・app/app.js を入れる。
// フォント：Klee One（SIL OFL）から、アプリで使う字だけを取り出して入れる（fontTools があるとき）。
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { files, ROOT } = require('./load');
const vols = fs.readdirSync(ROOT).filter(d => /^v[1-9]$/.test(d)).map(d => +d.slice(1)).sort();
let srcs = [path.join(ROOT, 'core.js')];
vols.forEach(v => { srcs = srcs.concat(files(v).slice(1)); });
srcs.push(path.join(ROOT, 'app', 'app.js'));
const code = srcs.map(f => `/* ---- ${path.relative(ROOT, f)} ---- */\n` + fs.readFileSync(f, 'utf8')).join('\n');
let html = fs.readFileSync(path.join(ROOT, 'app', 'app.html'), 'utf8');
html = html.replace('/*SCRIPTS*/', () => code.replace(/<\/script>/gi, '<\\/script>'));

// フォント（使う字だけ）
let fontCss = '';
try {
  const chars = new Set((html + 'なまえがつにちたねのばんごうこたえ（）［］／０１２３４５６７８９').split(''));
  for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
  'ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろわをんー、。・「」ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンヴ'.split('').forEach(c => chars.add(c));
  const tmp = path.join(require('os').tmpdir(), 'mq-chars.txt');
  fs.writeFileSync(tmp, [...chars].join(''));
  const font = path.resolve(ROOT, '..', 'tex', 'fonts', 'KleeOne-Regular.ttf');
  // woff2（brotli がいる）が作れなければ woff にする
  let fmt = 'woff2', out = path.join(require('os').tmpdir(), 'mq-klee.woff2');
  try {
    execFileSync('python3', ['-m', 'fontTools.subset', font, `--text-file=${tmp}`, '--flavor=woff2', `--output-file=${out}`, '--layout-features=*'], { stdio: 'ignore' });
  } catch (e) {
    fmt = 'woff'; out = path.join(require('os').tmpdir(), 'mq-klee.woff');
    execFileSync('python3', ['-m', 'fontTools.subset', font, `--text-file=${tmp}`, '--flavor=woff', `--output-file=${out}`, '--layout-features=*'], { stdio: 'ignore' });
  }
  const b64 = fs.readFileSync(out).toString('base64');
  fontCss = `@font-face { font-family: "MQKlee"; src: url(data:font/${fmt};base64,${b64}) format("${fmt}"); font-display: swap; }`;
  console.log(`フォント：Klee One から ${chars.size} 字（${Math.round(b64.length / 1024)} KB）`);
} catch (e) {
  console.log('フォントは入れなかった（fontTools がない）。ブラウザのフォントで組む');
}
html = html.replace('/*FONT*/', fontCss);
// 書体の利用条件（SIL OFL 1.1）：著作権の表示と、利用条件の全文を入れる（依頼者の指示 11月6日。書体を配るときの条件）
const ofl = fs.readFileSync(path.resolve(ROOT, '..', 'tex', 'fonts', 'OFL-KleeOne.txt'), 'utf8').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
html = html.replace('/*OFL*/', () => ofl);
html = html.replace('<!doctype html>', '<!doctype html>\n<!-- 書体：Klee One（Copyright 2020 The Klee Project Authors, https://github.com/fontworks-fonts/Klee）の部分集合。SIL Open Font License 1.1。利用条件の全文は、画面の「書体について」にある。 -->');
fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'print.html'), html);
console.log(`mondai/dist/print.html を書いた（${Math.round(html.length / 1024)} KB、わざの巻 ${vols.join('・')}）`);
