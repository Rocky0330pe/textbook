// @id p2-29
// @title トンネル効果：波束が壁に当たる
// @vol 物理5
// @from 物理 原-6 ①②③⑦（p5-06 しみこむ波・段差の反射・e^{−2κa}・波束が壁に当たる計算）
'use strict';
const GAP = '<span style="display:inline-block;width:1em"></span>';   // 読み取りの区切り（行末ではみ出さない）
// 本と同じ数と計算：ħ＝0.6582 eV·fs、ħ²/(2m)＝0.0381 eV·nm²、κ≈5.12√(U₀−E) nm⁻¹。
// 波束（はじめ x＝−12 nm、σ＝1.5 nm）を、時間をふくむシュレディンガー方程式のクランク・ニコルソン法（本の fig_p5_06.py と同じ方法）で進める。
// 本の場面：1.5 eV の電子、高さ 2 eV・厚さ 0.3 nm の壁 → 30 fs 後に約30 % がぬける（平面波の正確な式 0.303）。
// 検算：checks/アニメ/p2-29/cn_check.js（刻み 0.02 nm・0.05 fs で 0.304）。
const HBAR = 0.658211957, HB2M = 0.0380998, NG = 4000, XG = 40, DT = 0.05, SIG = 1.5, X00 = -12;
const kap = d => 5.12 * Math.sqrt(Math.max(0, d));          // nm⁻¹（本の κ≈5.12√(U₀−E)）
const exactT = (E, U0, a) => { if (E >= U0) { const k1 = Math.sqrt(E / HB2M), k2 = Math.sqrt((E - U0) / HB2M); if (k2 < 1e-9) return 1 / (1 + U0 * a * a / (4 * HB2M)); return 1 / (1 + U0 * U0 * Math.sin(k2 * a) ** 2 / (4 * E * (E - U0))); } const q = kap(U0 - E); return 1 / (1 + U0 * U0 * Math.sinh(q * a) ** 2 / (4 * E * (U0 - E))); };
const Rstep = (E, U) => { if (E <= U) return 1; const k1 = Math.sqrt(E), k2 = Math.sqrt(E - U); return ((k1 - k2) / (k1 + k2)) ** 2; };

// ---------- クランク・ニコルソン法 ----------
function makeSim(E0, Ufn) {
  const N = NG, dx = 2 * XG / (N - 1), x = new Float64Array(N), U = new Float64Array(N);
  for (let j = 0; j < N; j++) { x[j] = -XG + j * dx; U[j] = Ufn(x[j]); }
  const k0 = Math.sqrt(E0 / HB2M), re = new Float64Array(N), im = new Float64Array(N);
  let s = 0;
  for (let j = 0; j < N; j++) { const g = Math.exp(-((x[j] - X00) ** 2) / (4 * SIG * SIG)); re[j] = g * Math.cos(k0 * x[j]); im[j] = g * Math.sin(k0 * x[j]); s += (re[j] ** 2 + im[j] ** 2) * dx; }
  s = Math.sqrt(s); for (let j = 0; j < N; j++) { re[j] /= s; im[j] /= s; }
  const A = HB2M / dx / dx, r = DT / (2 * HBAR), offI = -r * A;
  const cR = new Float64Array(N), cI = new Float64Array(N), dR = new Float64Array(N), dI = new Float64Array(N);
  for (let j = 0; j < N; j++) {
    let mr = 1, mi = r * (2 * A + U[j]);
    if (j > 0) { mr -= -offI * cI[j - 1]; mi -= offI * cR[j - 1]; }
    const den = mr * mr + mi * mi; dR[j] = mr / den; dI[j] = -mi / den;
    cR[j] = -offI * dI[j]; cI[j] = offI * dR[j];
  }
  const yR = new Float64Array(N), yI = new Float64Array(N);
  return {
    x, U, re, im, dx, t: 0, v: Math.sqrt(2 * E0 / 0.51099895e6) * 299.792458,
    step() {
      for (let j = 0; j < N; j++) {
        const d = r * (2 * A + U[j]);
        let br = re[j] + d * im[j], bi = im[j] - d * re[j];
        const sr = (j > 0 ? re[j - 1] : 0) + (j < N - 1 ? re[j + 1] : 0), si = (j > 0 ? im[j - 1] : 0) + (j < N - 1 ? im[j + 1] : 0);
        br -= r * A * si; bi += r * A * sr;
        if (j > 0) { br += offI * yI[j - 1]; bi -= offI * yR[j - 1]; }
        yR[j] = br * dR[j] - bi * dI[j]; yI[j] = br * dI[j] + bi * dR[j];
      }
      re[N - 1] = yR[N - 1]; im[N - 1] = yI[N - 1];
      for (let j = N - 2; j >= 0; j--) { re[j] = yR[j] - (cR[j] * re[j + 1] - cI[j] * im[j + 1]); im[j] = yI[j] - (cR[j] * im[j + 1] + cI[j] * re[j + 1]); }
      this.t += DT;
    },
    prob(j) { return re[j] * re[j] + im[j] * im[j]; },
    part(f) { let p = 0; for (let j = 0; j < N; j++) if (f(x[j])) p += this.prob(j) * dx; return p; }
  };
}
const simKey = st => [st.scene, st.E, st.U0, st.a].join();
function ensure(st) {
  if (st.sim && st.sk === simKey(st)) return;
  st.sk = simKey(st); st.marks = []; st.L = 0; st.R = 0;
  st.sim = st.scene === 'step' ? makeSim(st.E, x => x >= 0 ? st.U0 : 0) : makeSim(st.E, x => x >= 0 && x <= st.a ? st.U0 : 0);
  st.tEnd = Math.min(30, 24 / st.sim.v + 10);
}
function adv(st, dt) {
  ensure(st);
  if (st.sim.t >= st.tEnd - 1e-9) return false;
  st.acc = (st.acc || 0) + dt * 5 / DT;     // 1秒に 5 fs
  while (st.acc >= 1 && st.sim.t < st.tEnd - 1e-9) { st.acc -= 1; st.sim.step(); }
}
function findOne(st) {   // いまの |ψ|² にしたがって、電子を1回さがす
  ensure(st); const s = st.sim; let u = st.rng() / s.dx, j = 0;
  for (; j < NG - 1; j++) { u -= s.prob(j); if (u <= 0) break; }
  const x = s.x[j], wall = st.scene === 'step' ? 0 : st.a;
  st.marks.push(x); if (st.marks.length > 40) st.marks.shift();
  if (x > wall) st.R++; else st.L++;
}
const seek = { button: '電子をさがす（10回）', act(st) { for (let k = 0; k < 10; k++) findOne(st); } };

A.item({
  id: 'p2-29', title: 'トンネル効果：波束が壁に当たる',
  from: '物理 第5巻 原-6 ①②③⑦ の図から（しみこむ波・段差での反射・すりぬける割合・波束が壁に当たる計算）',
  W: 880, H: 440,
  state: { E: 1.5, U0: 2, a: 0.3, t: 0, scene: 'wall' },
  scenes: [
    {
      key: 'hasoku', label: '① 波束が壁に当たる',
      lead: '電子の波束（はじめ $x$＝−12 nm）が、高さ 2 eV の壁に当たります。▶ で時間を進めましょう。',
      note: '波束は、はね返る部分と通りぬける部分に分かれます。1.5 eV の電子と、厚さ 0.3 nm の壁では、30 fs 後に約30 % が壁の向こうへ、約70 % がはね返ります（正確な式の 𝒯 ≈ 0.30 と合う）。電子1個が「30 % だけ」通るのではありません。「電子をさがす」と、10回に約3回は壁の右で、まるごと1個見つかります。',
      legend: [['いまの $|\\psi|^2$', { color: 'a' }], ['はじめ（$t$＝0）', { color: 'sub', style: 'dash' }], ['壁（灰色）', { color: 'sub', shape: 'square', noline: true }], ['電子を見つけた所', { color: 'b', shape: 'diamond', noline: true }]],
      state: { scene: 'wall', E: 1.5, U0: 2, a: 0.3 },
      controls: [{ range: 'a', label: '壁の厚さ $a$〔nm〕', min: 0.1, max: 0.8, step: 0.05, d: 2 }, { range: 'E', label: '電子のエネルギー $E$〔eV〕', min: 0.5, max: 3, step: 0.1, d: 1 }, seek],
      init(st) { st.rng = A.rng(29); st.sim = null; ensure(st); },
      step: adv,
      draw: drawPacket,
      readout: st => readPacket(st, '壁の右', '壁の左')
    },
    {
      key: 'shimiru', label: '② 壁の中で弱まる',
      lead: '壁の中で、電子の波はゆれずに小さくなります。壁の厚さを2倍にすると、すりぬける割合はどうなるでしょう。',
      note: '壁の中で波は $e^{-\\kappa x}$ で弱まり、すりぬける割合は、だいたい 𝒯 ≈ $e^{-2\\kappa a}$ です（厚い壁では、正確な値はその $16E(U_0-E)/U_0^{2}$ 倍で、いつも4倍以下）。壁の右の波の**波長は左と同じ**です。小さくなるのは、そこで見つかる確率（波の大きさ）で、エネルギーではありません。',
      miss: '「壁の厚さ2倍で、割合は半分」はまちがいです。$e^{-2\\kappa a}$ の肩が2倍になるので、割合は**2乗**になります（例：$3.6\\times10^{-5}$ が $1.3\\times10^{-9}$）。また、「すりぬけるとエネルギーが減る」もまちがいで、ぬけた電子のエネルギーは来たときと同じ $E$ です。',
      legend: [['電子の波（ある時刻の形）', { color: 'a' }], ['波の大きさ', { color: 'a', style: 'dot' }], ['正確な式', { color: 'c' }], ['$e^{-2\\kappa a}$', { color: 'b', style: 'dash' }]],
      state: { scene: 'still', E: 1, U0: 2, a: 0.5 },
      controls: [{ range: 'a', label: '壁の厚さ $a$〔nm〕', min: 0.1, max: 1.2, step: 0.05, d: 2 }, { range: 'E', label: '電子のエネルギー $E$〔eV〕', min: 0.2, max: 1.9, step: 0.05, d: 2 }],
      step(st, dt) { st.t += dt; },
      draw: drawStill,
      readout: st => { const q = kap(st.U0 - st.E); return `$\\kappa$ ＝ 5.12×√(${A.num(st.U0 - st.E, 2)}) ＝ ${A.num(q, 2)} nm⁻¹${GAP}$e^{-2\\kappa a}$ ＝ ${sci(Math.exp(-2 * q * st.a))}${GAP}正確な式 ＝ ${sci(exactT(st.E, st.U0, st.a))}${GAP}厚さ2倍なら $e^{-2\\kappa a}$ ＝ ${sci(Math.exp(-4 * q * st.a))}`; }
    },
    {
      key: 'dansa', label: '③ 段差でもはね返る',
      lead: 'こんどは、高さ 1 eV の段に、段より大きなエネルギーの電子を当てます。全部が段を上がるでしょうか。',
      note: '段の左と右で波数が $k_1$ から $k_2$ に変わる所では、ひもの波（波-7）と同じく、一部がはね返ります。反射率は ℛ ＝ $\\left(\\dfrac{k_1-k_2}{k_1+k_2}\\right)^2$ で、$E$ が段に近いほどよくはね返り、$E$ が大きいとほとんど通りぬけます。',
      miss: '「$E>U$ なら、ふつうの粒と同じく全部が段を上がる」はまちがいです。波は段で一部がはね返ります（$E=2U$ で約3 %）。',
      legend: [['いまの $|\\psi|^2$', { color: 'a' }], ['はじめ（$t$＝0）', { color: 'sub', style: 'dash' }], ['段（灰色）', { color: 'sub', shape: 'square', noline: true }], ['反射率 ℛ の式・いまの $E/U$', { color: 'c' }]],
      state: { scene: 'step', E: 2, U0: 1, a: 0 },
      controls: [{ range: 'E', label: '電子のエネルギー $E$〔eV〕（段は 1 eV）', min: 1.2, max: 5, step: 0.1, d: 1 }, seek],
      init(st) { st.rng = A.rng(7); st.sim = null; ensure(st); },
      step: adv,
      draw: drawStep,
      readout: st => readPacket(st, '段の右', '段の左') + `${GAP}式の反射率 ℛ（$E/U$＝${A.num(st.E / st.U0, 1)}）＝ <b>${A.num(100 * Rstep(st.E, st.U0), 1)} %</b>`
    }
  ]
});

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sci(v) { if (v >= 0.01) return A.num(v, v >= 0.1 ? 2 : 3); const e = Math.floor(Math.log10(v)), m = v / 10 ** e; return A.num(m, 1) + '×10' + String(e).split('').map(c => SUP[c]).join(''); }

function readPacket(st, rr, ll) {
  ensure(st); const s = st.sim, w = st.scene === 'step' ? 0 : st.a;
  const pr = s.part(x => x > w), pl = s.part(x => x < 0);
  let t = `$t$ ＝ ${A.num(s.t, 1)} fs${GAP}${rr}：<b>${A.num(100 * pr, 0)} %</b>${GAP}${ll}：${A.num(100 * pl, 0)} %`;
  if (st.scene !== 'step') t += `${GAP}（平面波の正確な式 𝒯 ＝ ${A.num(exactT(st.E, st.U0, st.a), 2)}）`;
  if (st.L + st.R) t += `${GAP}さがした：右 ${st.R} 回・左 ${st.L} 回`;
  return t;
}

function packetPlot(cv, st, wall) {
  ensure(st); const s = st.sim;
  const v = cv.view({ x0: -22, x1: 15, y0: 0, y1: 0.8, box: [60, 24, 790, 270] });
  v.axes({ xt: [-20, -10, 0, 10], yt: [0.2, 0.4, 0.6, 0.8], xl: 'x（nm）', yl: '|ψ|²（1/nm）', yfmt: q => A.num(q, 1), ay: -22, zero: true });
  const ww = wall ? st.a : 15;
  v.clip(() => v.poly([[0, 0], [ww, 0], [ww, 0.8], [0, 0.8]], { fill: 'sub', alpha: wall ? 0.35 : 0.12 }));
  v.plot(x => Math.exp(-((x - X00) ** 2) / (2 * SIG * SIG)) / (SIG * Math.sqrt(2 * Math.PI)), { color: 'sub', style: 'dash', width: 1.5 });
  const pts = []; for (let j = 0; j < NG; j += 2) { const x = s.x[j]; if (x < -22 || x > 15) continue; pts.push([v.X(x), v.Y(Math.min(0.8, s.prob(j)))]); }
  v.clip(() => cv.line(pts, { color: 'a', width: 2.2 }));
  for (const x of st.marks) if (x > -22 && x < 15) v.dot(x, 0.03, { color: 'b', shape: 'diamond', r: 6 });
  // 下：位置エネルギーと電子のエネルギー
  const e = cv.view({ x0: -22, x1: 15, y0: 0, y1: 5.2, box: [60, 326, 790, 90] });
  const Ux = x => wall ? (x >= 0 && x <= st.a ? st.U0 : 0) : (x >= 0 ? st.U0 : 0);
  e.line([[-22, 0], [15, 0]], { color: 'sub', width: 1 });
  e.poly(wall ? [[0, 0], [st.a, 0], [st.a, st.U0], [0, st.U0]] : [[0, 0], [15, 0], [15, st.U0], [0, st.U0]], { fill: 'sub', alpha: 0.35, color: 'ink', width: 1.5 });
  e.line([[-22, st.E], [15, st.E]], { color: 'b', style: 'dash', width: 2 });
  e.text('電子のエネルギー E ＝ ' + A.num(st.E, 1) + ' eV', -21.5, st.E + 0.9, { size: 14, color: 'b' });
  if (wall) e.text('壁 ' + A.num(st.U0, 0) + ' eV・厚さ ' + A.num(st.a, 2) + ' nm', 0.8, st.E > st.U0 - 0.3 && st.E < st.U0 + 1.6 ? st.U0 * 0.45 : st.U0 + 0.9, { size: 14 });
  else e.text('段 ' + A.num(st.U0, 0) + ' eV', 1, st.U0 / 2, { size: 14 });
  cv.text('位置エネルギー（下の図）', 66, 332, { size: 14, color: 'sub' });
  void Ux;
}
function drawPacket(cv, st) { packetPlot(cv, st, true); }
function drawStep(cv, st) {
  packetPlot(cv, st, false);
  // 右上：反射率の式のグラフ
  const g = cv.view({ x0: 0.8, x1: 6.3, y0: 0, y1: 1.1, box: [640, 40, 190, 120] });
  g.poly([[0.8, 0], [6.3, 0], [6.3, 1.1], [0.8, 1.1]], { fill: 'bg', alpha: 0.9 });
  g.axes({ xt: [1, 2, 4, 6], yt: [0.5, 1], xl: 'E/U', yl: 'R', grid: false });
  g.plot(r => Rstep(r, 1), { x0: 1, x1: 6.2, color: 'c', width: 2.5 });
  g.dot(st.E / st.U0, Rstep(st.E, st.U0), { color: 'c', shape: 'diamond', r: 7 });
}

function drawStill(cv, st) {
  const E = st.E, U0 = st.U0, a = st.a, k = Math.sqrt(E / HB2M), q = kap(U0 - E);
  // 平面波の解（右から逆にたどる）：III：e^{ik(x−a)}、II：C e^{κ(x−a)}＋D e^{−κ(x−a)}、I：F e^{ikx}＋G e^{−ikx}
  const C = [0.5, 0.5 * k / q], D = [0.5, -0.5 * k / q];            // ×e^{ika} は位相だけなので省く
  const ea = Math.exp(-q * a), eb = Math.exp(q * a);
  const p0 = [C[0] * ea + D[0] * eb, C[1] * ea + D[1] * eb], d0 = [q * (C[0] * ea - D[0] * eb), q * (C[1] * ea - D[1] * eb)];
  const di = [d0[1] / k, -d0[0] / k];                                    // ψ'/(ik)
  const F = [(p0[0] + di[0]) / 2, (p0[1] + di[1]) / 2], G = [(p0[0] - di[0]) / 2, (p0[1] - di[1]) / 2];
  const fm = F[0] * F[0] + F[1] * F[1], inv = [F[0] / fm, -F[1] / fm];  // 1/F
  const mul = (u, w) => [u[0] * w[0] - u[1] * w[1], u[0] * w[1] + u[1] * w[0]];
  const w = 1.6 * st.t;                                                  // 時間の位相（見やすい速さ）
  const ph = [Math.cos(w), -Math.sin(w)];
  const psi = x => {
    let z;
    if (x < 0) { const e1 = [Math.cos(k * x), Math.sin(k * x)], e2 = [Math.cos(k * x), -Math.sin(k * x)]; z = mul(inv, [F[0] * e1[0] - F[1] * e1[1] + G[0] * e2[0] - G[1] * e2[1], F[0] * e1[1] + F[1] * e1[0] + G[0] * e2[1] + G[1] * e2[0]]); }
    else if (x <= a) { const u = Math.exp(q * (x - a)), d = Math.exp(-q * (x - a)); z = mul(inv, [C[0] * u + D[0] * d, C[1] * u + D[1] * d]); }
    else z = mul(inv, [Math.cos(k * (x - a)), Math.sin(k * (x - a))]);
    return z;
  };
  const v = cv.view({ x0: -2.2, x1: 2.6, y0: -2.2, y1: 2.4, box: [40, 30, 540, 360] });
  v.poly([[0, -2.2], [a, -2.2], [a, 2.4], [0, 2.4]], { fill: 'sub', alpha: 0.3 });
  v.line([[-2.2, 0], [2.6, 0]], { color: 'grid', width: 1 });
  v.plot(x => mul(psi(x), ph)[0], { color: 'a', width: 2.5, n: 700 });
  v.plot(x => Math.hypot(...psi(x)), { x0: a, x1: 2.6, color: 'a', style: 'dot', width: 1.6 });
  v.plot(x => Math.hypot(...psi(x)), { x0: 0, x1: a, color: 'a', style: 'dot', width: 1.6 });
  v.text('壁 ' + A.num(U0, 0) + ' eV', a / 2, 2.2, { align: 'center', size: 14 });
  v.text('来る波＋はね返る波', -2.1, -1.95, { size: 14, color: 'sub' });
  v.text('ぬけた波（同じ波長）', a + 0.1, -1.95, { size: 14, color: 'sub' });
  cv.line([[v.X(a), v.Y(-2.05)], [v.X(a), v.Y(-2.2)]], { color: 'sub', width: 1 });
  v.text('a', a / 2, -2.05, { align: 'center', size: 15, italic: true, math: true });
  // 右：透過率と厚さ（10倍ごとの目もり）
  const g = cv.view({ x0: 0, x1: 1.25, y0: -10, y1: 0.3, box: [640, 30, 210, 330] });
  g.axes({ xt: [0.25, 0.5, 0.75, 1], yt: [-10, -8, -6, -4, -2, 0], yfmt: y => y === 0 ? '1' : '10' + String(y).split('').map(c => SUP[c]).join(''), xfmt: x => A.num(x, x === 1 ? 0 : 2), xl: 'a（nm）', grid: true, ay: 0, ax: -10 });
  g.plot(x => Math.log10(Math.max(1e-12, exactT(E, U0, x))), { x0: 0.001, x1: 1.25, color: 'c', width: 2.5 });
  g.plot(x => Math.log10(Math.exp(-2 * q * x)), { x0: 0, x1: 1.25, color: 'b', style: 'dash', width: 2 });
  g.dot(a, Math.log10(exactT(E, U0, a)), { color: 'c', r: 6 });
  if (2 * a <= 1.25) { g.dot(2 * a, Math.log10(exactT(E, U0, 2 * a)), { color: 'c', shape: 'square', r: 5 }); g.text('2倍', 2 * a + 0.04, Math.log10(exactT(E, U0, 2 * a)) + 0.5, { size: 14 }); }
  g.text('𝒯（10倍ごと）', 0.06, 0.05, { size: 14 });
  void G;
}
