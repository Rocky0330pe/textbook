// @id p2-33
// @title 光の時計：動く時計はおくれる
// @vol 物理5
// @from 物理 原-11 ⑦（p5-11 光の時計・γ のグラフ・例題5 の地上に届くミューオン）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数：γ＝1/√(1−β²)、β＝0.5 で 1.15、0.87 で 2.0、0.995 で 10。ミューオン：止まっていれば平均 2.2 μs、
// 0.995c で γ＝10.0、平均の寿命 22 μs、進む距離 660 m（おくれなし）と 6.6 km（おくれあり）。c＝3.00×10⁸ m/s。
// ミューオンが生まれる高さは「十数 km」なので、ここでは例として 15 km とした。乱数は A.rng で種を決める。
const gam = b => 1 / Math.sqrt(1 - b * b);
const dist = d => d < 1 ? Math.round(d * 100) * 10 + ' m' : A.num(d, 1) + ' km';   // 本と同じく2けた（660 m）
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const expct = n => n >= 0.5 ? A.num(n, 0) : (() => { const e = Math.floor(Math.log10(n)); return 'ほぼ0（約 ' + A.num(n / 10 ** e, 0) + '×10' + String(e).split('').map(c => SUP[c]).join('') + '）'; })();
const H0 = 15, NMU = 200, TAU0 = 2.2, C = 0.3;   // km、個、μs、km/μs

const ensureMu = st => { if (st.mk !== st.b + '/' + st.dil) initMu(st); };
A.item({
  id: 'p2-33', title: '光の時計：動く時計はおくれる',
  from: '物理 第5巻 原-11 ⑦ の図から（光の時計・γ と速さ・例題5 の地上に届くミューオン）',
  W: 880, H: 430,
  state: { b: 0.87, t: 0, dil: true },
  scenes: [
    {
      key: 'tokei', label: '① 光の時計',
      lead: '2枚の鏡の間を光が往復する時計を2つ用意し、右の時計だけを速さ $v$ で動かします。地面から見て、どちらが早く刻むでしょう。',
      note: '地面から見ると、動く時計の光は直角三角形の斜辺を進みます。光の速さはだれから見ても $c$ なので、1刻みが長くなり、$\\Delta t=\\gamma\\Delta t_0$、$\\gamma=\\dfrac{1}{\\sqrt{1-v^2/c^2}}$ です。下の目もりで、刻みの間かくをくらべましょう。',
      miss: '「速く動くと、時計のしくみが乱れて、おくれる」はまちがいです。どんな時計も同じ割合でおくれます。光の時計でも、原子の時計でも、ミューオンの寿命でも、同じ $\\gamma$ です（③）。時間そのものの進み方が、見る人によって違うのです。',
      legend: [['光', { color: 'e' }], ['地面から見た光の道', { color: 'e', style: 'dot' }], ['止まった時計の刻み', { color: 'a', shape: 'square', noline: true }], ['動く時計の刻み', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'b', label: '速さ $v/c$', min: 0, max: 0.95, step: 0.01, d: 2, on: st => { st.t = 0; } }],
      step(st, dt) { st.t += dt / 1.5; },
      draw: drawClock,
      readout: st => `$v/c$ ＝ ${A.num(st.b, 2)}${GAP}$\\gamma$ ＝ <b>${A.num(gam(st.b), 3)}</b>${GAP}地面の時間 ${A.num(st.t, 1)} 刻み：止まった時計 ${Math.floor(st.t)} 刻み、動く時計 ${Math.floor(st.t / gam(st.b))} 刻み`
    },
    {
      key: 'gamma', label: '② 速さと γ',
      lead: '速さ $\\beta=v/c$ を変えて、ローレンツ因子 $\\gamma$ を見ましょう。',
      note: '$v=0.5c$ では $\\gamma$＝1.15 ですが、0.87 倍では 2.0、0.995 倍では 10 です。速さを2倍にしても $\\gamma$ は2倍になりません。$c$ に近づくほど急に大きくなります。遅いときは $\\gamma\\approx1+\\frac{1}{2}\\beta^2$ で、ほとんど1です（時速 1000 km の飛行機でも $\\gamma-1\\approx4\\times10^{-13}$）。',
      legend: [['$\\gamma$', { color: 'a' }], ['$1+\\beta^2/2$', { color: 'b', style: 'dash' }], ['いまの速さ', { color: 'c', shape: 'diamond', noline: true }]],
      state: { b: 0.5 },
      controls: [{ range: 'b', label: '速さ $\\beta=v/c$', min: 0, max: 0.995, step: 0.001, d: 3 }],
      draw: drawGamma,
      readout: st => `$\\beta$ ＝ ${A.num(st.b, 3)}${GAP}$\\gamma=1/\\sqrt{1-\\beta^2}$ ＝ <b>${A.num(gam(st.b), 2)}</b>${GAP}動く時計が1秒刻む間に、止まった人の時計は ${A.num(gam(st.b), 2)} 秒進む`
    },
    {
      key: 'muon', label: '③ ミューオンが届く',
      lead: '高さ 15 km（例）で生まれた 200 個のミューオンが、光の速さに近い速さで落ちてきます。地上に届くのは何個でしょう。',
      note: 'ミューオンは止まっていれば平均 2.2 μs でこわれます。0.995$c$ なら、おくれを考えないと平均 660 m しか進めず、ほとんど地上に届きません。地上の人から見ると、ミューオンの時計は $\\gamma$＝10 倍ゆっくり進むので、平均の寿命は 22 μs、平均 6.6 km 進みます（例題5）。実際に地上でたくさん見つかるのは、時間のおくれの証拠です。',
      legend: [['飛んでいるミューオン', { color: 'a', shape: 'circle', noline: true }], ['こわれた所', { color: 'sub', shape: 'cross', noline: true }], ['地上に届いた', { color: 'c', shape: 'square', noline: true }]],
      state: { b: 0.995, dil: true },
      controls: [{ seg: 'dil', label: '計算', options: [[true, '時間のおくれを考える'], [false, '考えない']], on: initMu }, { range: 'b', label: '速さ $v/c$', min: 0.9, max: 0.999, step: 0.001, d: 3, on: initMu }],
      init: initMu,
      step(st, dt) { ensureMu(st); if (st.tm >= st.tEnd) return false; st.tm = Math.min(st.tEnd, st.tm + dt * st.tEnd / 6); },
      draw: drawMuon,
      readout: st => { const g = st.dil ? gam(st.b) : 1, d = st.b * C * g * TAU0; return `$\\gamma$ ＝ ${A.num(gam(st.b), 1)}${GAP}平均の寿命 ${A.num(g * TAU0, 1)} μs${GAP}平均の距離 ${dist(d)}${GAP}地上に届いた：<b>${st.reach} 個</b>／200（平均の見こみ ${expct(200 * Math.exp(-H0 / d))} 個）`; }
    }
  ]
});

function initMu(st) {
  const r = A.rng(33), g = st.dil ? gam(st.b) : 1;
  st.mu = []; for (let i = 0; i < NMU; i++) st.mu.push({ x: r(), life: -Math.log(1 - r()) * TAU0 * g, d: r() * 0.4 });
  st.tm = 0; st.tEnd = H0 / (st.b * C) + 4; st.reach = 0; st.mk = st.b + '/' + st.dil;
}

function mirror(cv, x, y, w) { cv.rect(x - w / 2, y - 4, w, 8, { fill: 'sub', alpha: 0.6, color: 'ink', width: 1 }); }
function drawClock(cv, st) {
  const g = gam(st.b), Lp = 210, yT = 50, yB = yT + Lp;
  const yAt = ph => { const f = ph % 1, u = f < 0.5 ? 2 * f : 2 - 2 * f; return yB - 6 - (Lp - 12) * u; };
  // 左：止まった時計
  mirror(cv, 120, yT, 60); mirror(cv, 120, yB, 60);
  cv.line([[120, yT + 4], [120, yB - 4]], { color: 'e', width: 1, style: 'dot' });
  cv.dot(120, yAt(st.t), { color: 'e', r: 7 });
  cv.text('止まった時計', 120, yB + 26, { align: 'center', size: 15, bold: true });
  cv.text('1刻み Δt₀ ＝ 2L/c', 120, yB + 46, { align: 'center', size: 14, color: 'sub' });
  cv.line([[70, yT], [70, yB]], { color: 'sub', width: 1 }); cv.text('L', 62, (yT + yB) / 2, { align: 'right', size: 15, italic: true, math: true });
  // 右：動く時計（地面から見る）。1刻みの間に v·γ·Δt₀ だけ進む
  const X0 = 250, X1 = 860, Wd = X1 - X0, perTick = st.b * g * 2 * Lp;   // 1刻み（動く時計の）で進む px（光の速さ：2L で1刻み）
  const xs = tt => X0 + 30 + ((st.b * 2 * Lp * tt) % (Wd - 60));
  const tick = st.t / g;
  // 光の道（いまの刻みとひとつ前）
  const span = (Wd - 60) / (st.b * 2 * Lp || 1e-9), wrap0 = st.b > 0 ? Math.floor(st.t / span) * span : 0;
  const t0 = Math.max(0, (Math.floor(tick) - 1) * g, wrap0), pts = [];
  let px = null;
  for (let k = 0; k <= 160; k++) { const tt = t0 + (st.t - t0) * k / 160, x = xs(tt), y = yAt(tt / g); if (px !== null && x < px) { cv.line(pts.splice(0), { color: 'e', width: 2, style: 'dot' }); } pts.push([x, y]); px = x; }
  cv.line(pts, { color: 'e', width: 2, style: 'dot' });
  const xm = xs(st.t);
  mirror(cv, xm, yT, 60); mirror(cv, xm, yB, 60);
  cv.dot(xm, yAt(tick), { color: 'e', r: 7 });
  cv.arrow(xm + 40, (yT + yB) / 2, xm + 80, (yT + yB) / 2, { color: 'ink', width: 2 });
  cv.text('v', xm + 86, (yT + yB) / 2, { size: 16, italic: true, math: true });
  cv.text('動く時計（地面から見る）', (X0 + X1) / 2, yB + 26, { align: 'center', size: 15, bold: true });
  cv.text('光はななめに進む：1刻み Δt ＝ γΔt₀', (X0 + X1) / 2, yB + 46, { align: 'center', size: 14, color: 'sub' });
  void perTick;
  // 下：地面の時間の目もりと、2つの時計の刻み
  const tl = cv.view({ x0: 0, x1: 8, y0: 0, y1: 1, box: [140, 335, 710, 70] });
  tl.line([[0, 0.5], [8, 0.5]], { color: 'sub', width: 1 });
  for (let k = 0; k <= 8; k++) tl.line([[k, 0.42], [k, 0.58]], { color: 'sub', width: 1 });
  const T = st.t % 8, base = st.t - T;
  for (let k = Math.ceil(base); k <= st.t; k++) tl.dot(k - base, 0.85, { color: 'a', shape: 'square', r: 5 });
  for (let k = Math.ceil(base / g); k * g <= st.t; k++) tl.dot(k * g - base, 0.15, { color: 'b', shape: 'diamond', r: 6 });
  tl.line([[T, 0], [T, 1]], { color: 'ink', width: 1.5 });
  cv.text('止まった時計', 128, tl.Y(0.85), { align: 'right', size: 14, color: 'a' });
  cv.text('動く時計', 128, tl.Y(0.15), { align: 'right', size: 14, color: 'b' });
  cv.text('地面の時間（Δt₀ ごと）', 850, 418, { align: 'right', size: 14, color: 'sub' });
}

function drawGamma(cv, st) {
  const v = cv.view({ x0: 0, x1: 1.08, y0: 0, y1: 11, box: [70, 30, 760, 350] });
  v.axes({ xt: [0.5, 0.87, 1], yt: [1, 2, 4, 6, 8, 10], xl: 'β', yl: 'γ', xfmt: x => A.num(x, x === 1 ? 0 : 2) });
  v.line([[1, 0], [1, 11]], { color: 'sub', style: 'dash', width: 1 });
  v.plot(b => gam(b), { x0: 0, x1: 0.9958, color: 'a', width: 3, n: 600 });
  v.plot(b => 1 + b * b / 2, { x0: 0, x1: 1, color: 'b', style: 'dash', width: 2 });
  for (const [b, g] of [[0.5, 1.155], [0.866, 2], [0.995, 10.01]]) { v.line([[b, 0], [b, g], [0, g]], { color: 'sub', width: 1, style: 'dot' }); v.dot(b, g, { color: 'a', r: 4 }); }
  v.dot(st.b, gam(st.b), { color: 'c', shape: 'diamond', r: 8 });
  v.text('v ＝ c では無限大', 1.0, 10.6, { align: 'right', size: 14, color: 'sub' });
}

function drawMuon(cv, st) {
  ensureMu(st);
  const v = cv.view({ x0: 0, x1: 1, y0: -0.6, y1: 16, box: [90, 20, 470, 390] });
  v.line([[0, 0], [1, 0]], { color: 'ink', width: 3 });
  v.text('地上', 0.5, -0.35, { align: 'center', size: 15 });
  for (let h = 0; h <= 15; h += 5) { cv.line([[80, v.Y(h)], [88, v.Y(h)]], { color: 'sub', width: 1 }); cv.text(h + ' km', 76, v.Y(h), { align: 'right', size: 14, color: 'sub' }); }
  cv.line([[84, v.Y(0)], [84, v.Y(15)]], { color: 'sub', width: 1 });
  const g = cv.g; let reach = 0;
  for (const m of st.mu) {
    const tt = st.tm - m.d, hNow = H0 - st.b * C * Math.max(0, tt);
    if (tt < 0) continue;
    const hDie = H0 - st.b * C * m.life;
    if (m.life < tt && hDie > 0) { v.dot(0.05 + 0.9 * m.x, hDie, { color: 'sub', shape: 'cross', r: 3 }); continue; }
    if (hNow <= 0) { reach++; v.dot(0.05 + 0.9 * m.x, 0.25, { color: 'c', shape: 'square', r: 4 }); continue; }
    v.dot(0.05 + 0.9 * m.x, hNow, { color: 'a', r: 4 });
  }
  st.reach = reach; void g;
  // 右：説明の数
  const gm = st.dil ? gam(st.b) : 1, d = st.b * C * gm * TAU0;
  const x = 610, y0 = 250;
  cv.text(st.dil ? '時間のおくれを考える' : '時間のおくれを考えない', x, y0, { size: 16, bold: true });
  cv.text('平均の寿命：' + A.num(gm * TAU0, 1) + ' μs', x, y0 + 30, { size: 15 });
  cv.text('平均の距離：' + dist(d), x, y0 + 54, { size: 15 });
  // 平均の距離を高さの目もりで示す
  cv.line([[585, v.Y(H0)], [585, v.Y(Math.max(0, H0 - d))]], { color: 'b', width: 4 });
  cv.text('平均の距離（15 km から下へ）', 594, v.Y(Math.max(0, H0 - d)) + (d > 13 ? -14 : 14), { size: 14, color: 'b' });
  cv.text('地上に届いた：' + reach + ' 個', x, y0 + 94, { size: 16, bold: true, color: 'c' });
  cv.text('（200 個のうち）', x, y0 + 118, { size: 14, color: 'sub' });
}
