// @id p1-09
// @title 角運動量の矢印：回転いすと車輪
// @vol 物理1
// @uses 3d
// @from 物理 力-6 ①⑤⑥（p1-06 の回転いすの実験・はてな？の答え・例題12）、力-7 ⑩（ジャイロ）
'use strict';
// 角運動量 L は長い破線、トルク N は一点鎖線、力（重力）は実線、回る向きは細い矢印の弧。図はドラッグで回せる。
A.item({
  id: 'p1-09', title: '角運動量の矢印：回転いすと車輪',
  from: '物理 第1巻『力学』 力-6 ① 回転いすの実験、⑥ はてな？の答え、例題12（車輪をひっくり返す）、力-7 ⑩ ジャイロから（数学 4-14 でも使う）',
  W: 880, H: 440,
  state: { yaw: -30, pitch: 18, r: 0.7, c: 0, th: 0, ph: 0, flip: 0, Om: 0, w: 30, psi: 0 },
  scenes: [
    {
      key: 'ude', label: '① 腕を引きよせる',
      lead: '回転いすの人が、2 kg のペットボトルを両手に持って回っています。▶ で腕を引きよせたり、広げたりします。',
      note: '外から回す働き（トルク）がないので、角運動量 $L=I\\omega$ は変わりません。人と回転いすの $I$ を 1.5 kg·m²（モデルの値）とすると、0.7 m では $I_1=1.5+4\\times0.7^2=3.46$、0.2 m では $I_2=1.5+4\\times0.2^2=1.66$。$I$ が小さくなった分、回る速さは $3.46÷1.66\\approx2.1$ 倍になります。',
      miss: '人と回転いすの分（1.5）は変わらないので、ペットボトルの距離を半分にしても、全体の $I$ は4分の1にはなりません。',
      legend: [['角運動量 $\\vec L$（長い破線）', { color: 'c', style: 'long' }], ['ペットボトル（2 kg×2）', { color: 'b', shape: 'circle', noline: true }], ['回る向き', { color: 'ink' }]],
      controls: [{ range: 'r', label: 'ペットボトルの距離 $r$〔m〕', min: 0.2, max: 0.7, step: 0.01, d: 2 }],
      drag: A.rotDrag([0, 0, 560, 440]),
      init(st) { st.c = 0; st.th = 0; st.r = 0.7; },
      step(st, dt) {
        st.c = (st.c + dt) % 10;
        const c = st.c; st.r = c < 2 ? 0.7 : c < 4 ? 0.7 - 0.5 * (c - 2) / 2 : c < 7 ? 0.2 : c < 9 ? 0.2 + 0.5 * (c - 7) / 2 : 0.7;
        st.th += omega(st.r) * dt * 0.5;
      },
      draw: drawUde,
      readout: st => { const I = 1.5 + 4 * st.r * st.r, w = omega(st.r); return `$I$ ＝ 1.5 ＋ 4 × ${A.num(st.r, 2)}² ＝ ${A.num(I, 2)} kg·m²　　$\\omega$ ＝ ${A.num(w, 2)} rad/s（1回転に ${A.num(2 * Math.PI / w, 2)} s）　　$L=I\\omega$ ＝ <b>${A.num(I * w, 2)}</b>（変わらない）`; }
    },
    {
      key: 'sharin', label: '② 車輪をひっくり返す',
      lead: '止まった回転いすの人が、上から見て左回りに 20 rad/s で回る車輪（$I$＝0.1）を持っています。車輪の軸を 180° ひっくり返すと？',
      note: 'たての軸のまわりには外からのトルクがないので、角運動量の**たての成分の和**は $+2$ のまま。車輪をひっくり返すと車輪は $-2$ になり、その分の $+4$ を人と回転いす（$I$＝3）が受けもちます：$2=-2+3\\Omega$ より $\\Omega=\\frac{4}{3}\\approx1.3$ rad/s（左回り、約5秒で1回転）。',
      miss: '角運動量は向きをもつ量（ベクトル）です。大きさだけを足すと、まちがえます。',
      legend: [['車輪の $\\vec L$', { color: 'c', style: 'long' }], ['人と回転いすの $\\vec L$', { color: 'a', style: 'long' }], ['たての成分の和（いつも $+2$）', { color: 'd', style: 'dashdot' }]],
      controls: [{ range: 'flip', label: '車輪の軸の傾き', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°' }],
      drag: A.rotDrag([0, 0, 600, 440]),
      init(st) { st.flip = 0; st.th = 0; st.ph = 0; st.c = 0; },
      step(st, dt) { st.c += dt; st.flip = A.clamp((st.c - 1) / 3 * 180, 0, 180); st.th += Omega(st.flip) * dt * 0.5; st.ph += 20 * dt * 0.05; if (st.c > 14) return false; },
      draw: drawSharin,
      readout: st => { const lw = 2 * Math.cos(st.flip * Math.PI / 180); return `車輪のたての成分 ${A.num(lw, 2)}　＋　人と回転いす 3 × ${A.num(Omega(st.flip), 2)} ＝ ${A.num(3 * Omega(st.flip), 2)}　　和 ＝ <b>${A.num(lw + 3 * Omega(st.flip), 2)}</b>　　$\\Omega$ ＝ ${A.num(Omega(st.flip), 2)} rad/s`; }
    },
    {
      key: 'saisa', label: '③ ひもでつるした車輪',
      lead: '軸の片方だけをひもでつるした、速く回る車輪。落ちないで、軸がひものまわりを回ります（歳差運動）。',
      note: '重力 $mg$ は、ひもの点のまわりにトルク $N=mgd$ を生みます。$\\frac{d\\vec L}{dt}=\\vec N$ で、$\\vec N$ は $\\vec L$ に直角なので、$\\vec L$ は長さを変えずに向きだけが水平に回ります。$\\Omega=\\frac{mgd}{I\\omega}$（$m$＝2.0 kg、$d$＝0.20 m、$I$＝0.10 kg·m²）。$\\omega$ が 30 rad/s で約 1.3 rad/s、60 rad/s で約 0.65 rad/s。',
      legend: [['角運動量 $\\vec L$', { color: 'c', style: 'long' }], ['重力のトルク $\\vec N$', { color: 'd', style: 'dashdot' }], ['重力 $mg$（実線）', { color: 'b' }]],
      controls: [{ range: 'w', label: '車輪の角速度 $\\omega$〔rad/s〕', min: 20, max: 80, step: 1, d: 0 }],
      drag: A.rotDrag([0, 0, 880, 440]),
      init(st) { st.psi = 0; st.ph = 0; st.yaw = -30; st.pitch = 20; },
      step(st, dt) { st.psi += 2 * 9.8 * 0.2 / (0.1 * st.w) * dt * 0.5; st.ph += st.w * dt * 0.03; },
      draw: drawSaisa,
      readout: st => `$\\Omega$ ＝ 2.0 × 9.8 × 0.20 ÷（0.10 × ${st.w}）＝ <b>${A.num(2 * 9.8 * 0.2 / (0.1 * st.w), 2)} rad/s</b>（1周 ${A.num(2 * Math.PI / (2 * 9.8 * 0.2 / (0.1 * st.w)), 1)} s）　　$L$ ＝ 0.10 × ${st.w} ＝ ${A.num(0.1 * st.w, 1)}`
    }
  ]
});

function omega(r) { return 3.46 * Math.PI / (1.5 + 4 * r * r); }       // 0.7 m で 1回転 2.0 s（ω＝π）
function Omega(f) { return (2 - 2 * Math.cos(f * Math.PI / 180)) / 3; }
function chairPerson(V, th, armR, holdWheel) {
  // 床・いすの軸・座面・体（z が上）
  const ring = (z, r, n = 24) => A.range(0, n, 1).map(k => [r * Math.cos(2 * Math.PI * k / n), r * Math.sin(2 * Math.PI * k / n), z]);
  V.poly3(ring(0, 0.45), { fill: 'sub', alpha: 0.15, color: 'sub', width: 1, zbias: -5 });
  V.line3([[0, 0, 0], [0, 0, 0.45]], { color: 'sub', width: 5 });
  V.poly3(ring(0.48, 0.25), { fill: 'e', alpha: 0.35, color: 'e', width: 1.5 });
  V.line3([[0, 0, 0.5], [0, 0, 1.2]], { color: 'ink', width: 9 });
  V.dot3([0, 0, 1.38], { color: 'ink', r: 11 });
  // 向き（顔）の印
  V.dot3([0.1 * Math.cos(th), 0.1 * Math.sin(th), 1.4], { color: 'bg', r: 3 });
  if (armR != null) for (const s of [1, -1]) {
    const a = th + (s > 0 ? Math.PI / 2 : -Math.PI / 2), sh = [0, 0, 1.15], hand = [armR * Math.cos(a), armR * Math.sin(a), 1.1];
    V.line3([sh, hand], { color: 'ink', width: 4 });
    V.dot3(hand, { color: 'b', r: 9 });
  }
  void holdWheel;
}
function spinArc(V, z, r, a0, w, col) {
  // 回る向きの矢印の弧（左回り＝上から見て反時計）
  const pts = []; for (let k = 0; k <= 16; k++) { const a = a0 + Math.sign(w) * 1.6 * k / 16; pts.push([r * Math.cos(a), r * Math.sin(a), z]); }
  V.line3(pts, { color: col || 'ink', width: 2 }); V.arrow3(pts[14], pts[16], { color: col || 'ink', width: 2, head: 10 });
}
function drawUde(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 560, 440], yaw: st.yaw, pitch: st.pitch, scale: 165, center: [0, 0, 1.05] });
  chairPerson(V, st.th, st.r + 0.12);
  spinArc(V, 0.75, 0.55, st.th + 2, 1);
  const L = 3.46 * Math.PI;   // 一定
  V.arrow3([0, 0, 1.5], [0, 0, 1.5 + L * 0.06], { color: 'c', style: 'long', width: 4 });
  V.text3('L（一定）', [0.08, 0, 1.5 + L * 0.06], { size: 16, color: 'c', bold: true });
  V.flush();
  // 右：回る速さの倍率のグラフ（本の図）
  const g = cv.view({ x0: 0, x1: 0.8, y0: 0, y1: 2.6, box: [610, 40, 240, 300] });
  g.axes({ xt: [0.2, 0.4, 0.6, 0.7], yt: [0.5, 1, 1.5, 2, 2.5], xl: 'r〔m〕', yl: '回る速さの倍率' });
  g.plot(r => 3.46 / (1.5 + 4 * r * r), { x0: 0, x1: 0.75, color: 'a', width: 2.5 });
  g.dot(0.2, 2.084, { color: 'b', r: 4 }); g.dot(0.7, 1, { color: 'b', r: 4 });
  g.dot(st.r, 3.46 / (1.5 + 4 * st.r * st.r), { color: 'a', r: 7, shape: 'diamond' });
  cv.text('0.7 m のときを 1 とする', 730, 380, { size: 14, color: 'sub', align: 'center' });
}
function wheel(V, c, axis, R, ph, col) {
  // 中心 c、軸の向き axis（単位）、半径 R の車輪とスポーク
  const ax = axis, t = Math.abs(ax[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const u = norm(cross(ax, t)), v = cross(ax, u), pts = [];
  for (let k = 0; k <= 32; k++) { const a = 2 * Math.PI * k / 32; pts.push(add(c, add(mul(u, R * Math.cos(a)), mul(v, R * Math.sin(a))))); }
  V.line3(pts, { color: col, width: 3.5 });
  for (let k = 0; k < 4; k++) { const a = ph + Math.PI * k / 2; V.line3([c, add(c, add(mul(u, R * Math.cos(a)), mul(v, R * Math.sin(a))))], { color: col, width: 1.5 }); }
}
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
function mul(a, s) { return [a[0] * s, a[1] * s, a[2] * s]; }
function norm(a) { const n = Math.hypot(...a) || 1; return mul(a, 1 / n); }
function drawSharin(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 600, 440], yaw: st.yaw, pitch: st.pitch, scale: 175, center: [0.15, 0, 1.0] });
  chairPerson(V, st.th, null);
  // 車輪：体の前 0.35 m、高さ 1.5 m、軸を x のまわりに傾ける
  const f = st.flip * Math.PI / 180, fx = Math.cos(st.th), fy = Math.sin(st.th);
  const c = [0.55 * fx, 0.55 * fy, 1.2], sideAx = [-fy, fx, 0];
  const axis = add(mul([0, 0, 1], Math.cos(f)), mul(cross(sideAx, [0, 0, 1]), Math.sin(f)));
  V.line3([[0, 0, 1.12], add(c, mul(axis, -0.15))], { color: 'ink', width: 4 });
  V.line3([add(c, mul(axis, -0.15)), add(c, mul(axis, 0.15))], { color: 'ink', width: 3 });
  wheel(V, c, axis, 0.28, st.ph, 'e');
  const s = 0.32;   // L＝1 を 0.32 の長さで
  V.arrow3(c, add(c, mul(axis, 2 * s)), { color: 'c', style: 'long', width: 4 });
  V.text3('車輪 L', add(c, mul(axis, 2 * s + 0.08)), { size: 15, color: 'c', bold: true });
  const Lp = 3 * Omega(st.flip);
  if (Lp > 0.02) { V.arrow3([0, 0, 0.6], [0, 0, 0.6 + Lp * s], { color: 'a', style: 'long', width: 4 }); V.text3('人と回転いす', [0.05, 0, 0.6 + Lp * s + 0.06], { size: 15, color: 'a', bold: true }); spinArc(V, 0.3, 0.5, st.th + 2, 1, 'a'); }
  V.flush();
  // 右：たての成分の棒（和はいつも +2）
  const g = cv.view({ x0: 0, x1: 3, y0: -2.9, y1: 4.6, box: [640, 30, 220, 380] });
  g.axes({ yt: [-2, 2, 4], xt: [], yl: 'たての成分', ax: 0, grid: false });
  const lw = 2 * Math.cos(f);
  const bar = (x, v, col, st2, lab) => { g.poly([[x - 0.32, 0], [x + 0.32, 0], [x + 0.32, v], [x - 0.32, v]], { fill: col, alpha: 0.4, color: col, width: 2, style: st2 }); g.text(lab, x, -2.75, { size: 14, align: 'center' }); g.text(A.num(v, 2), x, v + (v >= 0 ? 0.3 : -0.3), { size: 14, align: 'center' }); };
  bar(0.6, lw, 'c', 'long', '車輪'); bar(1.5, Lp, 'a', 'long', '人・いす'); bar(2.4, lw + Lp, 'd', 'dashdot', '和');
}
function drawSaisa(cv, st) {
  const V = new A.View3(cv, { box: [0, 0, 880, 440], yaw: st.yaw, pitch: st.pitch, scale: 330, center: [0.15, 0, 0.7] });
  // ひもは z 軸。ひもの点 O＝(0,0,0.6)、軸の向き (cos ψ, sin ψ, 0)、車輪の中心は d＝0.20 m 先
  const O = [0, 0, 0.6], ax = [Math.cos(st.psi), Math.sin(st.psi), 0], d = 0.4;   // 図では d を2倍にかく
  V.line3([[0, 0, 1.1], O], { color: 'ink', width: 2 });
  V.line3([[-0.2, 0, 1.1], [0.2, 0, 1.1]], { color: 'ink', width: 4 });
  const c = add(O, mul(ax, d));
  V.line3([O, add(c, mul(ax, 0.05))], { color: 'ink', width: 5 });
  wheel(V, c, ax, 0.22, st.ph, 'e');
  const L = 0.1 * st.w, s = 0.09;
  V.arrow3(add(c, mul(ax, 0.06)), add(c, mul(ax, 0.06 + L * s)), { color: 'c', style: 'long', width: 4 });
  V.text3('L = Iω', add(c, mul(ax, 0.1 + L * s)), { size: 16, color: 'c', bold: true });
  V.arrow3(c, add(c, [0, 0, -0.32]), { color: 'b', width: 4 }); V.text3('mg', add(c, [0.03, 0, -0.3]), { size: 16, color: 'b', math: true, italic: true });
  const nd = cross([0, 0, 1], ax);   // トルクの向き（水平で、軸に直角）
  V.arrow3(add(c, mul(ax, 0.06 + L * s)), add(add(c, mul(ax, 0.06 + L * s)), mul(nd, 0.25)), { color: 'd', style: 'dashdot', width: 3.5 });
  V.text3('N', add(add(c, mul(ax, 0.06 + L * s)), mul(nd, 0.3)), { size: 16, color: 'd', bold: true, math: true, italic: true });
  // 軸の先がえがく円（点線）
  const circ = A.range(0, 48, 1).map(k => { const a = 2 * Math.PI * k / 48; return add(O, [(d + 0.06 + L * s) * Math.cos(a), (d + 0.06 + L * s) * Math.sin(a), 0]); });
  V.line3(circ, { color: 'sub', style: 'dot', width: 1.2, zbias: -2 });
  V.text3('d（図では大きくかいた）', add(add(O, mul(ax, d / 2 - 0.1)), [0, 0, -0.09]), { size: 14, color: 'sub' });
  spinArc({ line3: (p, o) => V.line3(p.map(q => add(q, [0, 0, 0.75])), o), arrow3: (a, b, o) => V.arrow3(add(a, [0, 0, 0.75]), add(b, [0, 0, 0.75]), o) }, 0, 0.18, st.psi, 1, 'd');
  V.text3('Ω', [0.2, 0.05, 0.8], { size: 16, color: 'd', italic: true, math: true });
  V.flush();
}
