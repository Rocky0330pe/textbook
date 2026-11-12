// @id p2-04
// @title つないだ2つのふりこ：ゆれの行き来
// @vol 物理3
// @from 物理 波-3 ①②（p3-03 つないだふりこ・ゆれの行き来・2つのモード）／原-6・原-7・原-8・波-8 でも使う
'use strict';
// 本の数（6-14 の台車と同じ）：m=1 kg、両はしのばね k=100 N/m、つなぎのばね k_c=10 N/m。
// ω1=√(k/m)=10、ω2=√((k+2k_c)/m)≈10.95 rad/s。片方だけ 0.1 m 引くと (0.1, 0)=(0.05, 0.05)+(0.05, −0.05)。
// t_移る=π/(ω2−ω1)≈3.3 s、T_うなり≈6.6 s。ふりこでも、つなぎが弱ければ同じ形のグラフになる。
const M = 1, K = 100;
A.item({
  id: 'p2-04', title: 'つないだ2つのふりこ：ゆれの行き来',
  from: '物理 第3巻 波-3 ①② の図「ばねでつないだ2つのふりこ」「ゆれの行き来」「2つの振動モード」から（原-6・原-7・原-8・波-8 でも使う）',
  W: 880, H: 430,
  state: { t: 0, kc: 10, a: 0.1, b: 0, shape: 'kata' },
  scenes: [
    {
      key: 'ikiki', label: '① ゆれが行き来する',
      lead: '左のふりこだけを 0.1 m 引いて放します。止めておいた右のふりこは、どうなるでしょう。',
      note: '左のゆれがだんだん小さくなり、右がだんだん大きくゆれ始めます。約 3.3 s でゆれはすっかり右へ移り、約 6.6 s で左へもどります。1回1回のゆれ（約 0.6 s で1往復）は速く、ゆれの大きさは、それよりずっとゆっくり行き来しています。うなりと同じ形です。',
      legend: [['左のふりこ $x_1$', { color: 'a' }], ['右のふりこ $x_2$', { color: 'b', style: 'dash' }], ['ゆれの大きさ（つつみ）', { color: 'sub', style: 'dot' }]],
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 14) st.t = 0; },
      draw(cv, st) { scene(cv, st, {}); },
      readout: st => { const [w1, w2] = ws(st.kc); return `時刻 ${A.num(st.t, 1)} s　　$t_{\\text{移る}}=\\pi/(\\omega_2-\\omega_1)$ ＝ ${A.num(Math.PI / (w2 - w1), 1)} s　　$T_{\\text{うなり}}$ ＝ ${A.num(2 * Math.PI / (w2 - w1), 1)} s`; }
    },
    {
      key: 'katachi', label: '② はじめの形を変える',
      lead: '放すときの形を「片方」「いっしょ（1次モード）」「反対（2次モード）」に変えてみましょう。',
      note: '2つを同じ向きに放すと（1次モード）、つなぎのばねはのびもちぢみもせず、2つはいつまでもそろって $\\omega_1=\\sqrt{k/m}$ でゆれます。反対向き（2次モード）では、つなぎのばねが押しもどすので、少し速い $\\omega_2=\\sqrt{(k+2k_{\\mathrm c})/m}$ でゆれます。どちらも、ゆれは移りません。片方だけを放した形は、この2つのたし算です。',
      legend: [['左のふりこ $x_1$', { color: 'a' }], ['右のふりこ $x_2$', { color: 'b', style: 'dash' }]],
      controls: [{ seg: 'shape', label: 'はじめの形', options: [['kata', '片方だけ (0.1, 0)'], ['m1', '1次 (0.05, 0.05)'], ['m2', '2次 (0.05, −0.05)']], on: setShape }, { range: 'kc', label: 'つなぎのばね $k_{\\mathrm c}$〔N/m〕', min: 2, max: 40, step: 1, d: 0, on: st => { st.t = 0; } }],
      init: setShape,
      autoplay: true,
      step(st, dt) { st.t += dt; if (st.t > 14) st.t = 0; },
      draw(cv, st) { scene(cv, st, {}); },
      readout: st => { const [w1, w2] = ws(st.kc); return `$\\omega_1$ ＝ ${A.num(w1, 2)}　　$\\omega_2$ ＝ ${A.num(w2, 2)} rad/s　　${st.shape === 'kata' ? `$T_{\\text{うなり}}=2\\pi/(\\omega_2-\\omega_1)$ ＝ <b>${A.num(2 * Math.PI / (w2 - w1), 2)} s</b>` : 'ゆれは移らない（形を保ってゆれる）'}`; }
    },
    {
      key: 'tashizan', label: '③ 2つのモードのたし算',
      lead: '2つのモードを、それぞれの角振動数で回る矢印で表します。左のふりこのずれは、2本の矢印の和の横の成分です。',
      note: '$x_1=0.05\\cos\\omega_1t+0.05\\cos\\omega_2t$、$x_2=0.05\\cos\\omega_1t-0.05\\cos\\omega_2t$ です。2本の矢印は少しずつ角がずれていき、ずれがちょうど $\\pi$（半周）になると、$x_1$ のほうが打ち消し合います。だから、ゆれが行って帰る時間は、角振動数の**差**で決まります：$T_{\\text{うなり}}=2\\pi/(\\omega_2-\\omega_1)$。',
      legend: [['1次モードの矢印（$\\omega_1$）', { color: 'c' }], ['2次モードの矢印（$\\omega_2$）', { color: 'd', style: 'dash' }], ['和（$x_1$）', { color: 'a' }], ['本の例（$k_{\\mathrm c}$=5・10・20・40）', { color: 'sub', shape: 'square', noline: true }]],
      controls: [{ range: 'kc', label: 'つなぎのばね $k_{\\mathrm c}$〔N/m〕', min: 2, max: 40, step: 1, d: 0, on: st => { st.t = 0; } }],
      autoplay: true,
      step(st, dt) { st.t += dt * 0.5; if (st.t > 14) st.t = 0; },
      draw(cv, st) { phasor(cv, st); },
      readout: st => { const [w1, w2] = ws(st.kc), d = ((w2 - w1) * st.t) % (2 * Math.PI); return `2本の矢印の角のずれ $(\\omega_2-\\omega_1)t$ ＝ ${Math.round(d * 180 / Math.PI)}°　　${Math.abs(d - Math.PI) < 0.25 ? '<b>半周：$x_1$ はほとんど0</b>' : ''}`; }
    }
  ]
});

function ws(kc) { return [Math.sqrt(K / M), Math.sqrt((K + 2 * kc) / M)]; }
function setShape(st) { const s = { kata: [0.1, 0], m1: [0.05, 0.05], m2: [0.05, -0.05] }[st.shape]; st.a = s[0]; st.b = s[1]; st.t = 0; }
function xs(st, t) {
  const [w1, w2] = ws(st.kc), q1 = (st.a + st.b) / 2, q2 = (st.a - st.b) / 2;
  return [q1 * Math.cos(w1 * t) + q2 * Math.cos(w2 * t), q1 * Math.cos(w1 * t) - q2 * Math.cos(w2 * t)];
}

// 2つのふりこ（左右の中心 c1・c2、ずれは px/m で sc 倍）
function pends(cv, c1, c2, top, len, x1, x2, sc) {
  cv.rect(c1 - 50, top - 10, c2 - c1 + 100, 10, { fill: 'sub', alpha: 0.4 });
  const by = top + len, b1 = c1 + x1 * sc, b2 = c2 + x2 * sc, f = 0.62;
  for (const [c, b] of [[c1, b1], [c2, b2]]) { cv.line([[c, top], [c, by + 24]], { color: 'grid', style: 'dot', width: 1.5 }); cv.line([[c, top], [b, by]], { color: 'ink', width: 2 }); }
  // つなぎのばね（糸の途中どうし）
  const p1 = [c1 + (b1 - c1) * f, top + len * f], p2 = [c2 + (b2 - c2) * f, top + len * f], n = 9, pts = [p1];
  for (let i = 1; i < n; i++) pts.push([p1[0] + 8 + (p2[0] - p1[0] - 16) * i / n, p1[1] + (i % 2 ? -7 : 7)]);
  pts.push(p2); cv.line(pts, { color: 'sub', width: 1.8 });
  cv.circle(b1, by, 14, { fill: 'a', alpha: 0.4, color: 'a', width: 2 });
  cv.rect(b2 - 13, by - 13, 26, 26, { fill: 'b', alpha: 0.35, color: 'b', width: 2 });
  cv.text('1', b1, by, { align: 'center', size: 14, bold: true }); cv.text('2', b2, by, { align: 'center', size: 14, bold: true });
}

function scene(cv, st) {
  const [x1, x2] = xs(st, st.t), [w1, w2] = ws(st.kc), q1 = (st.a + st.b) / 2, q2 = (st.a - st.b) / 2;
  pends(cv, 80, 210, 40, 250, x1, x2, 300);
  cv.text('x₁', 80, 345, { align: 'center', size: 15, color: 'a' }); cv.text('x₂', 210, 345, { align: 'center', size: 15, color: 'b' });
  if (st.shape === 'kata' || !st.shape) cv.text('kc ＝ ' + st.kc + ' N/m', 145, 385, { align: 'center', size: 15, color: 'sub' });
  const g1 = cv.view({ x0: 0, x1: 14.3, y0: -0.13, y1: 0.13, box: [330, 20, 520, 170] });
  const g2 = cv.view({ x0: 0, x1: 14.3, y0: -0.13, y1: 0.13, box: [330, 225, 520, 170] });
  for (const [g, nm] of [[g1, 'x₁〔m〕'], [g2, 'x₂〔m〕']]) g.axes({ xt: [2, 4, 6, 8, 10, 12, 14], yt: [-0.1, 0.1], yl: nm, xl: 't〔s〕', yfmt: v => A.num(v, 1) });
  // つつみ：|q1 cos ω1 t ± q2 cos ω2 t| の大きさ
  const env = (t, s) => Math.sqrt(q1 * q1 + q2 * q2 + s * 2 * q1 * q2 * Math.cos((w2 - w1) * t));
  for (const sg of [1, -1]) { g1.plot(t => sg * env(t, 1), { color: 'sub', style: 'dot', width: 1.5 }); g2.plot(t => sg * env(t, -1), { color: 'sub', style: 'dot', width: 1.5 }); }
  g1.plot(t => xs(st, t)[0], { x0: 0, x1: st.t, color: 'a', width: 1.6, n: 1400 });
  g2.plot(t => xs(st, t)[1], { x0: 0, x1: st.t, color: 'b', style: 'dash', width: 1.6, n: 1400 });
  g1.dot(st.t, x1, { color: 'a', r: 5 }); g2.dot(st.t, x2, { color: 'b', shape: 'square', r: 5 });
  if (st.shape === 'kata') {
    const tm = Math.PI / (w2 - w1);
    for (const [tt, s] of [[tm, '移る ' + A.num(tm, 1) + ' s'], [2 * tm, 'もどる ' + A.num(2 * tm, 1) + ' s']]) if (tt < 14.3) {
      cv.line([[g1.X(tt), 20], [g1.X(tt), 395]], { color: 'sub', style: 'dashdot', width: 1 });
      cv.text(s, g1.X(tt) + 4, 205, { size: 14, color: 'ink', bg: true });
    }
  }
}

function phasor(cv, st) {
  const [w1, w2] = ws(st.kc), t = st.t, a1 = w1 * t, a2 = w2 * t, r = 0.05;
  const v = cv.view({ x0: -0.105, x1: 0.105, y0: -0.105, y1: 0.105, box: [5, 20, 320, 340], equal: true });
  v.axes({ xt: [-0.05, 0.05], yt: [], xfmt: v => A.num(v, 2) });
  v.circle(0, 0, r, { color: 'grid', width: 1 });
  const p1 = [r * Math.cos(a1), r * Math.sin(a1)], p2 = [p1[0] + r * Math.cos(a2), p1[1] + r * Math.sin(a2)];
  v.arrow(0, 0, p1[0], p1[1], { color: 'c', width: 3 });
  v.arrow(p1[0], p1[1], p2[0], p2[1], { color: 'd', width: 3, style: 'dash' });
  v.arrow(0, 0, p2[0], p2[1], { color: 'a', width: 2, alpha: 0.6 });
  v.line([[p2[0], p2[1]], [p2[0], 0]], { color: 'a', style: 'dot', width: 1.5 });
  v.dot(p2[0], 0, { color: 'a', r: 6 });
  cv.text('●：x₁（和の矢印の横の成分）', 165, 395, { align: 'center', size: 15, color: 'a' });
  // 角のずれの弧
  const d = ((w2 - w1) * t) % (2 * Math.PI), arc = [];
  for (let k = 0; k <= 30; k++) { const u = a1 + d * k / 30; arc.push([p1[0] + 0.022 * Math.cos(u), p1[1] + 0.022 * Math.sin(u)]); }
  v.line(arc, { color: 'ink', width: 1.5 });
  // x1 のグラフ
  const g = cv.view({ x0: 0, x1: 14.3, y0: -0.13, y1: 0.13, box: [340, 20, 520, 175] });
  g.axes({ xt: [2, 4, 6, 8, 10, 12, 14], yt: [-0.1, 0.1], yl: 'x₁〔m〕', xl: 't〔s〕', yfmt: v => A.num(v, 1) });
  for (const sg of [1, -1]) g.plot(tt => sg * 0.1 * Math.abs(Math.cos((w2 - w1) * tt / 2)), { color: 'sub', style: 'dot', width: 1.5 });
  g.plot(tt => r * (Math.cos(w1 * tt) + Math.cos(w2 * tt)), { x0: 0, x1: t, color: 'a', width: 1.6, n: 1400 });
  g.dot(t, p2[0], { color: 'a', r: 5 });
  // T_うなり と k_c
  const h = cv.view({ x0: 0, x1: 42, y0: 0, y1: 16, box: [340, 245, 520, 150] });
  h.axes({ xt: [5, 10, 20, 40], yt: [3.4, 6.6, 12.9], xl: 'kc〔N/m〕', yl: 'T うなり〔s〕', yfmt: v => A.num(v, 1) });
  h.plot(k => 2 * Math.PI / (Math.sqrt(100 + 2 * k) - 10), { x0: 4.4, x1: 42, color: 'a', width: 2.5 });
  for (const [k, T] of [[5, 12.87], [10, 6.58], [20, 3.43], [40, 1.84]]) h.dot(k, T, { color: 'sub', shape: 'square', r: 5 });
  h.dot(st.kc, Math.min(16, 2 * Math.PI / (w2 - w1)), { color: 'b', r: 7 });
  h.text('2倍にすると約半分', 21, 6, { size: 14, color: 'sub' });
}
