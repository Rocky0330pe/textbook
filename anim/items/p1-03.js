// @id p1-03
// @title 同じ速さでも加速している：カーブと Δv
// @vol 物理1
// @from 物理 力-1 ⑤（p1-01 の図「速度の矢印の根もとをそろえる」「接する円」）、まちがえやすいところ／力-2 ⑦
'use strict';
// 速度の矢印は破線、速度の変化 Δv は一点鎖線、加速度は点線。札でも分ける。
A.item({
  id: 'p1-03', title: '同じ速さでも加速している：カーブと Δv',
  from: '物理 第1巻『力学』 力-1 ⑤ の図（速度の矢印の根もとをそろえる・接する円）と表から（数学 4-8・5-15、力-2 ⑦・力-7 ⑧ でも使う）',
  W: 880, H: 440,
  state: { ph: 0.35, dt: 1, v: 15, rho: 50, brake: false, s: 0, vv: 10 },
  scenes: [
    {
      key: 'dv', label: '① 根もとをそろえる',
      lead: '半径 50 m のカーブを、速さ 15 m/s のまま回る車。$\\Delta t$ のあいだに速度の矢印がどう変わるか、右に根もとをそろえて並べます。',
      note: '道の上で $\\Delta\\theta$ 回ると、速度の矢印も $\\Delta\\theta$ 回ります。$\\Delta\\vec v$ は**円の中心の向き**で、長さはほぼ $v\\Delta\\theta$。$\\Delta t$ を短くすると $|\\Delta\\vec v|/\\Delta t$ は $v^2/\\rho=15^2/50=4.5$ m/s² に近づきます（表：1 s で 4.483、0.5 s で 4.496、0.1 s で 4.4998）。',
      miss: '「速さが一定なら加速度は0」はまちがい。向きが変わるので、中心の向きに $v^2/r$ の加速度があります。加速度は「速さ」ではなく「速度（向きもこめた量）」の変わる速さです。',
      legend: [['速度 $\\vec v$（時刻 $t$）', { color: 'a', style: 'dash' }], ['速度 $\\vec v\\,\'$（$\\Delta t$ 後）', { color: 'e', style: 'dash' }], ['$\\Delta\\vec v$', { color: 'd', style: 'dashdot' }], ['加速度（中心の向き）', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'dt', label: '時間 $\\Delta t$〔s〕', min: 0.05, max: 2, step: 0.01, d: 2 }],
      step(st, dt) { st.ph += dt * 15 / 50; if (st.ph > Math.PI * 2) st.ph -= Math.PI * 2; },
      draw: drawDv,
      readout: st => { const th = 15 * st.dt / 50, dv = 2 * 15 * Math.sin(th / 2); return `$\\Delta\\theta$ ＝ ${A.num(th, 3)} rad　　$|\\Delta\\vec v|$ ＝ $2v\\sin(\\Delta\\theta/2)$ ＝ ${A.num(dv, 3)} m/s　　$|\\Delta\\vec v|/\\Delta t$ ＝ <b>${A.num(dv / st.dt, 4)} m/s²</b>（$v^2/\\rho$ ＝ 4.5）`; }
    },
    {
      key: 'brake', label: '② 2つの成分',
      lead: '加速度を、速度の向き（接線加速度 $a_t$）と、カーブの内側の向き（法線加速度 $a_n$）に分けます。速さとブレーキを変えてみましょう。',
      note: '$a_t=\\dfrac{dv}{dt}$ は速さを変え、$a_n=\\dfrac{v^2}{\\rho}$ は向きを変えます。速さが2倍なら $a_n$ は4倍（半径 50 m で 10 m/s → 2、20 m/s → 8、30 m/s → 18 m/s²）。半径を2倍にすると半分です。ブレーキをかけると、$a_t$ は速度と反対向きになります。',
      legend: [['速度 $\\vec v$', { color: 'a', style: 'dash' }], ['$a_t$・$a_n$（点線）', { color: 'c', style: 'dot' }], ['加速度 $\\vec a$（合わせたもの）', { color: 'c', style: 'dashdot' }], ['$a_n=v^2/\\rho$ のグラフ', { color: 'b' }]],
      controls: [{ range: 'v', label: '速さ $v$〔m/s〕', min: 0, max: 30, step: 0.5, d: 1 }, { seg: 'rho', label: '曲率半径 $\\rho$', options: [[50, '50 m'], [100, '100 m']] }, { check: 'brake', label: 'ブレーキ', text: 'ブレーキ（$a_t=-2$ m/s²）' }],
      step(st, dt) { if (st.brake) { st.v = Math.max(0, st.v - 2 * dt); if (st.v <= 0) { st.brake = false; } } st.ph += dt * st.v / st.rho; },
      draw: drawBrake,
      readout: st => { const an = st.v * st.v / st.rho, at = st.brake && st.v > 0 ? -2 : 0; return `$v$ ＝ ${A.num(st.v, 1)} m/s　　$a_t$ ＝ ${A.num(at, 1)}　　$a_n$ ＝ ${A.num(st.v, 1)}² ÷ ${st.rho} ＝ <b>${A.num(an, 2)}</b>　　$|\\vec a|$ ＝ ${A.num(Math.hypot(an, at), 2)} m/s²`; }
    },
    {
      key: 'en', label: '③ 接する円',
      lead: '曲がり方が場所で変わる道を、同じ速さ 10 m/s で走ります。その場所で道にぴったり重なる円（接する円）が動いていきます。',
      note: '急なカーブほど接する円は小さく（$\\rho$ が小さく）、法線加速度 $v^2/\\rho$ は大きくなります。まっすぐに近い所では $\\rho$ はかぎりなく大きく、$a_n$ は0に近づきます。曲がる向きが変わると、円は道の反対側にうつります。',
      legend: [['接する円（半径 $\\rho$）', { color: 'd', style: 'dash' }], ['速度 $\\vec v$', { color: 'a', style: 'dash' }], ['法線加速度 $a_n$', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'vv', label: '速さ $v$〔m/s〕', min: 2, max: 20, step: 0.5, d: 1 }],
      init(st) { st.s = 8; },
      step(st, dt) { st.s += st.vv * dt * 0.6; if (st.s > road().len - 8) st.s = 8; },
      draw: drawEn,
      readout: st => { const p = roadAt(st.s); const r = 1 / Math.abs(p.k); return `曲率半径 $\\rho$ ＝ ${r > 999 ? '1000 m より大きい' : A.num(r, 1) + ' m'}　　$a_n=v^2/\\rho$ ＝ <b>${A.num(st.vv * st.vv * Math.abs(p.k), 2)} m/s²</b>`; }
    }
  ]
});

function car(cv, x, y, ang, col) {
  // 上から見た車（向き ang はキャンバスの角）
  const g = cv.g; g.save(); g.translate(x, y); g.rotate(ang);
  cv.rect(-13, -8, 26, 16, { fill: col || 'a', alpha: 0.85, color: 'ink', width: 1.2 });
  cv.rect(3, -6, 7, 12, { fill: 'bg', alpha: 0.9 });
  g.restore();
}

function drawDv(cv, st) {
  const R = 50, v = 15, k = 1.6;   // 1 m/s を 1.6 m の長さで
  const L = cv.view({ x0: -60, x1: 60, y0: -60, y1: 60, box: [10, 10, 420, 420], equal: true });
  L.circle(0, 0, R, { color: 'grid', width: 18 });
  L.circle(0, 0, R, { color: 'sub', width: 1, style: 'dot' });
  L.dot(0, 0, { color: 'ink', r: 4 }); L.text('C', 2, -5, { size: 15, bold: true });
  const th = v * st.dt / R, p1 = st.ph, p2 = st.ph + th;
  const P = [R * Math.cos(p1), R * Math.sin(p1)], Q = [R * Math.cos(p2), R * Math.sin(p2)];
  L.line([[0, 0], P], { color: 'sub', width: 1 }); L.line([[0, 0], Q], { color: 'sub', width: 1 });
  const ang1 = p1 + Math.PI / 2, ang2 = p2 + Math.PI / 2;
  car(cv, L.X(P[0]), L.Y(P[1]), -ang1, 'a'); car(cv, L.X(Q[0]), L.Y(Q[1]), -ang2, 'e');
  L.arrow(P[0], P[1], P[0] + v * k * Math.cos(ang1), P[1] + v * k * Math.sin(ang1), { color: 'a', style: 'dash', width: 3 });
  L.arrow(Q[0], Q[1], Q[0] + v * k * Math.cos(ang2), Q[1] + v * k * Math.sin(ang2), { color: 'e', style: 'dash', width: 3 });
  L.text('P', P[0] * 1.13, P[1] * 1.13, { size: 15, bold: true, align: 'center' });
  L.text("P'", Q[0] * 1.13, Q[1] * 1.13, { size: 15, bold: true, align: 'center' });
  // 角 Δθ
  const arc = []; for (let i = 0; i <= 20; i++) { const a = p1 + th * i / 20; arc.push([14 * Math.cos(a), 14 * Math.sin(a)]); }
  L.line(arc, { color: 'ink', width: 1.5 }); L.text('Δθ', 20 * Math.cos(p1 + th / 2), 20 * Math.sin(p1 + th / 2), { size: 15, align: 'center', bg: true });
  // 加速度（中心の向き、4.5 m/s²）
  const ak = 4;
  L.arrow(P[0], P[1], P[0] - 4.5 * ak * Math.cos(p1), P[1] - 4.5 * ak * Math.sin(p1), { color: 'c', style: 'dot', width: 3.5 });
  // 右：根もとをそろえる
  const Rv = cv.view({ x0: -20, x1: 20, y0: -20, y1: 20, box: [450, 10, 420, 420], equal: true });
  Rv.circle(0, 0, v, { color: 'sub', width: 1, style: 'dot' });
  Rv.dot(0, 0, { color: 'ink', r: 4 });
  const a1 = [v * Math.cos(ang1), v * Math.sin(ang1)], a2 = [v * Math.cos(ang2), v * Math.sin(ang2)];
  Rv.arrow(0, 0, a1[0], a1[1], { color: 'a', style: 'dash', width: 3 });
  Rv.arrow(0, 0, a2[0], a2[1], { color: 'e', style: 'dash', width: 3 });
  Rv.arrow(a1[0], a1[1], a2[0], a2[1], { color: 'd', style: 'dashdot', width: 3.5 });
  const ex = Math.cos(ang1) - Math.cos(ang2), ey = Math.sin(ang1) - Math.sin(ang2), en = Math.hypot(ex, ey) || 1;
  Rv.text('v', a1[0] * 0.6 + 2.2 * ex / en, a1[1] * 0.6 + 2.2 * ey / en, { size: 17, color: 'a', math: true, italic: true, bold: true, align: 'center', bg: true });
  Rv.text("v'", a2[0] * 0.6 - 2.2 * ex / en, a2[1] * 0.6 - 2.2 * ey / en, { size: 17, color: 'e', math: true, italic: true, bold: true, align: 'center', bg: true });
  const mx = (a1[0] + a2[0]) / 2, my = (a1[1] + a2[1]) / 2, mm = Math.hypot(mx, my) || 1;
  Rv.text('Δv', mx * (1 + 3.2 / mm), my * (1 + 3.2 / mm), { size: 17, color: 'd', bold: true, align: 'center', bg: true });
  cv.text('速度の矢印の根もとをそろえる（半径 v = 15 の円）', 660, 425, { size: 14, color: 'sub', align: 'center' });
  // Δv の向き（中心の向き）を、左の図にもうすく
  void mm;
}

function drawBrake(cv, st) {
  const R = st.rho, k = R / 50, ak = R / 5;
  const L = cv.view({ x0: -1.3 * R, x1: 1.3 * R, y0: -1.3 * R, y1: 1.3 * R, box: [10, 10, 420, 420], equal: true });
  L.circle(0, 0, R, { color: 'grid', width: 18 });
  L.dot(0, 0, { color: 'ink', r: 4 }); L.text('C', 0.04 * R, -0.08 * R, { size: 15, bold: true });
  const p = st.ph, P = [R * Math.cos(p), R * Math.sin(p)], ta = p + Math.PI / 2, tx = Math.cos(ta), ty = Math.sin(ta), nx = -Math.cos(p), ny = -Math.sin(p);
  L.line([[0, 0], P], { color: 'sub', width: 1 }); L.text('ρ = ' + R + ' m', P[0] * 0.3 - 0.12 * R * Math.sin(p), P[1] * 0.3 + 0.12 * R * Math.cos(p), { size: 15, math: true, italic: true });
  car(cv, L.X(P[0]), L.Y(P[1]), -ta, 'a');
  if (st.v > 0.1) L.arrow(P[0], P[1], P[0] + st.v * k * 2 * tx, P[1] + st.v * k * 2 * ty, { color: 'a', style: 'dash', width: 3 });
  const an = st.v * st.v / R, at = st.brake && st.v > 0 ? -2 : 0;
  if (an > 0.05) L.arrow(P[0], P[1], P[0] + an * ak * nx, P[1] + an * ak * ny, { color: 'c', style: 'dot', width: 3 });
  if (at) L.arrow(P[0], P[1], P[0] + at * ak * tx, P[1] + at * ak * ty, { color: 'c', style: 'dot', width: 3 });
  if (at && an > 0.05) L.arrow(P[0], P[1], P[0] + (an * nx + at * tx) * ak, P[1] + (an * ny + at * ty) * ak, { color: 'c', style: 'dashdot', width: 3.5 });
  const u = R / 25;
  if (an > 0.4) L.text('an', P[0] + an * ak * nx + 1.5 * u * tx, P[1] + an * ak * ny + 1.5 * u * ty, { size: 16, color: 'c', math: true, italic: true, bg: true });
  if (at) L.text('at', P[0] + at * ak * tx - u * nx, P[1] + at * ak * ty - u * ny, { size: 16, color: 'c', math: true, italic: true, bg: true });
  if (st.v > 2) L.text('v', P[0] + st.v * k * 2 * tx + u * tx, P[1] + st.v * k * 2 * ty + u * ty, { size: 17, color: 'a', math: true, italic: true, bold: true, bg: true });
  // グラフ a_n = v²/ρ
  const g = cv.view({ x0: 0, x1: 33, y0: 0, y1: 20.5, box: [500, 30, 350, 360] });
  g.axes({ xt: [10, 20, 30], yt: [2, 8, 18], xl: 'v〔m/s〕', yl: 'an〔m/s²〕' });
  g.plot(x => x * x / 50, { x0: 0, x1: 30, color: 'b', width: R === 50 ? 3 : 1.5 });
  g.plot(x => x * x / 100, { x0: 0, x1: 30, color: 'b', style: 'dash', width: R === 100 ? 3 : 1.5 });
  g.text('ρ = 50 m', 22, 13.5, { size: 15, color: 'b', align: 'right' }); g.text('ρ = 100 m', 26, 4.6, { size: 15, color: 'b' });
  for (const x of [10, 20, 30]) g.dot(x, x * x / 50, { color: 'b', r: 3.5 });
  g.dot(st.v, an, { color: 'c', r: 7, shape: 'diamond' });
}

// ③ の道：y = 15 sin(2πx/80)（m）。弧の長さで点を進めるため、表を作っておく
let ROAD_ = null;
function road() { return ROAD_ || (ROAD_ = (() => {
  const f = x => 15 * Math.sin(2 * Math.PI * x / 80), d1 = x => 15 * 2 * Math.PI / 80 * Math.cos(2 * Math.PI * x / 80), d2 = x => -15 * (2 * Math.PI / 80) ** 2 * Math.sin(2 * Math.PI * x / 80);
  const xs = [0], ss = [0]; let s = 0;
  for (let i = 1; i <= 2000; i++) { const x0 = (i - 1) * 0.08, x1 = i * 0.08; s += Math.hypot(x1 - x0, f(x1) - f(x0)); xs.push(x1); ss.push(s); }
  return { f, d1, d2, xs, ss, len: s };
})()); }
function roadAt(s) {
  const { xs, ss, f, d1, d2 } = road(); let i = 1; while (i < ss.length - 1 && ss[i] < s) i++;
  const u = (s - ss[i - 1]) / (ss[i] - ss[i - 1]), x = xs[i - 1] + u * (xs[i] - xs[i - 1]);
  const p = d1(x), q = d2(x), k = q / Math.pow(1 + p * p, 1.5);
  return { x, y: f(x), tx: 1 / Math.hypot(1, p), ty: p / Math.hypot(1, p), k };
}
function drawEn(cv, st) {
  const V = cv.view({ x0: -2, x1: 162, y0: -42, y1: 42, box: [10, 10, 860, 420], equal: true });
  V.plot(road().f, { x0: 0, x1: 160, color: 'sub', width: 14, alpha: 0.2 });
  V.plot(road().f, { x0: 0, x1: 160, color: 'sub', width: 1, style: 'dot' });
  const p = roadAt(st.s), nx = -p.ty * Math.sign(p.k || 1), ny = p.tx * Math.sign(p.k || 1);
  const r = 1 / Math.max(1e-6, Math.abs(p.k));
  if (r < 400) {
    const cx = p.x + nx * r, cy = p.y + ny * r;
    V.clip(() => V.circle(cx, cy, r, { color: 'd', style: 'dash', width: 2 }));
    if (r < 60) { V.dot(cx, cy, { color: 'd', r: 4 }); V.line([[p.x, p.y], [cx, cy]], { color: 'd', width: 1 }); V.text('ρ = ' + A.num(r, 1) + ' m', (p.x + cx) / 2 + 2, (p.y + cy) / 2, { size: 15, color: 'd', bg: true }); }
  }
  car(cv, V.X(p.x), V.Y(p.y), -Math.atan2(p.ty, p.tx), 'a');
  V.arrow(p.x, p.y, p.x + p.tx * st.vv * 1.2, p.y + p.ty * st.vv * 1.2, { color: 'a', style: 'dash', width: 3 });
  const an = st.vv * st.vv * Math.abs(p.k);
  if (an > 0.05) V.arrow(p.x, p.y, p.x + nx * an * 2.2, p.y + ny * an * 2.2, { color: 'c', style: 'dot', width: 3.5 });
}
