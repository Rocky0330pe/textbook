// @id m3-02
// @title 傾きを集めると導関数
// @vol 数学5
// @from 数学 5-3 ④（ch5-03:246〜258）・5-7 ①（ch5-07:108）・5-15 ④（ch5-15:208〜224）、まちがえやすいところ（ch5-07:530・ch5-03:444）／5-5・5-18、物理 波 でも使う
'use strict';
// 5-3：y=x² の接線の傾きを点で打つと y′=2x（a=−1,0,1,2 で −2,0,2,4）
// 5-7：f(x)=x³−3x、f′(x)=3x²−3。x=−1 で極大 2、x=1 で極小 −2。f(x)=x³ は f′(0)=0 でも極値でない
// 5-15：(sin x)′=cos x。x=4 の接線は x≈1.35 でもう一度グラフと交わる（ch5-03:444 の図）
const FNS = {
  x2: { f: x => x * x, d: x => 2 * x, x0: -2.2, x1: 2.4, fy: [-0.6, 4.6], dy: [-4.6, 4.8], xt: [-2, -1, 1, 2], fyt: [1, 2, 3, 4], dyt: [-4, -2, 2, 4], name: 'y=x^2', dname: "y'=2x", a0: -2, a1: 2.1, zeros: [0] },
  x3m3: { f: x => x ** 3 - 3 * x, d: x => 3 * x * x - 3, x0: -2.3, x1: 2.5, fy: [-3, 3.6], dy: [-4, 10.6], xt: [-2, -1, 1, 2], fyt: [-2, 2], dyt: [-3, 3, 6, 9], name: 'y=x^3-3x', dname: "y'=3x^2-3", a0: -2.05, a1: 2.05, zeros: [-1, 1] },
  x3: { f: x => x ** 3, d: x => 3 * x * x, x0: -1.6, x1: 1.75, fy: [-3.6, 3.8], dy: [-1.2, 7.2], xt: [-1, 1], fyt: [-2, 2], dyt: [2, 4, 6], name: 'y=x^3', dname: "y'=3x^2", a0: -1.5, a1: 1.5, zeros: [0] },
  sin: { f: Math.sin, d: Math.cos, x0: 0, x1: 6.9, fy: [-1.45, 1.5], dy: [-1.45, 1.5], xt: A.range(0, 2 * Math.PI, Math.PI / 2), fyt: [-1, 1], dyt: [-1, 1], name: 'y=\\sin x', dname: "y'=\\cos x", a0: 0, a1: 2 * Math.PI, zeros: [Math.PI / 2, 3 * Math.PI / 2], pi: true }
};
const BOXL = [55, 30, 370, 350], BOXR = [500, 30, 360, 350];
const fnOf = st => FNS[st.fn];
function views(cv, F) {
  return [cv.view({ x0: F.x0, x1: F.x1, y0: F.fy[0], y1: F.fy[1], box: BOXL }), cv.view({ x0: F.x0, x1: F.x1, y0: F.dy[0], y1: F.dy[1], box: BOXR })];
}
function resetTrail(st) { st.lo = st.a; st.hi = st.a; }
function setA(st, a) { const F = fnOf(st); st.a = A.clamp(a, F.a0, F.a1); st.lo = Math.min(st.lo, st.a); st.hi = Math.max(st.hi, st.a); }
const play = (st, dt) => { const F = fnOf(st); if (st.a >= F.a1 - 1e-9) return false; setA(st, st.a + dt * (F.a1 - F.a0) / 7); };
const dragA = {
  hit(st, x, y) { return (x >= BOXL[0] - 10 && x <= BOXL[0] + BOXL[2] + 10 && y >= BOXL[1] && y <= BOXL[1] + BOXL[3]) || (x >= BOXR[0] && x <= BOXR[0] + BOXR[2] && y >= BOXR[1] && y <= BOXR[1] + BOXR[3]) ? 1 : null; },
  move(st, x, y, api) { const F = fnOf(st), [l, r] = views(api.cv, F); const v = x < (BOXL[0] + BOXL[2] + BOXR[0]) / 2 ? l : r; setA(st, v.inv(x, y)[0]); }
};
const sgnWord = m => Math.abs(m) < 0.02 ? '平ら（傾き 0）' : m > 0 ? '上がる（傾き＋）' : '下がる（傾き−）';

A.item({
  id: 'm3-02', title: '傾きを集めると導関数',
  from: '数学 第5巻 5-3「導関数」・5-7「増減表」・5-15「sin・cos の微分」の図から（5-5・5-18、物理 波 でも使う）',
  W: 880, H: 420,
  scenes: [
    {
      key: 'x2', label: '① $y=x^2$ の傾き',
      lead: '左のグラフの接点を走らせ、その点の接線の傾きを、右のグラフに点で打っていきます。▶ で始めるか、グラフをドラッグしましょう。',
      note: '傾きの点は、直線 $y\'=2x$ にならびます（$a=-1,0,1,2$ で $-2,0,2,4$）。「$x$ を入れると、その点の接線の傾きが出てくる関数」が**導関数**です。',
      state: { fn: 'x2', a: -2 },
      init: resetTrail,
      legend: [['$y=x^2$', { color: 'a', width: 3 }], ['接線', { color: 'b', style: 'dash' }], ["傾きを打った点（$y'=2x$）", { color: 'd', shape: 'square' }]],
      controls: [{ range: 'a', label: '接点の $x$', min: -2, max: 2.1, step: 0.01, on: st => setA(st, st.a) }],
      step: play, drag: dragA,
      draw(cv, st) { drawD(cv, st); },
      readout: st => `接点 $x$ ＝ ${A.num(st.a, 2)}：傾き $f'(x)=2x$ ＝ <b>${A.num(2 * st.a, 2)}</b>　${sgnWord(2 * st.a)}`
    },
    {
      key: 'zougen', label: '② 上がる・下がる',
      lead: '$f(x)=x^3-3x$ の接線の傾きの符号を見ます。傾きが＋の所は上がり、−の所は下がります。',
      note: '$f\'(x)=3x^2-3$ が 0 になるのは $x=\\pm1$。$x=-1$ の前後で $f\'$ は＋から−に変わるので極大（$f(-1)=2$）、$x=1$ の前後で−から＋に変わるので極小（$f(1)=-2$）です。',
      miss: '$f\'(x)=0$ なら、いつも極大か極小？　「$y=x^3$」に切りかえてみましょう。$f\'(0)=0$ ですが、前でも後でも $f\'>0$ で、ずっと上がり続けます。前後で符号が変わらなければ、極大でも極小でもありません。',
      state: { fn: 'x3m3', a: -2.05 },
      init: resetTrail,
      legend: [['$y=f(x)$', { color: 'a', width: 3 }], ['接線（傾き＋）', { color: 'c', style: 'solid' }], ['接線（傾き−）', { color: 'b', style: 'dash' }], ["$f'=0$ の所", { color: 'd', shape: 'diamond', noline: true }]],
      controls: [{ seg: 'fn', label: '関数', options: [['x3m3', '$y=x^3-3x$'], ['x3', '$y=x^3$']], on: st => { const F = fnOf(st); st.a = F.a0; resetTrail(st); } },
        { range: 'a', label: '接点の $x$', min: -2.05, max: 2.05, step: 0.01, on: st => setA(st, st.a) }],
      step: play, drag: dragA,
      draw(cv, st) { drawD(cv, st, { sign: true }); },
      readout: st => { const F = fnOf(st), m = F.d(st.a); return `接点 $x$ ＝ ${A.num(st.a, 2)}：$f'(x)$ ＝ <b>${A.num(m, 2)}</b>　${sgnWord(m)}`; }
    },
    {
      key: 'sin', label: '③ sin の傾きは cos',
      lead: '$y=\\sin x$ の接線の傾きを集めると、どんなグラフになるでしょう。',
      note: '傾きの点は $y=\\cos x$ にならびます。$\\sin x$ が 0 を上向きに通る所で傾きは最大の 1、山（$x=\\frac{\\pi}{2}$）で傾き 0、0 を下向きに通る所で $-1$ です。',
      miss: '接線は、グラフと 1 点だけで交わる？　円ならそうですが、曲線の接線は、接点からはなれた所で、もう一度交わることがあります（○の所。$x=4$ の接線は $x\\approx1.35$ で交わる）。接線かどうかは「接点の近くでぴったりふれているか」で決まります。',
      state: { fn: 'sin', a: 0 },
      init: resetTrail,
      legend: [['$y=\\sin x$', { color: 'a', width: 3 }], ['接線（長くのばした）', { color: 'b', style: 'dash' }], ["傾きを打った点（$y'=\\cos x$）", { color: 'd', shape: 'square' }], ['もう一度交わる所', { color: 'ink', shape: 'circle', noline: true }]],
      controls: [{ range: 'a', label: '接点の $x$', min: 0, max: 2 * Math.PI, step: 0.01, fmt: v => A.num(v, 2), on: st => setA(st, st.a) }],
      step: play, drag: dragA,
      draw(cv, st) { drawD(cv, st, { long: true }); },
      readout: st => `接点 $x$ ＝ ${A.num(st.a, 2)}：傾き $\\cos x$ ＝ <b>${A.num(Math.cos(st.a), 3)}</b>　${sgnWord(Math.cos(st.a))}`
    }
  ]
});

function drawD(cv, st, o = {}) {
  const F = fnOf(st), [l, r] = views(cv, F), a = st.a, fa = F.f(a), m = F.d(a);
  const xf = F.pi ? (v => A.pi(v, 2)) : undefined;
  l.axes({ xt: F.xt, yt: F.fyt, xl: 'x', yl: 'y', xlItalic: true, ylItalic: true, xfmt: xf });
  r.axes({ xt: F.xt, yt: F.dyt, xl: 'x', xlItalic: true, xfmt: xf });
  cv.text(F.name.replace('\\sin ', 'sin ').replace('^2', '²').replace('^3', '³').replace('-', '−'), BOXL[0] + BOXL[2] - 4, BOXL[1] - 14, { size: 16, color: 'a', bold: true, align: 'right', bg: true });
  cv.text('傾きのグラフ ' + F.dname.replace('\\cos ', 'cos ').replace('^2', '²').replace("'", '′').replace('-', '−'), BOXR[0] + BOXR[2] - 4, BOXR[1] - 14, { size: 16, color: 'd', bold: true, align: 'right', bg: true });
  // 左：グラフと接線
  l.plot(F.f, { color: 'a', width: 3 });
  let col = 'b', sty = 'dash';
  if (o.sign) { if (Math.abs(m) < 0.02) { col = 'd'; sty = 'dot'; } else if (m > 0) { col = 'c'; sty = 'solid'; } }
  const half = o.long ? 99 : 120 / Math.hypot(l.sx, m * l.sy);   // 画面で 120px ずつ
  l.plot(x => fa + m * (x - a), { color: col, style: sty, width: 3, x0: Math.max(F.x0, a - half), x1: Math.min(F.x1, a + half) });
  if (o.long) {
    // もう一度交わる所をさがす
    const g = x => F.f(x) - fa - m * (x - a), N = 600;
    for (let k = 0; k < N; k++) {
      let p = F.x0 + (F.x1 - F.x0) * k / N, q = F.x0 + (F.x1 - F.x0) * (k + 1) / N;
      if (g(p) * g(q) > 0) continue;
      for (let it = 0; it < 40; it++) { const c = (p + q) / 2; if (g(p) * g(c) <= 0) q = c; else p = c; }
      const xr = (p + q) / 2;
      if (Math.abs(xr - a) > 0.08 && F.f(xr) > F.fy[0] && F.f(xr) < F.fy[1]) { l.dot(xr, F.f(xr), { color: 'ink', r: 7, open: true }); l.text('交わる', xr, F.f(xr) + 0.16, { align: 'center', base: 'bottom', size: 15, bg: true }); }
    }
  }
  if (o.sign) for (const z of F.zeros) { l.dot(z, F.f(z), { color: 'd', shape: 'diamond', r: 6 }); r.dot(z, 0, { color: 'd', shape: 'diamond', r: 6 }); }
  l.dot(a, fa, { color: 'ink', r: 6 });
  // 右：打った点（集めた範囲）
  r.plot(F.d, { color: 'd', width: 1.5, alpha: 0.45, x0: st.lo, x1: st.hi });
  const stp = (F.x1 - F.x0) / 24;
  for (let x = Math.ceil(st.lo / stp) * stp; x <= st.hi + 1e-9; x += stp) r.dot(x, F.d(x), { color: 'd', shape: 'square', r: 4 });
  // 接点と傾きの点を結ぶ（同じ x）
  cv.line([[l.X(a), l.Y(fa)], [r.X(a), r.Y(m)]], { color: 'sub', style: 'dot', width: 1.2, alpha: 0.7 });
  r.line([[a, 0], [a, m]], { color: col, width: 3, style: sty });
  r.dot(a, m, { color: 'd', shape: 'square', r: 7 });
  if (o.sign) {
    // 傾きの符号を右のグラフに書く
    r.text(m > 0.02 ? '傾き＋' : m < -0.02 ? '傾き−' : '傾き 0', a, m > 0 ? m + 0.04 * (F.dy[1] - F.dy[0]) : m - 0.04 * (F.dy[1] - F.dy[0]), { size: 16, bold: true, color: col, bg: true, align: 'center' });
  }
}
