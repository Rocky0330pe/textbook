// @id p2-11
// @title 波の表計算がこわれるとき
// @vol 物理3
// @from 物理 波-5 ⑧（p3-05 表計算で波を動かす・s≦1）／数学 8-13 ⑧、電-14・電-13 でも使う
'use strict';
// 本と同じ表計算：点 i=0〜20（両はし固定）、はじめ点9・10・11 に 0.5・1・0.5、手をはなした瞬間は止まっている。
//   1歩め：y¹ᵢ = y⁰ᵢ + (s²/2)(y⁰ᵢ₊₁ − 2y⁰ᵢ + y⁰ᵢ₋₁)
//   2歩めから：yⁿ⁺¹ᵢ = 2yⁿᵢ − yⁿ⁻¹ᵢ + s²(yⁿᵢ₊₁ − 2yⁿᵢ + yⁿᵢ₋₁)
// s=1.1 で 10歩で高さ約13、20歩で約4万（1歩に約2.43倍）。いちばん細かいぎざぎざ（λ=2Δx）の1歩の倍率 G は
// G² − 2(1−2s²)G + 1 = 0 の大きいほうの解（s≦1 なら |G|=1）。
const N = 21;
A.item({
  id: 'p2-11', title: '波の表計算がこわれるとき',
  from: '物理 第3巻 波-5 ⑧ の表と図「波の表計算（s=1 と s=1.1）」から（数学 8-13 ⑧、電-14・電-13 でも使う）',
  W: 880, H: 440,
  state: { s: 1, n: 0, acc: 0, hist: null },
  scenes: [
    {
      key: 'hyou', label: '① 1歩ずつ進める',
      lead: '弦を21個の点に分けた表計算です。「1歩」を押すか再生して、$s=1$ と $s=1.1$ で比べましょう。',
      note: '$s=1$ では、高さ 0.5 の山が2つに分かれ、1歩に1点ずつ左右へ進みます。$s=1.1$ では、まん中に $+$ と $-$ が交互に並ぶぎざぎざが出て、1歩に約2.4倍ずつ育ちます（10歩で高さ約13、20歩で約4万）。数値計算がこわれるようすを、そのまま見ています。',
      legend: [['いまの歩の値', { color: 'a', shape: 'circle' }], ['はじめの形（0歩）', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 's', label: '$s=c\\,\\Delta t/\\Delta x$', min: 0.5, max: 1.2, step: 0.05, d: 2, on: st => { st.s = Math.round(st.s * 100) / 100; reset(st); } }, { button: '1歩', act: (st, api) => { api.play(false); one(st); } }],
      init: reset,
      step(st, dt) { st.acc += dt; if (st.acc > 0.4) { st.acc = 0; one(st); } if (st.n >= 20) return false; },
      draw(cv, st) { hyou(cv, st); },
      readout: st => `$s$ ＝ ${A.num(st.s, 2)}　　${st.n} 歩め　　いちばん大きいずれ ＝ <b>${fmt(Math.max(...st.hist[st.n].map(Math.abs)))}</b>`
    },
    {
      key: 'sodatsu', label: '② 育ち方を数える',
      lead: '1歩ごとの「いちばん大きいずれ」を、たての目もりを10倍ごとに同じ長さにしたグラフにかきます。',
      note: '10倍ごとに同じ長さの目もりでは、毎歩同じ倍率で育つものは、まっすぐな線になります。$s=1.1$ の線の傾きは、1歩に約2.43倍です。$s\\leqq1$ では、いちばん大きいずれは 1 より大きくなりません。',
      legend: [['いまの $s$', { color: 'a', shape: 'circle' }], ['$s=1.1$', { color: 'b', style: 'dash' }], ['$s=1$', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 's', label: '$s$', min: 0.5, max: 1.2, step: 0.05, d: 2, on: st => { st.s = Math.round(st.s * 100) / 100; reset(st); } }],
      init: reset,
      autoplay: true,
      step(st, dt) { st.acc += dt; if (st.acc > 0.25) { st.acc = 0; one(st); } if (st.n >= 20) return false; },
      draw(cv, st) { sodatsu(cv, st); },
      readout: st => `$s$ ＝ ${A.num(st.s, 2)}　　ぎざぎざの1歩の倍率 $|G|$ ＝ <b>${A.num(gmax(st.s), 2)}</b>　　${st.n} 歩めのいちばん大きいずれ ＝ ${fmt(Math.max(...st.hist[st.n].map(Math.abs)))}`
    },
    {
      key: 'naze', label: '③ なぜ s≦1？',
      lead: 'こわれるのは、点ごとに $+$ と $-$ が入れかわる、いちばん細かいぎざぎざ（$\\lambda=2\\Delta x$）です。その1歩の倍率を $s$ に対してかきます。',
      note: 'ぎざぎざは、ばねとおもりの列のいちばん速いゆれ $\\omega_{\\max}=2c/\\Delta x$ です。速度を先に進めるオイラー法でこわれない条件 $\\omega_{\\max}\\Delta t\\leqq2$ は、$s=c\\,\\Delta t/\\Delta x\\leqq1$ と同じです。「1歩のあいだに、波がマス1つより遠くへ行ってはいけない」（8-13 ⑧の CFL 条件）とも読めます。',
      miss: '$s<1$（たとえば 0.5）にすると、こわれはしませんが、山は少し低く広がり、後ろにさざ波を引きずります（数値分散）。本物の弦にはない、計算が作ったにせものの分散です。',
      legend: [['ぎざぎざの1歩の倍率 $|G|$', { color: 'a' }], ['いまの $s$', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 's', label: '$s$', min: 0.5, max: 1.3, step: 0.01, d: 2 }],
      draw(cv, st) { naze(cv, st); },
      readout: st => `$\\omega_{\\max}\\Delta t=2s$ ＝ ${A.num(2 * st.s, 2)}（${2 * st.s <= 2 + 1e-9 ? '2 以下：こわれない' : '2 をこえる：こわれる'}）　　$|G|$ ＝ ${A.num(gmax(st.s), 3)}`
    }
  ]
});

function fmt(v) { const a = Math.abs(v); return a >= 1000 ? Math.round(v).toLocaleString('ja-JP') : A.num(v + Math.sign(v) * 1e-9, a >= 10 ? 1 : 2); }
function gmax(s) { const b = 1 - 2 * s * s; return b * b <= 1 ? 1 : Math.abs(b) + Math.sqrt(b * b - 1); }
function reset(st) {
  const y0 = new Array(N).fill(0); y0[9] = 0.5; y0[10] = 1; y0[11] = 0.5;
  const s2 = st.s * st.s, y1 = y0.map((v, i) => i === 0 || i === N - 1 ? 0 : v + s2 / 2 * (y0[i + 1] - 2 * v + y0[i - 1]));
  st.all = [y0, y1];
  for (let n = 2; n <= 20; n++) { const c = st.all[n - 1], p = st.all[n - 2]; st.all.push(c.map((v, i) => i === 0 || i === N - 1 ? 0 : 2 * v - p[i] + s2 * (c[i + 1] - 2 * v + c[i - 1]))); }
  st.hist = st.all; st.n = 0; st.acc = 0;
}
function one(st) { if (st.n < 20) st.n++; }

function hyou(cv, st) {
  const y = st.hist[st.n], m = Math.max(1.15, ...y.map(Math.abs)) * 1.1;
  const v = cv.view({ x0: -0.6, x1: 20.6, y0: -m, y1: m, box: [70, 15, 760, 240] });
  const tk = m > 3 ? niceTicks(m) : [-1, -0.5, 0.5, 1];
  v.axes({ xt: A.range(0, 20, 2), yt: tk, xl: '点 i', yfmt: x => fmt(x) });
  v.line(st.hist[0].map((yy, i) => [i, yy]), { color: 'sub', style: 'dot', width: 1.5 });
  v.line(y.map((yy, i) => [i, yy]), { color: 'a', width: 2.5 });
  y.forEach((yy, i) => v.dot(i, yy, { color: 'a', r: 4.5 }));
  if (m > 3) cv.text('たての目もりに注意（いちばん大きいずれに合わせて変わる）', 840, 30, { align: 'right', size: 14, color: 'b' });
  // 表（点6〜14、いまの歩とその前4歩）
  const x0 = 90, dx = 78, y0 = 290;
  cv.text('歩', x0 - 40, y0, { size: 14, color: 'sub', align: 'center' });
  for (let i = 6; i <= 14; i++) cv.text('点' + i, x0 + (i - 6 + 0.5) * dx, y0, { size: 14, color: 'sub', align: 'center' });
  const n0 = Math.max(0, st.n - 4);
  for (let r = 0; r <= Math.min(4, st.n); r++) {
    const n = n0 + r, row = st.hist[n], yy = y0 + 26 * (r + 1);
    if (n === st.n) cv.rect(x0 - 60, yy - 12, 9 * dx + 60, 24, { fill: 'hl', alpha: 0.9 });
    cv.text(String(n), x0 - 40, yy, { size: 14, align: 'center' });
    for (let i = 6; i <= 14; i++) cv.text(fmt(row[i]), x0 + (i - 6 + 0.5) * dx, yy, { size: 14, align: 'center' });
  }
}
function niceTicks(m) { const p = Math.pow(10, Math.floor(Math.log10(m * 0.9))), st = m / p > 5 ? 2 * p : m / p > 2.5 ? p : p / 2, r = []; for (let v = st; v < m; v += st) { r.push(v, -v); } return r; }

function sodatsu(cv, st) {
  const g = cv.view({ x0: -0.5, x1: 20.8, y0: -0.5, y1: 5, box: [90, 20, 740, 360] });
  g.axes({ xt: A.range(0, 20, 2), yt: [0, 1, 2, 3, 4], xl: '歩', yl: 'いちばん大きいずれ', yfmt: v => ['1', '10', '100', '1000', '1万'][v], ay: -0.5, zero: true });
  const lg = (s, n) => { const st2 = { s }; reset(st2); return Math.log10(Math.max(1e-3, ...st2.all[n].map(Math.abs))); };
  const ref = s => { const st2 = { s }; reset(st2); return st2.all.map((r, n) => [n, Math.log10(Math.max(...r.map(Math.abs)))]); };
  g.line(ref(1), { color: 'sub', style: 'dot', width: 2 });
  g.clip(() => g.line(ref(1.1), { color: 'b', style: 'dash', width: 2 }));
  const cur = st.hist.slice(0, st.n + 1).map((r, n) => [n, Math.log10(Math.max(...r.map(Math.abs)))]);
  g.clip(() => { g.line(cur, { color: 'a', width: 3 }); cur.forEach(p => { if (p[1] < 5) g.dot(p[0], p[1], { color: 'a', r: 5 }); }); });
  g.text('s ＝ 1.1：1歩に約2.4倍', 12.5, lg(1.1, 12) - 0.35, { size: 15, color: 'b', bg: true });
  g.text('s ＝ 1：1 をこえない', 14, 0.6, { size: 15, color: 'sub', bg: true });
}

function naze(cv, st) {
  const g = cv.view({ x0: 0.45, x1: 1.32, y0: 0, y1: 4.2, box: [80, 20, 470, 360] });
  g.axes({ xt: [0.5, 0.75, 1, 1.1, 1.25], yt: [1, 2, 2.43, 3, 4], xl: 's', yl: '|G|', ay: 0.45, yfmt: v => A.num(v, v % 1 ? 2 : 0), xfmt: v => A.num(v, 2) });
  g.poly([[1, 0], [1.32, 0], [1.32, 4.2], [1, 4.2]], { fill: 'b', alpha: 0.08 });
  g.text('こわれる', 1.16, 3.9, { align: 'center', size: 15, color: 'b' });
  g.text('こわれない（s ≦ 1）', 0.72, 3.9, { align: 'center', size: 15, color: 'c' });
  g.plot(gmax, { color: 'a', width: 3 });
  g.dot(st.s, gmax(st.s), { color: 'b', shape: 'diamond', r: 7 });
  // 右：ぎざぎざの形
  const h = cv.view({ x0: -0.5, x1: 10.5, y0: -1.6, y1: 1.6, box: [590, 60, 270, 150] });
  h.line([[-0.5, 0], [10.5, 0]], { color: 'grid', width: 1 });
  const z = []; for (let i = 0; i <= 10; i++) z.push([i, i % 2 ? -1 : 1]);
  h.line(z, { color: 'b', width: 2 }); z.forEach(p => h.dot(p[0], p[1], { color: 'b', r: 4 }));
  cv.text('いちばん細かいぎざぎざ（λ ＝ 2Δx）', 725, 40, { align: 'center', size: 14, bold: true });
  cv.text('ωmax ＝ 2c/Δx', 725, 240, { align: 'center', size: 15 });
  cv.text('こわれない：ωmax Δt ≦ 2', 725, 270, { align: 'center', size: 15 });
  cv.text('⇔ s ＝ cΔt/Δx ≦ 1', 725, 300, { align: 'center', size: 15, bold: true });
}
