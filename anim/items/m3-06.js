// @id m3-06
// @title 箱の体積がいちばん大きくなる x
// @vol 数学5
// @uses 3d
// @from 数学 5-7 はてな（ch5-07:14〜35）・展開図（ch5-07:54）・体積のグラフ（ch5-07:224〜244）・まちがえやすいところ（ch5-07:546）／最適化 でも使う
'use strict';
// 1 辺 12 cm の紙の 4 すみから 1 辺 x の正方形を切りとる。V=x(12−2x)²、V′=12(x−2)(x−6)
// x=1〜5 で V=100・128・108・64・20。x=2 で最大 128 cm³
// まちがえやすいところ：f(x)=x³−3x（−2≦x≦3）の最大値は、極大値 2 ではなく、はしの f(3)=18
const V = x => x * (12 - 2 * x) ** 2, dV = x => 12 * (x - 2) * (x - 6);
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);

A.item({
  id: 'm3-06', title: '箱の体積がいちばん大きくなる x',
  from: '数学 第5巻 5-7「最大・最小」のはてな？と体積のグラフから（最適化 でも使う）',
  W: 880, H: 420,
  state: { x: 2, fold: 0, t: 0, yaw: -30, pitch: 38 },
  scenes: [
    {
      key: 'oru', label: '① 切って折る',
      lead: '1 辺 12 cm の正方形の紙の 4 すみから、1 辺 $x$ cm の正方形を切りとって折り曲げ、ふたのない箱をつくります。▶ で折り曲げます。図はドラッグで回せます。',
      note: '底の 1 辺は $12-x-x=12-2x$、深さは $x$。体積は $V=x(12-2x)^2$ です。$x$ を小さくすると浅くなり、大きくすると底がせまくなります。',
      legend: [['箱の底（$12-2x$ の正方形）', { color: 'a', style: 'solid' }], ['折り曲げるかべ（深さ $x$）', { color: 'e', style: 'dash' }], ['切りとる正方形', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'x', label: '切りとる $x$（cm）', min: 0.5, max: 5.5, step: 0.1, d: 1 }, { range: 'fold', label: '折り曲げる', min: 0, max: 1, step: 0.01, fmt: v => Math.round(v * 90) + '°' }],
      step(st, dt) { st.t += dt; st.fold = ease(st.t / 2.5); if (st.t >= 2.5) return false; },
      drag: A.rotDrag([0, 0, 480, 420]),
      draw(cv, st) { drawBox(cv, st, [0, 0, 480, 420], 25); drawTable(cv, st); },
      readout: st => `$x$ ＝ ${A.num(st.x, 1)} cm：底の 1 辺 ${A.num(12 - 2 * st.x, 1)} cm、深さ ${A.num(st.x, 1)} cm、体積 $V$ ＝ <b>${A.num(V(st.x), 1)} cm³</b>`
    },
    {
      key: 'graph', label: '② 体積のグラフと $V\'$',
      lead: '$x$ を 0 から 6 まで動かし、体積 $V$ のグラフの上を点が動くようすと、接線の傾き $V\'$ を見ます。',
      note: '$V\'=12(x-2)(x-6)$。$x=2$ の前は $V\'>0$（ふえる）、後は $V\'<0$（へる）なので、$x=2$ で最大 $2\\times8^2=128$ cm³ です。$x=6$ でも $V\'=0$ ですが、範囲 $0<x<6$ に入りません（底の 1 辺が 0）。',
      legend: [['$V=x(12-2x)^2$', { color: 'a', width: 3 }], ['接線（傾き $V\'$）', { color: 'b', style: 'dash' }], ['やってみようの 5 つの箱', { color: 'ink', shape: 'circle', noline: true }], ['最大の所', { color: 'd', shape: 'diamond', noline: true }]],
      state: { x: 0.2, fold: 1 },
      controls: [{ range: 'x', label: '切りとる $x$（cm）', min: 0.2, max: 5.8, step: 0.05, d: 2 }],
      step(st, dt) { st.x = Math.min(5.8, st.x + dt * 0.8); if (st.x >= 5.8) return false; },
      drag: {
        hit: (st, x, y) => x > 470 ? 1 : null,
        move(st, x, y, api) { st.x = A.clamp(+graphView(api.cv).inv(x, y)[0].toFixed(2), 0.2, 5.8); }
      },
      draw(cv, st) { drawBox(cv, st, [0, 30, 440, 360], 19); drawGraph(cv, st); },
      readout: st => { const d = dV(st.x); return `$x$ ＝ ${A.num(st.x, 2)}：$V$ ＝ ${A.num(V(st.x), 1)}、$V'$ ＝ 12(${A.num(st.x - 2, 2)})(${A.num(st.x - 6, 2)}) ＝ <b>${A.num(d, 1)}</b>　${Math.abs(d) < 0.5 ? '平ら（いちばん上）' : d > 0 ? 'ふえている' : 'へっている'}`; }
    },
    {
      key: 'hashi', label: '③ 範囲のはしも見る',
      lead: '$f(x)=x^3-3x$ を、$-2\\leqq x\\leqq b$ の範囲で考えます。右はし $b$ を動かすと、最大値はどこになるでしょう。',
      note: '極大は $x=-1$ の 2 です。でも $b$ が 2 をこえると、はしの $f(b)$ のほうが大きくなります。$b=3$ なら $f(3)=27-9=18$ が最大値です。',
      miss: '範囲が決まっているとき、極大値がいちばん大きいとはかぎりません。極大・極小の値と、**はしの値**を全部くらべます。',
      legend: [['$y=x^3-3x$（範囲の中）', { color: 'a', width: 3 }], ['範囲の外', { color: 'sub', style: 'dot' }], ['極大 (−1, 2)', { color: 'ink', shape: 'circle', noline: true }], ['いまの最大値', { color: 'b', shape: 'diamond', noline: true }]],
      state: { b: 1 },
      controls: [{ range: 'b', label: '右はし $b$', min: -0.5, max: 3, step: 0.05, d: 2 }],
      step(st, dt) { st.b = Math.min(3, st.b + dt * 0.5); if (st.b >= 3) return false; },
      draw(cv, st) { drawHashi(cv, st); },
      readout: st => { const m = maxOn(st.b); return `$-2\\leqq x\\leqq$ ${A.num(st.b, 2)}：極大値 2、はしの値 $f(b)$ ＝ ${A.num(st.b ** 3 - 3 * st.b, 2)} → 最大値 <b>${A.num(m[1], 2)}</b>（$x$ ＝ ${A.num(m[0], 2)}）`; }
    }
  ]
});

function drawBox(cv, st, box, scale) {
  const x = st.x, s = 12 - 2 * x, h = s / 2, ph = st.fold * Math.PI / 2, c = Math.cos(ph), sn = Math.sin(ph);
  const W3 = new A.View3(cv, { box, yaw: st.yaw, pitch: st.pitch, scale, center: [0, 0, 1], persp: 0.04 });
  // 切りとる正方形（平らなときだけ、うすく）
  if (st.fold < 0.35) for (const [sx, sy] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) W3.poly3([[sx * h, sy * h, 0], [sx * (h + x), sy * h, 0], [sx * (h + x), sy * (h + x), 0], [sx * h, sy * (h + x), 0]], { color: 'sub', style: 'dot', width: 1.5, zbias: -50 });
  W3.poly3([[-h, -h, 0], [h, -h, 0], [h, h, 0], [-h, h, 0]], { fill: 'a', alpha: 0.28, color: 'a', width: 2, zbias: -20 });
  // かべ 4 まい：ちょうつがいの辺から、外へ x、上へ回す
  const flap = (ux, uy) => {
    const vx = -uy, vy = ux;   // ちょうつがいにそった向き
    const p1 = [ux * h + vx * h, uy * h + vy * h, 0], p2 = [ux * h - vx * h, uy * h - vy * h, 0];
    const q2 = [p2[0] + ux * x * c, p2[1] + uy * x * c, x * sn], q1 = [p1[0] + ux * x * c, p1[1] + uy * x * c, x * sn];
    W3.poly3([p1, p2, q2, q1], { fill: 'e', alpha: 0.35, color: 'e', style: 'dash', width: 2 });
  };
  flap(1, 0); flap(-1, 0); flap(0, 1); flap(0, -1);
  // 寸法
  W3.text3(`12−2x ＝ ${A.num(s, 1)}`, [0, -h - (st.fold > 0.5 ? 1.6 : x + 1.4), 0], { align: 'center', size: 15, bold: true, bg: true });
  W3.text3(`x ＝ ${A.num(x, 1)}`, [h + x * c + 0.6, -h, x * sn / 2], { align: 'left', size: 15, bold: true, bg: true });
  W3.flush();
}
function drawTable(cv, st) {
  const L = 520, T = 40;
  cv.text('V ＝ x(12 − 2x)²', L, T, { size: 17, bold: true });
  cv.text('x（cm）', L, T + 40, { size: 15, color: 'sub' }); cv.text('底の 1 辺', L + 90, T + 40, { size: 15, color: 'sub' }); cv.text('体積 V（cm³）', L + 190, T + 40, { size: 15, color: 'sub' });
  cv.line([[L - 6, T + 56], [870, T + 56]], { color: 'line', width: 1 });
  [1, 2, 3, 4, 5].forEach((k, i) => {
    const y = T + 84 + i * 38, on = Math.abs(st.x - k) < 0.05;
    if (on) cv.rect(L - 6, y - 16, 340, 32, { fill: 'hl', alpha: 1 });
    cv.text(String(k), L + 10, y, { size: 16, bold: on }); cv.text(String(12 - 2 * k), L + 110, y, { size: 16, bold: on }); cv.text(String(V(k)), L + 210, y, { size: 16, bold: true, color: k === 2 ? 'b' : 'ink' });
  });
  cv.text('（x を 0.1 ずつ動かして、くらべよう）', L, T + 290, { size: 14, color: 'sub' });
}
function graphView(cv) { return cv.view({ x0: 0, x1: 6.4, y0: 0, y1: 150, box: [480, 30, 370, 320] }); }
function drawGraph(cv, st) {
  const g = graphView(cv), x = st.x, y = V(x), m = dV(x);
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [50, 100, 128], xl: 'x（cm）', yl: 'V（cm³）' });
  g.plot(V, { x0: 0, x1: 6, color: 'a', width: 3 });
  for (const k of [1, 2, 3, 4, 5]) g.dot(k, V(k), { color: 'ink', r: 4, open: true });
  g.dot(2, 128, { color: 'd', shape: 'diamond', r: 7 });
  const half = 70 / Math.hypot(g.sx, m * g.sy);
  g.plot(t => y + m * (t - x), { x0: x - half, x1: x + half, color: 'b', style: 'dash', width: 3 });
  g.dot(x, y, { color: 'ink', r: 6 });
  g.text(`V′ ＝ ${A.num(m, 1)}`, x, y + 12, { align: 'center', base: 'bottom', size: 15, bold: true, bg: true, color: 'b' });
  // 増減表
  const L = 480, T = 404;
  cv.text('x：0 … 2 … 6　V′：＋ 0 −　V：↗ 128（最大）↘', L, T, { size: 15 });
}
function maxOn(b) {
  const f = x => x ** 3 - 3 * x, c = [[-2, f(-2)], [b, f(b)]];
  if (b >= -1) c.push([-1, 2]);
  return c.reduce((p, q) => q[1] > p[1] + 1e-12 ? q : p);
}
function drawHashi(cv, st) {
  const f = x => x ** 3 - 3 * x, b = st.b;
  const v = cv.view({ x0: -2.5, x1: 3.5, y0: -4, y1: 21, box: [60, 20, 520, 370] });
  v.axes({ xt: [-2, -1, 1, 2, 3], yt: [2, 10, 18], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  v.plot(f, { x0: -2.4, x1: 3.15, color: 'sub', style: 'dot', width: 2 });
  v.plot(f, { x0: -2, x1: b, color: 'a', width: 3.5 });
  v.line([[-2, -4], [-2, 21]], { color: 'sub', width: 1, style: 'dash' });
  v.line([[b, -4], [b, 21]], { color: 'sub', width: 1, style: 'dash' });
  v.text('はし −2', -2, 20, { align: 'center', size: 14, color: 'sub', bg: true });
  v.text(`はし b`, b, 20, { align: 'center', size: 14, color: 'sub', bg: true });
  if (b >= -1) { v.dot(-1, 2, { color: 'ink', r: 6 }); v.text('極大 2', -1, 2.8, { align: 'center', base: 'bottom', size: 15, bg: true }); }
  v.dot(b, f(b), { color: 'ink', r: 5, shape: 'square' });
  const m = maxOn(b);
  v.dot(m[0], m[1], { color: 'b', shape: 'diamond', r: 9 });
  v.line([[-2.5, m[1]], [3.5, m[1]]], { color: 'b', width: 1.5, style: 'dash' });
  const L = 620;
  cv.text('くらべる値', L, 50, { size: 16, bold: true });
  cv.text(`はし f(−2) ＝ −2`, L, 90, { size: 16 });
  cv.text(b >= -1 ? '極大 f(−1) ＝ 2' : '極大：範囲の外', L, 125, { size: 16 });
  cv.text(`はし f(b) ＝ ${A.num(f(b), 2)}`, L, 160, { size: 16 });
  cv.text(`最大値 ＝ ${A.num(m[1], 2)}`, L, 210, { size: 18, bold: true, color: 'b' });
}
