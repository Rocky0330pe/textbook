// @id p1-01
// @title 割線が接線になる：平均の速度から速度へ
// @vol 物理1
// @from 物理 力-1 ②（p1-01 の図「赤い矢印は変位 Δr」と、落ちるボールの表 $x=4.9t^2$）
'use strict';
// 道すじ y = 0.0055 x²（本の図と同じ）。点は横に一定の速さ u で進むとする（速度の矢印は、道すじの接線の向き）。
const K = 0.0055, U = 40, X0 = 24, SV = 0.5;   // SV：速度の矢印の長さ（何秒ぶん進むかの倍率）
const pathY = x => K * x * x;
// 小数第2位で四捨五入（11.025 → 11.03。表と同じ丸め方）
const r2 = v => (Math.round(v * 100 + 1e-7) / 100).toFixed(2);
A.item({
  id: 'p1-01', title: '割線が接線になる：平均の速度から速度へ',
  from: '物理 第1巻『力学』 力-1 ② の図（変位の矢印が接線に近づく）と、落ちるボールの表から（数学 5-1〜5-3・5-5 と同じ考え）',
  W: 880, H: 440,
  state: { dt: 1.65, xp: X0, dt2: 1, tt: 0 },
  scenes: [
    {
      key: 'sessen', label: '① 割線が接線へ',
      lead: '▶ を押すと、区切る時間 $\\Delta t$ が短くなっていきます。変位 $\\Delta\\vec r$ の矢印の向きを見ましょう。',
      note: '$\\Delta t$ を短くすると、変位 $\\Delta\\vec r$ は短くなりながら、向きは道すじの**接線の向き**に近づきます。$\\Delta\\vec r/\\Delta t$（平均の速度）は、長さが0にならず、速度 $\\vec v=\\dfrac{d\\vec r}{dt}$ の矢印に重なっていきます。',
      legend: [['変位 $\\Delta\\vec r$（P から Q へ）', { color: 'b', style: 'solid' }], ['平均の速度 $\\Delta\\vec r/\\Delta t$', { color: 'd', style: 'dashdot' }], ['速度 $\\vec v$（接線の向き）', { color: 'a', style: 'dash' }], ['これまでの Q', { color: 'sub', shape: 'circle', noline: true }]],
      controls: [{ range: 'dt', label: '区切る時間 $\\Delta t$', min: 0.02, max: 1.65, step: 0.01, fmt: v => A.num(v, 2) }],
      init(st) { st.dt = 1.65; st.trail = []; st.acc = 0; },
      step(st, dt) {
        st.acc += dt; if (st.acc > 0.5) { st.acc = 0; st.trail.push(st.dt); if (st.trail.length > 8) st.trail.shift(); }
        st.dt *= Math.exp(-dt * 0.9); if (st.dt < 0.02) { st.dt = 0.02; return false; }
      },
      draw(cv, st) { drawPath(cv, st, X0, st.dt, true); },
      readout: st => { const a = angDeg(X0, st.dt); return `$\\Delta t$ ＝ ${A.num(st.dt, 2)}　　$\\Delta\\vec r$ と接線の角 ＝ <b>${A.num(a, 1)}°</b>（$\\Delta t$ を短くすると 0° に近づく）`; }
    },
    {
      key: 'ochiru', label: '② 9.8 に近づく',
      lead: '落ちるボール（$x=4.9t^2$、下向きが $+$）の、1秒の所の平均の速度です。▶ で $\\Delta t$ を半分にしていきます。',
      note: '平均の速度は $\\{4.9(1+\\Delta t)^2-4.9\\}÷\\Delta t=9.8+4.9\\Delta t$。$\\Delta t$ を半分にするたびに、9.8 との差も半分になります。0 に近づけた先の **9.8 m/s** が、1秒の瞬間の速度です。グラフでは、割線の傾きが接線の傾きに近づきます。',
      legend: [['$x=4.9t^2$', { color: 'ink' }], ['割線（傾き＝平均の速度）', { color: 'd', style: 'dashdot' }], ['接線（傾き＝速度 9.8）', { color: 'a', style: 'dash' }], ['ボールの位置', { color: 'b', shape: 'circle', noline: true }]],
      controls: [{ range: 'dt2', label: '区切る時間 $\\Delta t$〔s〕', min: 0.01, max: 1, step: 0.005, fmt: v => A.num(v, 3) }],
      init(st) { st.dt2 = 1; st.acc = 0; },
      step(st, dt) { st.acc += dt; if (st.acc > 1.4) { st.acc = 0; if (st.dt2 <= 0.0157) return false; st.dt2 = Math.max(0.015625, st.dt2 / 2); } },
      draw(cv, st) { drawFall(cv, st); },
      readout: st => `$\\Delta t$ ＝ ${A.num(st.dt2, 3)} s　　平均の速度 ＝ 9.8 ＋ 4.9 × ${A.num(st.dt2, 3)} ＝ <b>${r2(9.8 + 4.9 * st.dt2)} m/s</b>`
    },
    {
      key: 'ugoku', label: '③ 動いても接線',
      lead: '点 P が道すじを進みます。速度の矢印は、どこでも道すじの接線の向きです。',
      note: '速度の向きは、いつも**道すじの接線の向き**です。曲がるところでは、速度の向きも変わります（向きが変わるので、速さが同じでも加速度があります：力-1 ⑤）。',
      legend: [['変位 $\\Delta\\vec r$', { color: 'b', style: 'solid' }], ['速度 $\\vec v$（接線の向き）', { color: 'a', style: 'dash' }], ['通ったあと', { color: 'a', style: 'solid' }]],
      controls: [{ range: 'dt', label: '区切る時間 $\\Delta t$', min: 0.02, max: 1, step: 0.01, fmt: v => A.num(v, 2) }],
      init(st) { st.dt = 0.4; st.xp = 4; },
      step(st, dt) { st.xp += U * dt * 0.35; if (st.xp > 86) st.xp = 4; },
      draw(cv, st) { drawPath(cv, st, st.xp, st.dt, false); },
      readout: st => `P の位置 $x$ ＝ ${A.num(st.xp, 0)}　　接線の傾き ＝ ${A.num(2 * K * st.xp, 3)}　　$\\Delta\\vec r$ と接線の角 ＝ ${A.num(angDeg(st.xp, st.dt), 1)}°`
    }
  ]
});

function angDeg(x, dt) {
  const q = x + U * dt, dx = q - x, dy = pathY(q) - pathY(x);
  return (Math.atan2(dy, dx) - Math.atan(2 * K * x)) * 180 / Math.PI;
}

function drawPath(cv, st, xp, dt, trail) {
  const v = cv.view({ x0: -4, x1: 96, y0: -6, y1: 47, box: [20, 16, 840, 400], equal: true });
  v.plot(pathY, { x0: 0, x1: 96, color: 'sub', width: 7, alpha: 0.35 });
  if (!trail) v.plot(pathY, { x0: 0, x1: xp, color: 'a', width: 2 });
  const P = [xp, pathY(xp)];
  // これまでの Q（うすく）
  if (trail && st.trail) for (const d of st.trail) { const q = xp + U * d; if (q > 96) continue; v.line([P, [q, pathY(q)]], { color: 'b', width: 1.5, alpha: 0.3 }); v.dot(q, pathY(q), { color: 'sub', r: 4 }); }
  // 接線（細い点線）と速度
  const s = 2 * K * xp;
  v.line([[xp - 22, pathY(xp) - 22 * s], [xp + 40, pathY(xp) + 40 * s]], { color: 'a', width: 1, style: 'dot' });
  const vx = U, vy = U * s;
  v.arrow(P[0], P[1], P[0] + vx * SV, P[1] + vy * SV, { color: 'a', style: 'dash', width: 3 });
  // 変位と平均の速度
  const q = xp + U * dt, Q = [q, pathY(q)];
  const ax = (Q[0] - P[0]) / dt, ay = (Q[1] - P[1]) / dt;
  const far = Math.hypot(Q[0] - P[0], Q[1] - P[1]) > 9;
  if (q <= 96) { v.arrow(P[0], P[1], Q[0], Q[1], { color: 'b', width: 3 }); v.dot(Q[0], Q[1], { color: 'ink', r: 5 }); if (far) v.text('Q', Q[0] + 1.5, Q[1] + 3, { size: 16, bold: true }); }
  if (trail) v.arrow(P[0], P[1], P[0] + ax * SV, P[1] + ay * SV, { color: 'd', style: 'dashdot', width: 2.5 });
  v.dot(P[0], P[1], { color: 'ink', r: 6 });
  v.text(trail ? 'P（時刻 t）' : 'P', P[0], P[1] - 4.5, { size: 16, bold: true, align: 'center', bg: true });
  const tx = P[0] + vx * SV, ty = P[1] + vy * SV;
  v.text('速度 v', tx + 1, ty - 3.2, { color: 'a', size: 16, bg: true });
  if (q <= 96 && far && Math.hypot(Q[0] - tx, Q[1] - ty) > 8) v.text('Δr', (P[0] + Q[0]) / 2 - 3, (P[1] + Q[1]) / 2 + 3, { color: 'b', size: 16, bold: true, align: 'right', bg: true });
  if (trail) v.text('Δr/Δt', P[0] + ax * SV + 1, P[1] + ay * SV + 3, { color: 'd', size: 15, bg: true });
}

function drawFall(cv, st) {
  // 左：落ちるボール（下向きが＋）、右：x-t グラフ
  const T1 = 1, d = st.dt2;
  const b = cv.view({ x0: -1, x1: 1, y0: -21, y1: 1.5, box: [20, 20, 150, 400] });
  b.line([[0, 0], [0, -20]], { color: 'grid', width: 6 });
  for (let m = 0; m <= 20; m += 5) { b.line([[-0.25, -m], [0.25, -m]], { color: 'sub', width: 1 }); cv.text(m + ' m', b.X(0.35), b.Y(-m), { size: 14, color: 'sub' }); }
  const x1 = 4.9 * T1 * T1, x2 = 4.9 * (T1 + d) ** 2;
  b.dot(0, -x1, { color: 'b', r: 8 }); cv.text('1 s', b.X(-0.35), b.Y(-x1), { size: 15, align: 'right' });
  if (x2 < 21) { b.dot(0, -x2, { color: 'b', r: 8, open: true }); if (d > 0.12) cv.text((1 + d).toFixed(d < 0.1 ? 3 : 2).replace(/0+$/, '').replace(/\.$/, '') + ' s', b.X(-0.35), b.Y(-x2), { size: 15, align: 'right' }); }
  cv.text('↓ x', b.X(0), 14, { size: 15, align: 'center', color: 'sub' });
  const g = cv.view({ x0: 0, x1: 2.2, y0: 0, y1: 24, box: [230, 20, 380, 380] });
  g.axes({ xt: [0.5, 1, 1.5, 2], yt: [5, 10, 15, 20], xl: 't〔s〕', yl: 'x〔m〕' });
  g.plot(t => 4.9 * t * t, { x0: 0, x1: 2.2, color: 'ink', width: 2.5 });
  const sl = (x2 - x1) / d;
  g.clip(() => {
    g.line([[0, x1 - sl * T1], [2.2, x1 + sl * (2.2 - T1)]], { color: 'd', style: 'dashdot', width: 2.5 });
    g.line([[0, x1 - 9.8 * T1], [2.2, x1 + 9.8 * 1.2]], { color: 'a', style: 'dash', width: 2 });
  });
  g.line([[T1, x1], [T1 + d, x1], [T1 + d, x2]], { color: 'sub', width: 1.5 });
  if (d > 0.12) { g.text('Δt', T1 + d / 2, x1 - 1.1, { size: 15, align: 'center', color: 'sub' }); g.text('Δx', T1 + d + 0.04, (x1 + x2) / 2, { size: 15, color: 'sub' }); }
  g.dot(T1, x1, { color: 'b', r: 6 }); g.dot(T1 + d, x2, { color: 'b', r: 6, open: true });
  // 表（本と同じ値）
  const L = 640, T = 40;
  cv.text('Δt〔s〕', L + 70, T, { size: 15, bold: true, align: 'right' }); cv.text('平均の速度〔m/s〕', L + 200, T, { size: 15, bold: true, align: 'right' });
  const rows = [1, 0.5, 0.25, 0.125, 0.0625, 0.03125, 0.015625];
  rows.forEach((r, k) => {
    const y = T + 34 + k * 30, on = Math.abs(r - d) < 1e-6, past = r >= d - 1e-9;
    if (on) cv.rect(L - 6, y - 14, 220, 28, { fill: 'hl', alpha: 1 });
    cv.text(String(r), L + 70, y, { size: 15, align: 'right', color: past ? 'ink' : 'sub' });
    cv.text(past ? r2(9.8 + 4.9 * r) : '…', L + 190, y, { size: 15, align: 'right', color: past ? 'ink' : 'sub', bold: on });
  });
  cv.text('→ 0', L + 70, T + 34 + 7 * 30 + 6, { size: 15, align: 'right' });
  cv.text('9.80', L + 190, T + 34 + 7 * 30 + 6, { size: 15, align: 'right', color: 'a', bold: true });
}
