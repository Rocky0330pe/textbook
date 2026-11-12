// @id m2-10
// @title たくさん《足|た》すとつりがね《形|かたち》
// @vol 数学3
// @from 数学 3-17③⑤（ch3-17:250・fig-dice（:397）・408）／3-14、熱-14・15、原-14、9-4 でも使う
'use strict';
// 本の数：サイコロの和の分布（1個は平ら、2個は三角、3個は 1,3,6,10,15,21,25,27,27,…、10個は平均35・σ約5.4）、
//          パスカルの三角形（4枚の段は 1,4,6,4,1）、ガルトンボード6段（1,6,15,20,15,6,1）
// n 個のサイコロの和の確率（たたみこみ）
function diceDist(n) { let d = [1]; for (let k = 0; k < n; k++) { const e = new Array(d.length + 6).fill(0); d.forEach((p, i) => { for (let f = 1; f <= 6; f++) e[i + f] += p / 6; }); d = e; } return d; }
const DIST = [null]; for (let n = 1; n <= 10; n++) DIST.push(diceDist(n));
const C = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return Math.round(r); };
// 実験：サイコロ n 個を何回もふる（種を決めて、毎回同じ）
const ROLLS = (() => { const r = A.rng(17), a = []; for (let k = 0; k < 4000; k++) a.push(1 + Math.floor(r() * 6)); return a; })();
// ガルトンボード：玉ごとの右・左（6段）
const GB = (() => { const r = A.rng(2487), a = []; for (let k = 0; k < 200; k++) { const p = []; for (let j = 0; j < 6; j++) p.push(r() < 0.5 ? 0 : 1); a.push(p); } return a; })();
const GAP = 0.05, ROW = 0.16;
A.item({
  id: 'm2-10', title: 'たくさん《足|た》すとつりがね《形|かたち》', ruby: true,
  from: '《数学|すうがく》 《第|だい》3《巻|かん》 3-17③⑤「パスカルの《三角形|さんかくけい》」「たくさん《足|た》すと、つりがね《形|かたち》」の《図|ず》から（3-14、《物理|ぶつり》 《熱|ねつ》-14・15・《原|げん》-14、《第|だい》9《巻|かん》 9-4 でも《使|つか》う）',
  W: 880, H: 420,
  state: { n: 1, T: 0, m: 0, nc: 4, nor: false },
  scenes: [
    {
      key: 'wa', label: '① サイコロの《和|わ》',
      lead: 'サイコロの《個数|こすう》をふやして、《目|め》の《和|わ》のそれぞれの《確率|かくりつ》を《柱|はしら》にします。▶ を《押|お》すと、1《個|こ》 → 2《個|こ》 → … → 10《個|こ》 とふえます。',
      note: '1《個|こ》は《平|たい》ら、2《個|こ》は《三角|さんかく》、3《個|こ》は《丸|まる》みのある《山|やま》、10《個|こ》はつりがね《形|かたち》。《和|わ》がはしの《数|かず》になるのは1《通|とお》りしかありませんが、まん《中|なか》のあたりは、《大|おお》きい《目|め》と《小|ちい》さい《目|め》が《打|う》ち《消|け》し《合|あ》う《組|く》み《合|あ》わせがとてもたくさんあります。**《作|つく》り《方|かた》の《数|かず》が《多|おお》い《和|わ》ほど、よく《出|で》る**のです。',
      legend: [['《和|わ》の《確率|かくりつ》（《柱|はしら》）', { color: 'a', shape: 'square' }], ['つりがね《形|かたち》（《正規分布|せいきぶんぷ》）', { color: 'b', style: 'dash' }], ['《平均|へいきん》 ±σ', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'n', label: 'サイコロの《個数|こすう》', min: 1, max: 10, step: 1, d: 0 }, { check: 'nor', label: 'つりがね《形|かたち》', text: '《重|かさ》ねて《見|み》る' }],
      init(st) { st.n = 1; st.T = 0; },
      step(st, dt) { st.T += dt; st.n = Math.min(10, 1 + Math.floor(st.T / 1.3)); if (st.T > 10 * 1.3) { st.nor = true; return false; } },
      draw(cv, st) { bars(cv, DIST[st.n], st.n, null, st.nor); },
      readout: st => { const n = st.n, s = Math.sqrt(n * 35 / 12); return `${n} 《個|こ》：《和|わ》は ${n} から ${6 * n} まで　　《平均|へいきん》（《期待値|きたいち》）＝$3.5\\times${n}$＝${A.num(3.5 * n, 1)}　　$\\sigma$＝《約|やく》 ${A.num(s, 2)}`; }
    },
    {
      key: 'jikken', label: '② ふって《確|たし》かめる',
      lead: 'サイコロ $n$ 《個|こ》を《何回|なんかい》もふって、《和|わ》の《回数|かいすう》を《数|かぞ》えます。▶ を《押|お》すと、どんどんふります。《点線|てんせん》は《計算|けいさん》した《確率|かくりつ》です。',
      note: 'ふる《回数|かいすう》が《少|すく》ないうちは、《柱|はしら》はでこぼこです。《回数|かいすう》をふやすほど、《柱|はしら》は《計算|けいさん》した《形|かたち》（《点線|てんせん》）に《近|ちか》づきます。1《個|こ》1《個|こ》のサイコロは《平|たい》らでも、たくさん《足|た》すと、まん《中|なか》が《高|たか》い《山|やま》になります。',
      legend: [['ふった《結果|けっか》の《割合|わりあい》（《柱|はしら》）', { color: 'a', shape: 'square' }], ['《計算|けいさん》した《確率|かくりつ》', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'n', label: 'サイコロの《個数|こすう》', min: 1, max: 10, step: 1, d: 0, on: st => { st.m = 0; } }, { range: 'm', label: 'ふった《回数|かいすう》', min: 0, max: 400, step: 1, d: 0 }],
      init(st) { st.n = 3; st.m = 0; },
      step(st, dt) { st.m = Math.min(Math.floor(4000 / st.n), 400, st.m + (st.m < 20 ? dt * 6 : dt * 60)); if (st.m >= Math.min(400, Math.floor(4000 / st.n))) return false; },
      draw(cv, st) { const h = hist(st.n, Math.floor(st.m)); bars(cv, DIST[st.n], st.n, h, false); },
      readout: st => `サイコロ ${st.n} 《個|こ》を ${Math.floor(st.m)} 《回|かい》ふった`
    },
    {
      key: 'galton', label: '③ ガルトンボード',
      lead: '《板|いた》にくぎを《三角形|さんかくけい》に《打|う》ち、《上|うえ》から《玉|たま》を《落|お》とします。《玉|たま》は、くぎに《当|あ》たるたびに、《左|ひだり》か《右|みぎ》に《半分|はんぶん》ずつの《確率|かくりつ》で《分|わ》かれます。▶ で《玉|たま》を《落|お》としましょう。',
      note: 'くぎが6《段|だん》なら、《玉|たま》の《右|みぎ》へ《行|い》った《回数|かいすう》は、コイン6《枚|まい》の《表|おもて》の《枚数|まいすう》と《同|おな》じです。《下|した》の7つの《部屋|へや》に《入|はい》る《玉|たま》の《数|かず》は、パスカルの《三角形|さんかくけい》の6《段|だん》め（1、6、15、20、15、6、1）に《比例|ひれい》して、つりがね《形|かたち》にたまります。',
      legend: [['たまった《玉|たま》', { color: 'a', shape: 'circle' }], ['1・6・15・20・15・6・1 に《比例|ひれい》', { color: 'b', style: 'dash' }], ['いま《落|お》ちている《玉|たま》', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'T', label: '《時間|じかん》', min: 0, max: 200 * GAP + 7 * ROW, step: 0.01, fmt: v => A.num(Math.min(200, Math.max(0, Math.floor((v - 7 * ROW) / GAP) + 1)), 0) + ' こ' }],
      init(st) { st.T = 0; },
      step(st, dt) { st.T = Math.min(200 * GAP + 7 * ROW, st.T + dt * 0.5); if (st.T >= 200 * GAP + 7 * ROW) return false; },
      draw(cv, st) { drawGalton(cv, st); },
      readout: st => { const b = landed(st.T); const N = b.reduce((s, v) => s + v, 0); return `たまった《玉|たま》 ${N} こ：${b.join('、')}　　（${N} こを 1：6：15：20：15：6：1 に《分|わ》けると ${[1, 6, 15, 20, 15, 6, 1].map(c => A.num(N * c / 64, 1)).join('、')}）`; }
    },
    {
      key: 'pascal', label: '④ パスカルの《三角形|さんかくけい》',
      lead: 'コイン $n$ 《枚|まい》を《投|な》げたとき、《表|おもて》が $k$ 《枚|まい》になる《場合|ばあい》の《数|かず》を、パスカルの《三角形|さんかくけい》で《数|かぞ》えます。▶ で《段|だん》をふやします。',
      note: 'はしは1、そのほかの《数|かず》は、すぐ《上|うえ》の《左右|さゆう》の2つの《数|かず》をたした《数|かず》です。$n$ 《段|だん》めの《数|かず》をたすと $2^n$（《全部|ぜんぶ》の《場合|ばあい》の《数|かず》）。《段|だん》をふやすほど、《柱|はしら》の《形|かたち》はつりがね《形|かたち》に《近|ちか》づきます。',
      legend: [['《表|おもて》が $k$ 《枚|まい》になる《場合|ばあい》の《数|かず》', { color: 'a', shape: 'square' }], ['いまの《段|だん》', { color: 'b', shape: 'square', noline: true }]],
      controls: [{ range: 'nc', label: 'コインの《枚数|まいすう》 $n$', min: 0, max: 10, step: 1, d: 0 }],
      init(st) { st.nc = 0; st.T = 0; },
      step(st, dt) { st.T += dt; st.nc = Math.min(10, Math.floor(st.T / 0.9)); if (st.nc >= 10 && st.T > 10) return false; },
      draw(cv, st) { drawPascal(cv, st); },
      readout: st => { const n = st.nc, row = []; for (let k = 0; k <= n; k++) row.push(C(n, k)); return `${n} 《枚|まい》：${row.join('、')}　　たすと ${row.reduce((a, b) => a + b, 0)}＝$2^{${n}}$`; }
    }
  ]
});

function hist(n, m) { const h = new Array(6 * n + 1).fill(0); for (let r = 0; r < m; r++) { let s = 0; for (let k = 0; k < n; k++) s += ROLLS[r * n + k]; h[s]++; } return h.map(c => m ? c / m : 0); }
function bars(cv, d, n, h, nor) {
  const pmax = Math.max(...d) * (h ? 1.6 : 1.2), lo = n - 0.7, hi = 6 * n + 0.7;
  const v = cv.view({ x0: lo, x1: hi, y0: 0, y1: pmax, box: [70, 20, 770, 360] });
  const st = n <= 2 ? 1 : n <= 4 ? 2 : 5, xt = []; for (let x = Math.ceil(n / st) * st; x <= 6 * n; x += st) xt.push(x);
  const yst = pmax > 0.3 ? 0.1 : pmax > 0.1 ? 0.05 : pmax > 0.04 ? 0.02 : 0.01, yt = []; for (let y = yst; y < pmax; y += yst) yt.push(+y.toFixed(3));
  v.axes({ xt, yt, ay: lo, yfmt: y => A.num(y, 2), xl: 'わ', yl: 'かくりつ' });
  const w = 0.4;
  const src = h || d;
  for (let s = n; s <= 6 * n; s++) if (src[s] > 0) v.poly([[s - w, 0], [s + w, 0], [s + w, src[s]], [s - w, src[s]]], { fill: 'a', alpha: 0.45, color: 'a', width: 1 });
  if (h) for (let s = n; s <= 6 * n; s++) v.line([[s - w, d[s]], [s + w, d[s]]], { color: 'b', style: 'dash', width: 2.5 });
  if (nor) { const mu = 3.5 * n, sg = Math.sqrt(n * 35 / 12); v.plot(x => Math.exp(-((x - mu) ** 2) / (2 * sg * sg)) / (sg * Math.sqrt(2 * Math.PI)), { color: 'b', style: 'dash', width: 2.5 }); }
  if (!h) { const mu = 3.5 * n, sg = Math.sqrt(n * 35 / 12); if (n > 1) for (const x of [mu - sg, mu + sg]) v.line([[x, 0], [x, pmax * 0.92]], { color: 'c', style: 'dot', width: 2 }); }
  cv.text(`サイコロ ${n} こ`, 830, 36, { align: 'right', size: 18, bold: true });
}
function landed(T) { const b = new Array(7).fill(0); for (let i = 0; i < 200; i++) { const p = (T - i * GAP) / ROW; if (p >= 7) b[GB[i].reduce((s, v) => s + v, 0)]++; } return b; }
function drawGalton(cv, st) {
  const T = st.T, cx = 300, top = 40, dy = 30, dx = 40;
  // くぎ
  for (let r = 0; r < 6; r++) for (let c = 0; c <= r; c++) cv.dot(cx + (c - r / 2) * dx, top + 30 + r * dy, { color: 'ink', r: 3.5 });
  // 部屋
  const by = top + 30 + 6 * dy + 6, bh = 112;
  for (let k = 0; k <= 7; k++) cv.line([[cx + (k - 3.5) * dx, by], [cx + (k - 3.5) * dx, by + bh]], { color: 'sub', width: 1.5 });
  cv.line([[cx - 3.5 * dx, by + bh], [cx + 3.5 * dx, by + bh]], { color: 'sub', width: 2 });
  const b = landed(T), N = b.reduce((s, v) => s + v, 0);
  for (let k = 0; k < 7; k++) {
    for (let j = 0; j < b[k]; j++) { const col = j % 4, row = Math.floor(j / 4); cv.circle(cx + (k - 3) * dx + (col - 1.5) * 8.5, by + bh - 5 - row * 6.5, 3.6, { fill: 'a', alpha: 0.8, color: 'a', width: 1 }); }
    const ex = N * [1, 6, 15, 20, 15, 6, 1][k] / 64, rows = ex / 4;
    if (N) cv.line([[cx + (k - 3.45) * dx, by + bh - rows * 6.5 - 2], [cx + (k - 2.55) * dx, by + bh - rows * 6.5 - 2]], { color: 'b', style: 'dash', width: 2.5 });
    cv.text(String(b[k]), cx + (k - 3) * dx, by + bh + 16, { align: 'center', size: 15 });
  }
  // 落ちている玉
  for (let i = 0; i < 200; i++) {
    const p = (T - i * GAP) / ROW; if (p < 0 || p >= 7) continue;
    const r = Math.floor(p), f = p - r, path = GB[i];
    const off = j => { let s = 0; for (let q = 0; q < Math.min(j, 6); q++) s += path[q] ? 0.5 : -0.5; return s; };
    const x = cx + (A.lerp(off(r), off(r + 1), f)) * dx, y = top + 10 + p * dy;
    cv.circle(x, y, 6, { fill: 'b', alpha: 1, color: 'b', width: 1 });
  }
  cv.text('6だんの くぎ', cx, 22, { align: 'center', size: 15, color: 'sub' });
  // 右：パスカルの6段め
  cv.text('6だんめ', 620, 120, { size: 16, bold: true });
  cv.text('1　6　15　20　15　6　1', 620, 150, { size: 17 });
  cv.text('（ぜんぶで 64 とおり）', 620, 180, { size: 15, color: 'sub' });
  cv.text(`たまった たま ${N} こ`, 620, 240, { size: 16, bold: true, color: 'a' });
}
function drawPascal(cv, st) {
  const n = st.nc, X0 = 260, Y0 = 30, dx = 34, dy = 31;
  for (let r = 0; r <= n; r++) {
    const on = r === n, hl = r === 4;
    cv.text(`${r}まい`, 20, Y0 + r * dy, { size: 14, color: 'sub' });
    if (on) cv.rect(X0 - (r / 2) * dx - 22, Y0 + r * dy - 13, r * dx + 44, 26, { fill: 'hl', alpha: 1 });
    for (let k = 0; k <= r; k++) cv.text(String(C(r, k)), X0 + (k - r / 2) * dx, Y0 + r * dy, { align: 'center', size: r >= 9 ? 14 : 15, bold: on, color: on ? 'b' : hl ? 'ink' : 'sub' });
  }
  // 右：いまの段の柱
  const row = []; for (let k = 0; k <= n; k++) row.push(C(n, k));
  const mx = Math.max(...row);
  const v = cv.view({ x0: -0.8, x1: Math.max(4, n) + 0.8, y0: 0, y1: mx * 1.15, box: [520, 30, 330, 330] });
  v.axes({ xt: A.range(0, Math.max(4, n), 1), yt: [], ay: -0.8, zero: true, xl: 'k' });
  row.forEach((c, k) => { v.poly([[k - 0.35, 0], [k + 0.35, 0], [k + 0.35, c], [k - 0.35, c]], { fill: 'a', alpha: 0.45, color: 'a', width: 1 }); v.text(String(c), k, c + mx * 0.04, { align: 'center', size: 14, color: 'b' }); });
}
