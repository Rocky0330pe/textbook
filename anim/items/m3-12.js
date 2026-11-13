// @id m3-12
// @title 速度は半径を 90° 回したもの：sin・cos の微分
// @vol 数学5
// @from 数学 5-15 ①〜⑥（ch5-15:85〜136 の半径と速度の三角形・208〜256 の 1/4 周期と 4 回の微分・299〜319 の単振動）／6-6・6-10、物理 波・電 でも使う
'use strict';
// 5-15：P＝(cos t, sin t)、速度＝(−sin t, cos t)。t=π/6 で P(0.866, 0.5)、速度(−0.5, 0.866)
//       0.001 秒あとは (0.865525, 0.500866)。(sin t)′＝cos t、(cos t)′＝−sin t。4 回微分でもとにもどる
// 5-15：ばね m=0.5 kg、k=8 N/m で ω²=16、ω=4、周期 2π/4≈1.57 s。x=A sin ωt、ẍ=−ω²x
const TAU = 2 * Math.PI;
const D4 = [['sin t', 0], ['cos t', 1], ['−sin t', 2], ['−cos t', 3]];
const ease = u => u < 0 ? 0 : u > 1 ? 1 : u * u * (3 - 2 * u);

A.item({
  id: 'm3-12', title: '速度は半径を 90° 回したもの：sin・cos の微分',
  from: '数学 第5巻 5-15「三角関数の微分」の図から（6-6・6-10、物理 波・電 でも使う）',
  W: 880, H: 420,
  state: { t: Math.PI / 6, tt: 0 },
  scenes: [
    {
      key: 'sankaku', label: '① 半径の三角形を 90° 回す',
      lead: '点 P が半径 1 の円を、1 秒に角 1（ラジアン）ずつ左回りに回ります。半径の直角三角形と、速度の直角三角形をくらべましょう。',
      note: '速度の矢印は、長さ 1 で、半径を左回りに 90° 回した向きです。だから半径の三角形をまるごと 90° 回すと速度の三角形になり、たてと横が入れかわります。P＝$(\\cos t,\\ \\sin t)$ なら、速度＝$(-\\sin t,\\ \\cos t)$。',
      legend: [['長さ $\\cos t$ の辺（実線）', { color: 'a', style: 'solid', width: 4 }], ['長さ $\\sin t$ の辺（破線）', { color: 'b', style: 'dash', width: 4 }], ['速度の矢印（長さ 1）', { color: 'c', style: 'solid' }]],
      controls: [{ range: 't', label: '角 $t$', min: 0, max: TAU, step: 0.01, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { st.t = (st.t + dt * 0.5) % TAU; },
      draw(cv, st) { drawTri(cv, st); },
      readout: st => `P ＝ (${A.num(Math.cos(st.t), 3)}, ${A.num(Math.sin(st.t), 3)})　速度 ＝ (<b>${A.num(-Math.sin(st.t), 3)}</b>, <b>${A.num(Math.cos(st.t), 3)}</b>) ＝ $(-\\sin t,\\ \\cos t)$`
    },
    {
      key: 'katamuki', label: '② 高さの傾きは cos',
      lead: 'P の高さ $\\sin t$ を右のグラフにかき、そのグラフの接線の傾きと、速度のたての成分をくらべます。',
      note: '高さが変わる速さは、速度のたての成分 $\\cos t$ です。だから $(\\sin t)\'=\\cos t$。真横（$t=0,\\ \\pi$）では速度がまっすぐ上か下を向き、高さはいちばん速く変わります。いちばん上では速度が真横で、高さは一瞬変わりません。',
      legend: [['高さ $\\sin t$', { color: 'a', width: 3 }], ['接線（傾き＝$\\cos t$）', { color: 'b', style: 'dash' }], ['速度のたての成分 $\\cos t$', { color: 'c', style: 'dot', width: 3 }]],
      state: { t: 0 },
      controls: [{ range: 't', label: '角 $t$', min: 0, max: TAU, step: 0.01, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { st.t += dt * 0.6; if (st.t >= TAU) { st.t = TAU; return false; } },
      draw(cv, st) { drawKata(cv, st); },
      readout: st => `$t$ ＝ ${Math.round(st.t * 180 / Math.PI)}°：高さ ${A.num(Math.sin(st.t), 3)}、接線の傾き ＝ 速度のたて ＝ <b>${A.num(Math.cos(st.t), 3)}</b>`
    },
    {
      key: 'yonkai', label: '③ 4 回でもとにもどる',
      lead: '「微分する」をおすと、波が $\\frac{1}{4}$ 周期（$\\frac{\\pi}{2}$）だけ左へずれます。4 回おすと、どうなるでしょう。',
      note: '微分するたびに $\\sin t\\to\\cos t\\to-\\sin t\\to-\\cos t\\to\\sin t$ と回り、4 回で 1 周期進んで、もとにもどります。$\\cos t=\\sin\\left(t+\\frac{\\pi}{2}\\right)$ です。',
      legend: [['いまの関数', { color: 'a', width: 3 }], ['もとの $\\sin t$', { color: 'sub', style: 'dash' }], ['山の位置', { color: 'b', shape: 'diamond', noline: true }]],
      state: { k: 0, sh: 0 },
      controls: [{ button: '微分する', act: st => { st.k = (st.k + 1) % 4; st.sh = 0; } }],
      step(st, dt) { st.tt += dt; if (st.tt > 2) { st.tt = 0; st.k = (st.k + 1) % 4; st.sh = 1; } st.sh = Math.max(0, st.sh - dt * 1.6); },
      draw(cv, st) { drawFour(cv, st); },
      readout: st => `${['$\\sin t$', '$\\cos t$', '$-\\sin t$', '$-\\cos t$'][st.k]}（${st.k} 回微分した）　次に微分すると ${['$\\cos t$', '$-\\sin t$', '$-\\cos t$', '$\\sin t$（もとにもどる）'][st.k]}`
    },
    {
      key: 'bane', label: '④ ばねのおもり（単振動）',
      lead: 'ばね（ばね定数 $k$）につけたおもり（質量 $m$）が、なめらかな床の上でゆれます。位置・速度・加速度のグラフを見ましょう。',
      note: '$x=A\\sin\\omega t$ なら $v=A\\omega\\cos\\omega t$、$a=-A\\omega^2\\sin\\omega t=-\\omega^2x$。加速度は位置に比例し、いつも中心のほうを向きます。$m\\ddot x=-kx$ から $\\omega^2=\\frac{k}{m}$。$m=0.5$ kg、$k=8$ N/m なら $\\omega=4$、周期 $\\frac{2\\pi}{4}\\approx1.57$ s です。',
      legend: [['位置 $x$', { color: 'a', width: 3 }], ['速度 $v$', { color: 'b', style: 'dash', width: 3 }], ['加速度 $a$', { color: 'c', style: 'dot', width: 3 }]],
      state: { k: 8, m: 0.5, s: 0 },
      controls: [{ range: 'k', label: 'ばね定数 $k$（N/m）', min: 2, max: 32, step: 0.5, d: 1 }, { range: 'm', label: '質量 $m$（kg）', min: 0.25, max: 2, step: 0.05 }],
      step(st, dt) { st.s += dt * 0.5; if (st.s > 3.2) st.s = 0; },
      draw(cv, st) { drawBane(cv, st); },
      readout: st => { const w = Math.sqrt(st.k / st.m); return `$\\omega=\\sqrt{k/m}$ ＝ <b>${A.num(w, 2)}</b> rad/s、周期 $\\frac{2\\pi}{\\omega}$ ＝ <b>${A.num(TAU / w, 2)} s</b>　（$t$ ＝ ${A.num(st.s, 2)} s）`; }
    }
  ]
});

function drawTri(cv, st) {
  const t = st.t, c = Math.cos(t), s = Math.sin(t);
  const v = cv.view({ x0: -1.75, x1: 1.75, y0: -1.75, y1: 1.75, box: [20, 10, 450, 400], equal: true });
  v.axes({ xt: [-1, 1], yt: [-1, 1], xl: 'x', yl: 'y', xlItalic: true, ylItalic: true });
  v.circle(0, 0, 1, { color: 'sub', width: 1.5 });
  // 半径の三角形
  v.poly([[0, 0], [c, 0], [c, s]], { fill: 'a', alpha: 0.1 });
  v.line([[0, 0], [c, 0]], { color: 'a', width: 4 });
  v.line([[c, 0], [c, s]], { color: 'b', width: 4, style: 'dash' });
  v.line([[0, 0], [c, s]], { color: 'ink', width: 2 });
  // 速度の三角形（90° 回した）：P から 横に −sin t、たてに cos t
  v.poly([[c, s], [c - s, s], [c - s, s + c]], { fill: 'b', alpha: 0.1 });
  v.line([[c, s], [c - s, s]], { color: 'b', width: 4, style: 'dash' });
  v.line([[c - s, s], [c - s, s + c]], { color: 'a', width: 4 });
  v.arrow(c, s, c - s, s + c, { color: 'c', width: 3.5 });
  v.dot(c, s, { color: 'ink', r: 6 });
  v.text('P', c + 0.08 * Math.cos(t - 0.6), s + 0.08 * Math.sin(t - 0.6) - 0.06, { size: 17, bold: true });
  // 角の弧
  const arc = []; for (let k = 0; k <= 30; k++) arc.push([0.22 * Math.cos(t * k / 30), 0.22 * Math.sin(t * k / 30)]);
  v.line(arc, { color: 'ink', width: 1.5 });
  // 直角の印（半径と速度のあいだ）
  const q = 0.1, ux = -s, uy = c;
  v.line([[c - q * c, s - q * s], [c - q * c + q * ux, s - q * s + q * uy], [c + q * ux, s + q * uy]], { color: 'ink', width: 1.5 });
  const L = 520, T = 40;
  cv.text('半径の三角形', L, T, { size: 16, bold: true });
  cv.text(`横 cos t ＝ ${A.num(c, 3)}、たて sin t ＝ ${A.num(s, 3)}`, L, T + 30, { size: 16 });
  cv.text('速度の三角形（90° 回した）', L, T + 80, { size: 16, bold: true, color: 'c' });
  cv.text(`横 −sin t ＝ ${A.num(-s, 3)}`, L, T + 110, { size: 16 });
  cv.text(`たて cos t ＝ ${A.num(c, 3)}`, L, T + 138, { size: 16 });
  cv.text('t＝π/6（30°）のとき、0.001 秒で', L, T + 196, { size: 15, color: 'sub' });
  cv.text('x：0.866025 → 0.865525（÷0.001 で −0.500）', L, T + 224, { size: 15, color: 'sub' });
  cv.text('y：0.500000 → 0.500866（÷0.001 で 0.866）', L, T + 250, { size: 15, color: 'sub' });
}

function drawKata(cv, st) {
  const t = st.t, c = Math.cos(t), s = Math.sin(t);
  const v = cv.view({ x0: -1.5, x1: 1.5, y0: -1.5, y1: 1.5, box: [10, 40, 280, 340], equal: true });
  v.axes({ xt: [-1, 1], yt: [-1, 1] });
  v.circle(0, 0, 1, { color: 'sub', width: 1.5 });
  v.line([[0, 0], [c, s]], { color: 'ink', width: 2 });
  v.line([[c, 0], [c, s]], { color: 'a', width: 3 });
  v.arrow(c, s, c - s * 0.8, s + c * 0.8, { color: 'sub', width: 2 });
  v.arrow(c - s * 0.8, s, c - s * 0.8, s + c * 0.8, { color: 'c', width: 3.5, style: 'dot' });
  v.dot(c, s, { color: 'a', r: 6 });
  const g = cv.view({ x0: 0, x1: TAU + 0.4, y0: -1.5, y1: 1.5, box: [320, 40, 540, 340] });
  g.axes({ xt: A.range(0, TAU, Math.PI / 2), yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't', xlItalic: true });
  g.plot(Math.sin, { x0: 0, x1: TAU, color: 'a', width: 1, alpha: 0.35 });
  g.plot(Math.sin, { x0: 0, x1: t, color: 'a', width: 3 });
  g.plot(Math.cos, { x0: 0, x1: t, color: 'c', style: 'dot', width: 3 });
  const half = 0.7 / Math.hypot(1, c);
  g.plot(x => s + c * (x - t), { x0: t - half, x1: t + half, color: 'b', style: 'dash', width: 3 });
  cv.line([[v.X(c), v.Y(s)], [g.X(t), g.Y(s)]], { color: 'sub', style: 'dot', width: 1 });
  g.dot(t, s, { color: 'a', r: 6 }); g.dot(t, c, { color: 'c', r: 5, shape: 'square' });
  g.text('sin t', TAU + 0.05, Math.sin(Math.min(t, TAU)) , { size: 15, color: 'a', bold: true });
}

function drawFour(cv, st) {
  const g = cv.view({ x0: 0, x1: TAU + 0.3, y0: -1.45, y1: 1.6, box: [50, 30, 520, 350] });
  g.axes({ xt: A.range(0, TAU, Math.PI / 2), yt: [-1, 1], xfmt: x => A.pi(x, 2), xl: 't', xlItalic: true });
  g.plot(Math.sin, { x0: 0, x1: TAU, color: 'sub', style: 'dash', width: 1.5 });
  const ph = (st.k - st.sh) * Math.PI / 2;   // 動きながら π/2 ずつずれる
  g.plot(x => Math.sin(x + ph), { x0: 0, x1: TAU, color: 'a', width: 3.5 });
  // 山の位置（sin(x+ph)=1）
  let xp = Math.PI / 2 - ph; while (xp < 0) xp += TAU; while (xp > TAU) xp -= TAU;
  g.dot(xp, 1, { color: 'b', shape: 'diamond', r: 7 });
  g.text('山', xp, 1.15, { align: 'center', base: 'bottom', size: 15, color: 'b', bold: true });
  if (st.sh > 0.02) g.arrow(xp + Math.PI / 2 * st.sh, 1.38, xp, 1.38, { color: 'b', width: 2 });
  // 右：まわる図
  const cx = 730, cy = 205, R = 95;
  D4.forEach(([nm, i]) => {
    const a = Math.PI / 2 - i * Math.PI / 2, x = cx + R * Math.cos(a), y = cy - R * Math.sin(a), on = i === st.k;
    cv.rect(x - 44, y - 18, 88, 36, { fill: on ? 'hl' : 'panel', alpha: 1, color: on ? 'b' : 'line', width: on ? 2.5 : 1 });
    cv.text(nm, x, y, { align: 'center', size: 17, bold: on, math: true });
  });
  for (let i = 0; i < 4; i++) {
    const a0 = Math.PI / 2 - i * Math.PI / 2 - 0.42, a1 = a0 - Math.PI / 2 + 0.84, pts = [];
    for (let k = 0; k <= 12; k++) { const a = a0 + (a1 - a0) * k / 12; pts.push([cx + (R + 4) * Math.cos(a), cy - (R + 4) * Math.sin(a)]); }
    cv.line(pts, { color: 'b', width: 2 }); cv.arrow(pts[11][0], pts[11][1], pts[12][0], pts[12][1], { color: 'b', width: 2, head: 10 });
  }
  cv.text('右回り：微分', cx, cy - 10, { align: 'center', size: 14, color: 'sub' });
  cv.text('左回り：積分', cx, cy + 12, { align: 'center', size: 14, color: 'sub' });
}

function drawBane(cv, st) {
  const w = Math.sqrt(st.k / st.m), Aa = 0.1, t = st.s, x = Aa * Math.sin(w * t), vv = Aa * w * Math.cos(w * t), a = -w * w * x;
  // 上：ばねとおもり
  const p = cv.view({ x0: -0.32, x1: 0.32, y0: 0, y1: 1, box: [40, 50, 320, 120] });
  cv.line([[p.X(-0.3), p.Y(0.2)], [p.X(0.3), p.Y(0.2)]], { color: 'ink', width: 2 });
  cv.line([[p.X(-0.3), p.Y(0.2)], [p.X(-0.3), p.Y(0.9)]], { color: 'ink', width: 3 });
  const bx = p.X(x), pts = [[p.X(-0.3), p.Y(0.5)]], N = 14;
  for (let k = 1; k < N; k++) pts.push([p.X(-0.3) + (bx - 22 - p.X(-0.3)) * k / N, p.Y(0.5) + (k % 2 ? -10 : 10)]);
  pts.push([bx - 22, p.Y(0.5)]);
  cv.line(pts, { color: 'sub', width: 2 });
  cv.rect(bx - 22, p.Y(0.2) - 44, 44, 44, { fill: 'd', alpha: 0.5, color: 'ink', width: 1.5 });
  cv.line([[p.X(0), p.Y(0.2) + 4], [p.X(0), p.Y(0.2) + 14]], { color: 'ink', width: 1.5 }); cv.text('中心', p.X(0), p.Y(0.2) + 26, { align: 'center', size: 14, color: 'sub' });
  // 矢印の長さは、それぞれの最大で 70px（速度・加速度は単位がちがう）
  const vm = Aa * w, am = Aa * w * w;
  if (Math.abs(vv) > 0.02 * vm) { cv.arrow(bx, p.Y(0.2) - 58, bx + vv / vm * 70, p.Y(0.2) - 58, { color: 'b', width: 3, style: 'dash' }); cv.text('v', bx + vv / vm * 70 + (vv > 0 ? 8 : -8), p.Y(0.2) - 58, { size: 15, bold: true, italic: true, math: true, color: 'b', align: vv > 0 ? 'left' : 'right' }); }
  if (Math.abs(a) > 0.02 * am) { cv.arrow(bx, p.Y(0.2) - 80, bx + a / am * 70, p.Y(0.2) - 80, { color: 'c', width: 3, style: 'dot' }); cv.text('a', bx + a / am * 70 + (a > 0 ? 8 : -8), p.Y(0.2) - 80, { size: 15, bold: true, italic: true, math: true, color: 'c', align: a > 0 ? 'left' : 'right' }); }
  cv.text('加速度は、いつも中心のほう', 60, 230, { size: 15 });
  cv.text('（位置と反対向き：a ＝ −ω²x）', 60, 256, { size: 15 });
  cv.text('はし：速度 0、加速度が最大', 60, 300, { size: 15, color: 'sub' });
  cv.text('中心：速度が最大、加速度 0', 60, 326, { size: 15, color: 'sub' });
  // 右と下：3 つのグラフ
  const L = 400, Wd = 450, T0 = 3.3;
  const gs = [['位置 x（m）', 'a', 'solid', s => Aa * Math.sin(w * s), Aa], ['速度 v（m/s）', 'b', 'dash', s => Aa * w * Math.cos(w * s), Aa * w], ['加速度 a（m/s²）', 'c', 'dot', s => -Aa * w * w * Math.sin(w * s), Aa * w * w]];
  gs.forEach(([nm, col, sty, f, amp], i) => {
    const box = [L, 22 + i * 132, Wd, 100];
    const ymax = amp * 1.35;   // 3 本とも、ゆれの大きさに合わせてかく（目もりの数がちがう）
    const g = cv.view({ x0: 0, x1: T0, y0: -ymax, y1: ymax, box });
    g.axes({ xt: [1, 2, 3], yt: [-amp, amp], yfmt: y => A.num(y, Math.abs(y) < 1 ? 2 : 1) });
    if (i === 2) cv.text('t（s）', box[0] + box[2], g.Y(0) + 16, { align: 'right', size: 14, color: 'sub' });
    g.plot(f, { x0: 0, x1: 3.2, color: col, style: sty, width: 2.5, n: 500 });
    cv.line([[g.X(t), g.T], [g.X(t), g.T + g.Hp]], { color: 'sub', style: 'dot', width: 1 });
    g.dot(t, f(t), { color: 'ink', r: 5 });
    cv.text(nm, box[0] + box[2], box[1] + 4, { align: 'right', size: 15, color: col, bold: true, bg: true });
  });
}
