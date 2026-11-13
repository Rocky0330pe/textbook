// @id p1-14
// @title 切り口を回す：応力の波とモールの円
// @vol 物理1
// @from 物理 力-9 ③④⑥⑧（p1-09 の表計算 σx＝80・σy＝−20・τ＝30 MPa、モールの円の図・かき方）、まちがえやすいところ
'use strict';
// 3つの図の場所（正方形・モールの円・波）
const BOX = { sq: [10, 10, 250, 250], mo: [280, 10, 340, 260], wv: [70, 290, 780, 140] };
// σθ ＝ σx cos²θ ＋ σy sin²θ ＋ 2τ sinθ cosθ、τθ ＝ (σx − σy) sinθ cosθ − τ(cos²θ − sin²θ)（本の式。τθ の向きは法線を右回りに90°）
// 垂直応力の矢印は実線、せん断応力の矢印は破線。図のどこをドラッグしても θ を変えられる。
A.item({
  id: 'p1-14', title: '切り口を回す：応力の波とモールの円',
  from: '物理 第1巻『力学』 力-9 ③ の表計算、④ モールの円、⑥ 座標を回す、⑧ モールの円を式で確かめる、から（数学 7-6・7-8・7-9、力-8・力-10 でも使う）',
  W: 880, H: 440,
  state: { th: 0, sx: 80, sy: -20, tau: 30 },
  scenes: [
    {
      key: 'en', label: '① 回すと円になる',
      lead: '小さな正方形（$\\sigma_x=80$、$\\sigma_y=-20$、$\\tau=30$ MPa）の切り口を、角 $\\theta$ だけ回します。▶ を押すか、図をドラッグしましょう。',
      note: '切り口を回すと、$\\sigma_\\theta$・$\\tau_\\theta$ は波のように変わり、点 $(\\sigma_\\theta,\\ \\tau_\\theta)$ は中心 $(30,\\ 0)$、半径 58.3 の円の上を回ります（モールの円）。切り口を $\\theta$ 回すと、**円の上の点は2倍の角** $2\\theta$ 回ります。いちばん右が最大主応力 $\\sigma_1=88.3$（$\\theta_p=15.5°$）、いちばん左が $\\sigma_2=-28.3$。円の上・下がずらす応力の最大（半径）です。',
      miss: '円の上の角は、切り口の角の2倍です。$\\sigma_1$ と $\\sigma_2$ の点は円の上で 180° はなれていますが、切り口では 90° です。',
      legend: [['垂直応力 $\\sigma_\\theta$（実線）', { color: 'a' }], ['せん断応力 $\\tau_\\theta$（破線）', { color: 'b', style: 'dash' }], ['モールの円', { color: 'd' }], ['表の点（15° ごと）', { color: 'sub', shape: 'circle', noline: true }]],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = (st.th + dt * 18) % 180; },
      drag: dragTh(),
      draw: drawAll,
      readout: rd
    },
    {
      key: 'kaeru', label: '② 応力を変える',
      lead: '$\\sigma_x$・$\\sigma_y$・$\\tau$ を変えると、円はどう変わるでしょう。ボタンで、棒を引く場合・ねじる場合にもできます。',
      note: '中心は $c=\\frac{\\sigma_x+\\sigma_y}{2}$、半径は $\\rho=\\sqrt{a^2+\\tau^2}$（$a=\\frac{\\sigma_x-\\sigma_y}{2}$）、主応力は $\\sigma_{1,2}=c\\pm\\rho$。$\\tau$ だけを大きくすると、中心は動かず半径が大きくなり、主方向は 45° に近づきます（30→60 で $\\sigma_1$ は 88.3→108.1、2倍にはならない）。棒を引くと、ずらす応力は 45° の面でいちばん大きく、引く応力の半分です。ねじる（純粋せん断）と、45° の面に引く応力 $\\tau$ が出ます（チョークがらせんに割れるわけ）。',
      legend: [['垂直応力 $\\sigma_\\theta$（実線）', { color: 'a' }], ['せん断応力 $\\tau_\\theta$（破線）', { color: 'b', style: 'dash' }], ['モールの円', { color: 'd' }], ['主応力の点', { color: 'c', shape: 'diamond', noline: true }]],
      controls: [{ range: 'sx', label: '$\\sigma_x$〔MPa〕', min: -100, max: 120, step: 1, d: 0 }, { range: 'sy', label: '$\\sigma_y$〔MPa〕', min: -100, max: 120, step: 1, d: 0 }, { range: 'tau', label: '$\\tau$〔MPa〕', min: -80, max: 80, step: 1, d: 0 },
        { button: '本の例（80・−20・30）', act: st => { st.sx = 80; st.sy = -20; st.tau = 30; } }, { button: '棒を引く（$\\sigma_y=\\tau=0$）', act: st => { st.sx = 100; st.sy = 0; st.tau = 0; st.th = 45; } }, { button: 'ねじる（$\\sigma_x=\\sigma_y=0$）', act: st => { st.sx = 0; st.sy = 0; st.tau = 60; st.th = 45; } }],
      init(st) { st.th = 0; },
      step(st, dt) { st.th = (st.th + dt * 18) % 180; },
      drag: dragTh(),
      draw: drawAll,
      readout: rd
    }
  ]
});

function S(st, deg) {
  const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  return [st.sx * c * c + st.sy * s * s + 2 * st.tau * s * c, (st.sx - st.sy) * s * c - st.tau * (c * c - s * s)];
}
function circ(st) { const c = (st.sx + st.sy) / 2, a = (st.sx - st.sy) / 2, rho = Math.hypot(a, st.tau); let tp = Math.atan2(st.tau, a) / 2 * 180 / Math.PI; if (tp < 0) tp += 90 * (tp < -45 ? 2 : 0); return { c, a, rho, tp }; }
function rd(st) { const [sn, ts] = S(st, st.th), k = circ(st); return `$\\theta$ ＝ ${A.num(st.th, 1)}°　　$\\sigma_\\theta$ ＝ <b>${A.num(sn, 1)}</b>　$\\tau_\\theta$ ＝ <b>${A.num(ts, 1)}</b> MPa　　中心 ${A.num(k.c, 1)}・半径 ${A.num(k.rho, 1)}　　$\\sigma_1$ ＝ ${A.num(k.c + k.rho, 1)}、$\\sigma_2$ ＝ ${A.num(k.c - k.rho, 1)}、$\\theta_p$ ＝ ${A.num(k.tp, 1)}°`; }
function views(cv, st) {
  const k = circ(st), M = Math.max(60, Math.abs(k.c) + k.rho + 10);
  const sq = cv.view({ x0: -1, x1: 1, y0: -1, y1: 1, box: BOX.sq, equal: true });
  const mo = cv.view({ x0: k.c - M * 1.1, x1: k.c + M * 1.1, y0: -M * 0.9, y1: M * 0.9, box: BOX.mo, equal: true });
  const R = Math.max(100, Math.abs(k.c) + k.rho + 5);
  const wv = cv.view({ x0: 0, x1: 185, y0: -R, y1: R, box: BOX.wv });
  return { sq, mo, wv, k };
}
function dragTh() {
  const inb = (b, x, y) => x >= b[0] && x <= b[0] + b[2] && y >= b[1] && y <= b[1] + b[3];
  return {
    hit(st, x, y) { return inb(BOX.sq, x, y) ? 'sq' : inb(BOX.mo, x, y) ? 'mo' : inb(BOX.wv, x, y) ? 'wv' : null; },
    move(st, x, y, api, h) {
      const v = views({ view: o => new A.View({ W: 880, H: 440 }, o) }, st);
      if (h === 'sq') { const [a, b] = v.sq.inv(x, y); st.th = ((Math.atan2(b, a) * 180 / Math.PI) % 180 + 180) % 180; }
      else if (h === 'mo') { const [a, b] = v.mo.inv(x, y), X = S(st, 0), a0 = Math.atan2(X[1], X[0] - v.k.c), a1 = Math.atan2(b, a - v.k.c); st.th = ((((a1 - a0) * 180 / Math.PI) / 2) % 180 + 180) % 180; }
      else { st.th = A.clamp(v.wv.inv(x, y)[0], 0, 180); }
    }
  };
}
function drawAll(cv, st) {
  const { sq, mo, wv, k } = views(cv, st), th = st.th * Math.PI / 180;
  // ① 回した正方形と、4つの面の応力
  const n = [Math.cos(th), Math.sin(th)], m = [-Math.sin(th), Math.cos(th)], h = 0.36;
  const corner = (a, b) => [n[0] * a + m[0] * b, n[1] * a + m[1] * b];
  sq.line([[-0.95, 0], [0.95, 0]], { color: 'grid', width: 1 }); sq.line([[0, -0.95], [0, 0.95]], { color: 'grid', width: 1 });
  sq.poly([corner(h, h), corner(-h, h), corner(-h, -h), corner(h, -h)], { fill: 'a', alpha: 0.1, color: 'ink', width: 2 });
  const sc = 0.45 / Math.max(80, Math.abs(st.sx), Math.abs(st.sy), Math.abs(st.tau) * 1.5, 1);
  for (const [f, lab] of [[n, true], [[-n[0], -n[1]], false], [m, false], [[-m[0], -m[1]], false]]) {
    const t = [st.sx * f[0] + st.tau * f[1], st.tau * f[0] + st.sy * f[1]], tn = t[0] * f[0] + t[1] * f[1], tt = [t[0] - tn * f[0], t[1] - tn * f[1]];
    const P = [f[0] * h, f[1] * h];
    if (Math.abs(tn) > 0.5) { const s0 = tn > 0 ? 0.04 : 0.04 + Math.abs(tn) * sc, s1 = tn > 0 ? 0.04 + tn * sc : 0.04; sq.arrow(P[0] + f[0] * s0, P[1] + f[1] * s0, P[0] + f[0] * s1, P[1] + f[1] * s1, { color: 'a', width: lab ? 3.5 : 2.5 }); }
    const tl = Math.hypot(...tt);
    if (tl > 0.5) { const u = [tt[0] / tl, tt[1] / tl], Q = [P[0] + f[0] * 0.06, P[1] + f[1] * 0.06]; sq.arrow(Q[0] - u[0] * tl * sc / 2, Q[1] - u[1] * tl * sc / 2, Q[0] + u[0] * tl * sc / 2, Q[1] + u[1] * tl * sc / 2, { color: 'b', style: 'dash', width: lab ? 3 : 2 }); }
  }
  sq.text('σθ', n[0] * 0.86, n[1] * 0.86 + 0.08, { size: 16, color: 'a', bold: true, align: 'center', bg: true });
  sq.line([[0, 0], [n[0] * 0.3, n[1] * 0.3]], { color: 'sub', width: 1, style: 'dot' });
  sq.text('θ = ' + A.num(st.th, 0) + '°', -0.95, 0.9, { size: 15 });
  // ② モールの円
  mo.axes({ xt: [], yt: [], xl: 'σ', yl: 'τ', grid: false });
  mo.circle(k.c, 0, k.rho, { color: 'd', width: 2.5 });
  const X = S(st, 0), Y = S(st, 90), Pn = S(st, st.th);
  mo.line([X, Y], { color: 'sub', width: 1 });
  mo.dot(k.c, 0, { color: 'ink', r: 4 }); mo.text('c = ' + A.num(k.c, 1), k.c, -k.rho * 0.12 - 8, { size: 14, align: 'center', color: 'sub' });
  if (st.th > 0.5) { const a0 = Math.atan2(X[1], X[0] - k.c), pts = []; for (let i = 0; i <= 30; i++) { const a = a0 + 2 * th * i / 30; pts.push([k.c + k.rho * 0.3 * Math.cos(a), k.rho * 0.3 * Math.sin(a)]); } mo.line(pts, { color: 'd', width: 1.5 }); const am = a0 + th; mo.text('2θ', k.c + k.rho * 0.42 * Math.cos(am), k.rho * 0.42 * Math.sin(am), { size: 15, color: 'd', align: 'center', bg: true }); }
  mo.line([[k.c, 0], Pn], { color: 'd', width: 1, style: 'dot' });
  mo.dot(k.c + k.rho, 0, { color: 'c', r: 6, shape: 'diamond' }); mo.dot(k.c - k.rho, 0, { color: 'c', r: 6, shape: 'diamond' });
  mo.text('σ₁', k.c + k.rho + 2, -k.rho * 0.1 - 6, { size: 15, color: 'c' }); mo.text('σ₂', k.c - k.rho - 2, -k.rho * 0.1 - 6, { size: 15, color: 'c', align: 'right' });
  mo.dot(X[0], X[1], { color: 'sub', r: 4 }); mo.text('X', X[0] + 3, X[1] - 6, { size: 14, color: 'sub' });
  mo.dot(Y[0], Y[1], { color: 'sub', r: 4 }); mo.text('Y', Y[0] - 3, Y[1] + 6, { size: 14, color: 'sub', align: 'right' });
  for (let d = 0; d < 180; d += 15) { const p = S(st, d); mo.dot(p[0], p[1], { color: 'sub', r: 2.5 }); }
  mo.dot(Pn[0], Pn[1], { color: 'd', r: 8 });
  // ③ 波
  wv.axes({ xt: [45, 90, 135, 180], yt: [-50, 50], xl: 'θ〔°〕', yl: 'MPa' });
  wv.plot(d => S(st, d)[0], { x0: 0, x1: 180, color: 'a', width: 2.5 });
  wv.plot(d => S(st, d)[1], { x0: 0, x1: 180, color: 'b', style: 'dash', width: 2.5 });
  for (let d = 0; d <= 180; d += 15) { const p = S(st, d); wv.dot(d, p[0], { color: 'a', r: 2.5 }); wv.dot(d, p[1], { color: 'b', r: 2.5, shape: 'square' }); }
  wv.line([[st.th, wv.y0], [st.th, wv.y1]], { color: 'sub', width: 1 });
  wv.dot(st.th, Pn[0], { color: 'a', r: 6 }); wv.dot(st.th, Pn[1], { color: 'b', r: 6, shape: 'square' });
  wv.text('σθ', 182, S(st, 180)[0], { size: 14, color: 'a' }); wv.text('τθ', 182, S(st, 180)[1], { size: 14, color: 'b' });
  // 右上：数
  const L = 640;
  cv.text('σθ = ' + A.num(Pn[0], 1), L, 40, { size: 17, color: 'a', bold: true });
  cv.text('τθ = ' + A.num(Pn[1], 1), L, 68, { size: 17, color: 'b', bold: true });
  cv.text('σ₁ = ' + A.num(k.c + k.rho, 1) + '（θ = ' + A.num(k.tp, 1) + '°）', L, 110, { size: 15, color: 'c' });
  cv.text('σ₂ = ' + A.num(k.c - k.rho, 1) + '（θ = ' + A.num(k.tp + 90, 1) + '°）', L, 134, { size: 15, color: 'c' });
  cv.text('ずらす応力の最大 = ' + A.num(k.rho, 1), L, 158, { size: 15, color: 'd' });
  cv.text('（単位 MPa）', L, 190, { size: 14, color: 'sub' });
  cv.text('円の上の角は 2θ', L, 230, { size: 15, bold: true });
}
