// @id p1-07
// @title ぶつかる台車と弾むボール：反発係数
// @vol 物理1
// @from 物理 力-3 ④⑤（p1-03 の図「ぶつかっているあいだの2台の速度」・反発係数・弾み続けるボールの表）
'use strict';
// ぶつかっている一瞬を、2台のあいだの小さなばねで考える（本のモデル）。
// 縮むときのばね定数 k、もどるときは k/e²（へこみの一部が残る）。こうすると、はなれる速さ÷近づく速さ＝e になる。
// 運動方程式は A.rk4 で、細かい刻み（0.0002 s）で解く。速度の矢印は破線、ばねの力は実線。
const K0 = 200, V1 = 2, L0 = 0.2, GAP = 0.45;   // ばね定数〔N/m〕・はじめの速さ〔m/s〕・ばねの長さ・はじめのすきま〔m〕
A.item({
  id: 'p1-07', title: 'ぶつかる台車と弾むボール：反発係数',
  from: '物理 第1巻『力学』 力-3 ④ の図（ばねで考えた衝突）・反発係数、⑤ 弾み続けるボールの表と図から（熱-14 ②、数学の等比級数でも使う）',
  W: 880, H: 440,
  state: { e: 1, mr: 1, eb: 0.8 },
  scenes: [
    {
      key: 'bane', label: '① ぶつかっているあいだ',
      lead: '速さ 2 m/s の台車が、止まっている台車にぶつかります。ぶつかっているあいだの2台の速度を、グラフにかいていきます。',
      note: '縮む段では、ぶつかった台車は遅くなり、ぶつけられた台車は速くなります。**2本の線が交わる所（速度がそろう瞬間）**で、へこみがいちばん大きくなります。そのあと、へこみがもどろうとして2台を引きはなします。運動量の和はいつも同じですが、$e<1$ では運動エネルギーの一部が失われます：$\\Delta K=\\frac{1}{2}\\,\\frac{m_1m_2}{m_1+m_2}(1-e^2)(v_1-v_2)^2$。',
      miss: '「運動量が保存すれば、運動エネルギーも保存する」はまちがい。運動エネルギーが保存するのは $e=1$ のときだけで、合体（$e=0$）でいちばん多く失われます。',
      legend: [['ぶつかった台車 $v_1$', { color: 'a' }], ['ぶつけられた台車 $v_2$', { color: 'b', style: 'dash' }], ['重心の速度 $v_G$', { color: 'sub', style: 'dot' }], ['速度の矢印（破線）', { color: 'a', style: 'dash' }], ['ばねの力（実線）', { color: 'd' }]],
      controls: [{ range: 'e', label: '反発係数 $e$', min: 0, max: 1, step: 0.05, d: 2, on: reset }, { range: 'mr', label: '質量の比 $m_2/m_1$', min: 0.25, max: 4, step: 0.25, d: 2, on: reset }],
      init: reset,
      step(st, dt) { return simStep(st, dt * 0.12); },
      draw: drawBane,
      readout: st => { const m1 = 1, m2 = st.mr, K = 0.5 * m1 * st.y[2] ** 2 + 0.5 * m2 * st.y[3] ** 2, K0_ = 0.5 * m1 * V1 * V1; return `$v_1$ ＝ ${A.num(st.y[2], 2)}　$v_2$ ＝ ${A.num(st.y[3], 2)} m/s　　運動量の和 ${A.num(m1 * st.y[2] + m2 * st.y[3], 2)}（いつも 2.00）　　運動エネルギー ${A.num(K, 2)} J（はじめ ${A.num(K0_, 2)} J）`; }
    },
    {
      key: 'hazumu', label: '② 弾み続けるボール',
      lead: '高さ 1.0 m から落としたボールが、床で弾み続けます。弾む高さと、止まるまでの時間を見ましょう。',
      note: '床ではね返る速さは $e$ 倍なので、弾む高さは $e^2$ 倍（$e=0.8$ なら 0.64 倍）、空中の時間は $e$ 倍になります。弾む回数はかぎりなく多いのに、全部の時間は $T=t_0\\dfrac{1+e}{1-e}$ で有限です（$e=0.8$ で約 4.07 s）。$1+e+e^2+\\cdots=\\dfrac{1}{1-e}$（無限等比級数）。',
      legend: [['高さのグラフ', { color: 'a' }], ['止まる時刻 $T$', { color: 'b', style: 'dash' }], ['速度の矢印（破線）', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'eb', label: '反発係数 $e$', min: 0.3, max: 0.9, step: 0.05, d: 2, on: st => { st.t = 0; } }],
      init(st) { st.t = 0; },
      step(st, dt) { st.t += dt * 0.5; const T = t0() * (1 + st.eb) / (1 - st.eb); if (st.t >= T + 0.3) { st.t = T + 0.3; return false; } },
      draw: drawBound,
      readout: st => { const b = bounce(st.eb, st.t); return `${b.n} 回はね返った　　いまの高さ ${A.num(b.y, 3)} m　　この弾みのいちばん高い所 ${A.num(Math.pow(st.eb, 2 * (b.n)), 3)} m　　止まる時刻 $T$ ＝ 0.452 × ${A.num(1 + st.eb, 2)} ÷ ${A.num(1 - st.eb, 2)} ＝ <b>${A.num(t0() * (1 + st.eb) / (1 - st.eb), 2)} s</b>`; }
    }
  ]
});

function reset(st) {
  st.y = [0, GAP + L0, V1, 0];   // 台車1の位置・台車2の位置・速度2つ
  st.t = 0; st.ph = 0; st.dmax = 0; st.hist = [[0, V1, 0]]; st.done = false; st.tmax = null;
}
function force(st, y) {
  // ばねの力（押し合う向きを正）。縮む段 ph=0、もどる段 ph=1
  const d = L0 - (y[1] - y[0]);
  if (d <= 0) return 0;
  if (st.ph === 0) return K0 * d;
  const e = st.e; if (e < 0.02) return 0;
  const d0 = st.dmax * (1 - e * e); return Math.max(0, K0 / (e * e) * (d - d0));
}
function simStep(st, dt) {
  if (st.done) return false;
  const m1 = 1, m2 = st.mr, h = 0.0002;
  for (let k = 0; k < Math.round(dt / h); k++) {
    const fn = (t, y) => { const F = force(st, y); return [y[2], y[3], -F / m1, F / m2]; };
    st.y = A.rk4(fn, st.t, st.y, h); st.t += h;
    const d = L0 - (st.y[1] - st.y[0]);
    if (st.ph === 0 && d > 0) { st.dmax = Math.max(st.dmax, d); if (st.y[2] - st.y[3] <= 0) { st.ph = 1; st.tmax = st.t; } }
    if (st.e < 0.02 && st.ph === 1) { const vg = (m1 * st.y[2] + m2 * st.y[3]) / (m1 + m2); st.y[2] = st.y[3] = vg; }
    if (k % 25 === 0) st.hist.push([st.t, st.y[2], st.y[3]]);
  }
  if (st.t > 0.62 || st.y[1] > 3.2) { st.done = true; return false; }
}
function cart(cv, x, y, w, col, lab) {
  cv.rect(x - w / 2, y - 34, w, 34, { fill: col, alpha: 0.3, color: col, width: 2 });
  cv.circle(x - w / 4, y + 6, 6, { fill: 'sub', alpha: 1, color: 'ink', width: 1 }); cv.circle(x + w / 4, y + 6, 6, { fill: 'sub', alpha: 1, color: 'ink', width: 1 });
  cv.text(lab, x, y - 17, { size: 15, bold: true, align: 'center', color: col });
}
function drawBane(cv, st) {
  const m1 = 1, m2 = st.mr, px = 250, X = x => 110 + x * px, yT = 140;
  cv.line([[20, yT + 12], [860, yT + 12]], { color: 'ink', width: 2 });
  const w1 = 70, w2 = 70 * Math.sqrt(m2), x1 = X(st.y[0]), x2 = X(st.y[1]);
  const xa = x1, xb = x2;   // 台車1の前のはし・台車2の後ろのはし
  cart(cv, x1 - w1 / 2, yT, w1, 'a', 'm₁'); cart(cv, x2 + w2 / 2, yT, w2, 'b', 'm₂');
  // ばね（台車1の前につける）
  const sl = Math.max(4, xb - xa), n = 8, pts = [];
  const nat = L0 * px, len = Math.min(nat, sl);
  for (let i = 0; i <= n; i++) pts.push([xa + len * i / n, yT - 17 + (i % 2 ? -7 : 7) * (i === 0 || i === n ? 0 : 1)]);
  cv.line(pts, { color: 'sub', width: 2 });
  const F = force(st, st.y);
  if (F > 0.5) { cv.arrow(xb, yT - 46, xb + F * 2.5, yT - 46, { color: 'd', width: 3.5 }); cv.arrow(xa, yT - 46, xa - F * 2.5, yT - 46, { color: 'd', width: 3.5 }); cv.text('ばねの力', (xa + xb) / 2, yT - 60, { size: 14, color: 'd', align: 'center' }); }
  if (Math.abs(st.y[2]) > 0.02) cv.arrow(x1 - w1 / 2, yT + 32, x1 - w1 / 2 + st.y[2] * 40, yT + 32, { color: 'a', style: 'dash', width: 3 });
  if (Math.abs(st.y[3]) > 0.02) cv.arrow(x2 + w2 / 2, yT + 32, x2 + w2 / 2 + st.y[3] * 40, yT + 32, { color: 'b', style: 'dash', width: 3 });
  // 速度のグラフ（ぶつかりはじめを 0 にして）
  const tc = GAP / V1, vg = m1 * V1 / (m1 + m2);
  const g = cv.view({ x0: -0.08, x1: 0.42, y0: -1.2, y1: 2.6, box: [70, 200, 560, 225] });
  g.axes({ xt: [0, 0.1, 0.2, 0.3, 0.4], yt: [-1, 1, 2], xl: 't〔s〕', yl: '速度〔m/s〕（t はぶつかりはじめから）', zero: true });
  g.plot(() => vg, { color: 'sub', style: 'dot', width: 1.5 });
  const H = st.hist.map(([t, a, b]) => [t - tc, a, b]);
  g.clip(() => { g.line(H.map(p => [p[0], p[1]]), { color: 'a', width: 3 }); g.line(H.map(p => [p[0], p[2]]), { color: 'b', style: 'dash', width: 3 }); });
  if (st.tmax != null) { const tm = st.tmax - tc; g.dot(tm, vg, { color: 'ink', r: 6, shape: 'diamond' }); g.text('速度がそろう＝へこみ最大', tm + 0.01, vg + 0.35, { size: 14, bg: true }); }
  g.text('vG', 0.41, vg + 0.2, { size: 14, color: 'sub', align: 'right', italic: true, math: true });
  // エネルギーの棒
  const K = 0.5 * m1 * st.y[2] ** 2 + 0.5 * m2 * st.y[3] ** 2, d = Math.max(0, L0 - (st.y[1] - st.y[0])), Kg = 0.5 * (m1 + m2) * vg * vg;
  const Us = st.ph === 0 ? 0.5 * K0 * d * d : (st.e > 0.02 ? 0.5 * K0 / (st.e * st.e) * Math.max(0, d - st.dmax * (1 - st.e * st.e)) ** 2 : 0);
  const bx = 690, by = 410, s = 75;
  cv.text('エネルギー〔J〕', bx + 70, 205, { size: 14, align: 'center', bold: true });
  const bars = [['運動', K, 'a'], ['ばね', Us, 'd'], ['失った', Math.max(0, 2 - K - Us), 'sub']];
  bars.forEach(([n, v, c], i) => { cv.rect(bx + i * 50, by - v * s, 36, v * s, { fill: c, alpha: 0.55, color: c, width: 1 }); cv.text(n, bx + i * 50 + 18, by + 12, { size: 14, align: 'center' }); cv.text(A.num(v, 2), bx + i * 50 + 18, by - v * s - 10, { size: 14, align: 'center' }); });
  cv.line([[bx - 6, by - 2 * s], [bx + 146, by - 2 * s]], { color: 'sub', style: 'dot', width: 1 }); cv.text('はじめ 2.00', bx + 146, by - 2 * s - 10, { size: 13, color: 'sub', align: 'right' });
  void Kg;
}

function t0() { return Math.sqrt(2 * 1.0 / 9.8); }
function bounce(e, t) {
  // 高さ 1.0 m から落としたボール。n 回めのはね返りのあとの位置
  let T = t0(); if (t < T) return { n: 0, y: 1 - 4.9 * t * t, v: -9.8 * t };
  let n = 0, start = T, v0 = 9.8 * T;
  while (n < 200) { n++; const u = v0 * Math.pow(e, n), dur = 2 * u / 9.8; if (t < start + dur || dur < 1e-4) { const s = t - start; return dur < 1e-4 ? { n, y: 0, v: 0 } : { n, y: u * s - 4.9 * s * s, v: u - 9.8 * s }; } start += dur; }
  return { n, y: 0, v: 0 };
}
function drawBound(cv, st) {
  const e = st.eb, b = bounce(e, st.t), T = t0() * (1 + e) / (1 - e);
  const L = cv.view({ x0: -1, x1: 1, y0: -0.1, y1: 1.15, box: [10, 20, 140, 380] });
  L.line([[-0.9, 0], [0.9, 0]], { color: 'ink', width: 3 });
  for (let k = 0; k <= 4; k++) { const hgt = Math.pow(e, 2 * k); L.line([[-0.9, hgt], [-0.6, hgt]], { color: 'sub', width: 1 }); L.text(A.num(hgt, 2) + ' m', -0.55, hgt, { size: 14, color: 'sub' }); }
  L.dot(0.45, b.y + 0.035, { color: 'a', r: 10 });
  if (Math.abs(b.v) > 0.2) L.arrow(0.75, b.y + 0.035, 0.75, b.y + 0.035 + b.v * 0.05, { color: 'a', style: 'dash', width: 3 });
  const g = cv.view({ x0: 0, x1: Math.max(4.4, T * 1.08), y0: 0, y1: 1.15, box: [210, 20, 640, 330] });
  g.axes({ xt: A.range(1, Math.floor(Math.max(4.4, T * 1.08)), 1), yt: [0.5, 1], xl: '時刻〔s〕', yl: '高さ〔m〕' });
  g.plot(t => bounce(e, t).y, { x0: 0, x1: Math.min(st.t, T), color: 'a', width: 2.5, n: 1200 });
  g.line([[T, 0], [T, 0.75]], { color: 'b', style: 'dash', width: 2 }); g.text('T ≈ ' + A.num(T, 2) + ' s', T, 0.8, { size: 15, color: 'b', align: 'center' });
  // 着く時刻の表（はじめの7回）
  let s = t0(), row = [A.num(s, 3)];
  for (let n = 1; n <= 6; n++) { s += 2 * t0() * Math.pow(e, n); row.push(A.num(s, 3)); }
  cv.text('床に着く時刻〔s〕：' + row.join('、') + '、…', 220, 395, { size: 14, color: 'sub' });
  cv.text('1 + e + e² + … ＝ 1/(1 − e) ＝ ' + A.num(1 / (1 - e), 2), 220, 420, { size: 14, color: 'sub' });
}
