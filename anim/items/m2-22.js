// @id m2-22
// @title 円を回る点の速度：Δv は中心を向く
// @vol 数学4
// @from 数学 4-10 ⑤（ch4-10:580・623）、4-15 ②（ch4-15:211）／力-6、4-8 ⑨、電-12、8-5 でも使う
'use strict';
const D22 = Math.PI / 180;
A.item({
  id: 'm2-22', title: '円を回る点の速度：Δv は中心を向く',
  from: '数学 第4巻 4-10 ⑤「速度の変化 Δv」、4-15 ②「$\\vec e_r$ と $\\vec e_\\theta$」の図から（4-8、物理 力-6・電-12、8-5 でも使う）',
  W: 880, H: 420,
  state: { th: 30, r: 0.5, w: 4, dth: 90 },
  scenes: [
    {
      key: 'sokudo', label: '① 速度は接線の向き',
      lead: '半径 $r$ の円を、角速度 $\\omega$ で左回りに回る点 P の速度です。▶ で回してみましょう。',
      note: '点 P ごとに、$\\vec e_r=(\\cos\\theta,\\ \\sin\\theta)$（原点と反対の向き）と、$\\vec e_\\theta=(-\\sin\\theta,\\ \\cos\\theta)$（左回りに円にそう向き）を考えます。円運動の速度は $\\vec v=r\\omega\\,\\vec e_\\theta$。速さ $v=r\\omega$ は変わりませんが、向きはいつも変わっています。',
      legend: [['$\\vec e_r$（長さ1）', { color: 'b' }], ['$\\vec e_\\theta$（長さ1）', { color: 'a', style: 'dash' }], ['速度 $\\vec v=r\\omega\\,\\vec e_\\theta$', { color: 'c' }]],
      controls: [
        { range: 'th', label: '角 $\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' },
        { range: 'r', label: '半径 $r$', min: 0.3, max: 0.6, step: 0.05, fmt: v => A.num(v, 2) + ' m' },
        { range: 'w', label: '角速度 $\\omega$', min: 1, max: 5, step: 0.5, fmt: v => A.num(v, 1) + ' rad/s' },
        { button: '本の例（$\\theta=30°$）', act: st => { st.th = 30; st.r = 0.5; st.w = 4; } }
      ],
      init(st) { st.th = 30; st.r = 0.5; st.w = 4; },
      step(st, dt) { st.th = (st.th + dt * st.w * 15) % 360; },
      draw(cv, st) { drawS(cv, st); },
      readout: st => { const t = st.th * D22, v = st.r * st.w; return `速さ $v=r\\omega$ ＝ ${A.num(st.r, 2)} × ${A.num(st.w, 1)} ＝ ${A.num(v, 2)} m/s　　$\\vec v$ ＝ (${A.num(-v * Math.sin(t), 3)}, ${A.num(v * Math.cos(t), 3)})`; }
    },
    {
      key: 'dv', label: '② Δv は中心へ',
      lead: '速さ 10 m/s のまま円を回る物の、点 P と点 Q での速度です。Q を P に近づけると、速度の変化 $\\Delta\\vec v$ はどちらを向くでしょう。',
      note: '始点をそろえると、$\\Delta\\vec v=\\vec v_{\\mathrm{Q}}-\\vec v_{\\mathrm{P}}$ は「P の矢印の先から Q の矢印の先へ」の矢印です。その向きは、P と Q のまん中から**円の中心へ向かう**向きです。Q を P に近づけても、$\\Delta\\vec v$ はいつも中心を向きます（向心加速度）。',
      miss: '速さが同じでも、向きが変われば速度は変わります（$\\Delta\\vec v\\neq\\vec 0$）。10 m/s のまま 90° 曲がると、$|\\Delta\\vec v|=10\\sqrt2\\approx14.1$ m/s です。',
      legend: [['P での速度 $\\vec v_{\\mathrm{P}}$', { color: 'a' }], ['Q での速度 $\\vec v_{\\mathrm{Q}}$', { color: 'b', style: 'dash' }], ['$\\Delta\\vec v$', { color: 'd', style: 'long' }], ['中心への向き', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'dth', label: 'P と Q の角', min: 2, max: 180, step: 1, fmt: v => Math.round(v) + '°' }, { button: '90°（交差点を曲がる）', act: st => { st.dth = 90; } }],
      init(st) { st.dth = 180; },
      step(st, dt) { st.dth = Math.max(2, st.dth - dt * 30); if (st.dth <= 2) return false; },
      draw(cv, st) { drawD(cv, st); },
      readout: st => `$|\\Delta\\vec v|$ ＝ 2 × 10 × sin(${A.num(st.dth / 2, 1)}°) ＝ <b>${A.num(20 * Math.sin(st.dth / 2 * D22), 2)} m/s</b>（速さは 10 m/s のまま）`
    },
    {
      key: 'kasoku', label: '③ 速度の矢印の先も回る',
      lead: '速度の矢印の根もとを1か所に集めます（右）。矢印の先は、どんな動きをするでしょう。',
      note: '速度の矢印の先は、半径 $v=r\\omega$ の円の上を、同じ角速度 $\\omega$ で回ります。だから、速度が1秒に変わる量（加速度）の大きさは $v\\omega=r\\omega^2$ で、向きは $-\\vec e_r$（中心の向き）です。$r=0.5$ m、$\\omega=4$ rad/s なら $0.5\\times4^2=8$ m/s²。',
      legend: [['速度 $\\vec v$', { color: 'c' }], ['加速度（中心の向き）', { color: 'd', style: 'long' }], ['速度の矢印の先が通る円', { color: 'c', style: 'dot' }]],
      controls: [
        { range: 'r', label: '半径 $r$', min: 0.3, max: 0.6, step: 0.05, fmt: v => A.num(v, 2) + ' m' },
        { range: 'w', label: '角速度 $\\omega$', min: 1, max: 5, step: 0.5, fmt: v => A.num(v, 1) + ' rad/s' }
      ],
      init(st) { st.th = 30; st.r = 0.5; st.w = 4; },
      step(st, dt) { st.th = (st.th + dt * st.w * 15) % 360; },
      draw(cv, st) { drawK(cv, st); },
      readout: st => `速さ $v$ ＝ ${A.num(st.r * st.w, 2)} m/s　　加速度の大きさ $r\\omega^2$ ＝ ${A.num(st.r, 2)} × ${A.num(st.w, 1)}² ＝ <b>${A.num(st.r * st.w * st.w, 2)} m/s²</b>（中心の向き）`
    }
  ]
});

// キャンバスの文字：「e_r」「v_P」のように、_ のあとの1文字を下つきにする
function rt(cv, s, x, y, o) {
  const parts = []; let k = 0;
  while (k < s.length) { if (s[k] === '_' && k + 1 < s.length) { parts.push([s[k + 1], true]); k += 2; } else { let j = k; while (j < s.length && s[j] !== '_') j++; parts.push([s.slice(k, j), false]); k = j; } }
  const g = cv.g, size = o.size || 15, sub = Math.max(13, Math.round(size * 0.75));
  const font = z => `${o.bold ? 'bold ' : ''}${z}px ${cv.fontFamily}`;
  let w = 0; for (const [t, b] of parts) { g.font = font(b ? sub : size); w += g.measureText(t).width; }
  let X = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = A.color(o.color);
  for (const [t, b] of parts) { g.font = font(b ? sub : size); g.fillText(t, X, b ? y + size * 0.3 : y); X += g.measureText(t).width; }
  return w;
}
function arcD(v, c, r, a0, a1, o) { const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) / 3)), pts = []; for (let k = 0; k <= n; k++) { const a = (a0 + (a1 - a0) * k / n) * D22; pts.push([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]); } v.line(pts, o); }

function drawS(cv, st) {
  const v = cv.view({ x0: -1.1, x1: 1.1, y0: -1.1, y1: 1.1, box: [10, 10, 480, 400], equal: true });
  v.axes({ xt: [-1, -0.5, 0.5, 1], yt: [-1, -0.5, 0.5, 1], xl: 'x（m）', yl: 'y' });
  const t = st.th * D22, r = st.r, P = [r * Math.cos(t), r * Math.sin(t)], er = [Math.cos(t), Math.sin(t)], et = [-Math.sin(t), Math.cos(t)];
  v.circle(0, 0, r, { color: 'sub', width: 1.5 });
  v.line([[0, 0], P], { color: 'sub', width: 1.2 });
  arcD(v, [0, 0], 0.12, 0, st.th, { color: 'ink', width: 1.2 });
  const L = 0.18, vs = 0.15; // 単位ベクトルの長さ（図の上）、速度は 1 m/s を 0.15 m でかく
  const V = r * st.w * vs;
  v.arrow(P[0], P[1], P[0] + V * et[0], P[1] + V * et[1], { color: 'c', width: 6, alpha: 0.75 });
  v.arrow(P[0], P[1], P[0] + L * er[0], P[1] + L * er[1], { color: 'b', width: 3 });
  v.arrow(P[0], P[1], P[0] + L * et[0], P[1] + L * et[1], { color: 'a', width: 2.5, style: 'dash' });
  v.dot(P[0], P[1], { r: 6 });
  v.text('P', P[0] - 0.1 * et[0] + 0.05 * er[0], P[1] - 0.1 * et[1] + 0.05 * er[1], { size: 17, bold: true, math: true, italic: true, align: 'center' });
  rt(cv, 'e_r', v.X(P[0] + (L + 0.07) * er[0]), v.Y(P[1] + (L + 0.07) * er[1]), { size: 16, color: 'b', align: 'center', bold: true });
  rt(cv, 'e_θ', v.X(P[0] + (L + 0.02) * et[0] - 0.08 * er[0]), v.Y(P[1] + (L + 0.02) * et[1] - 0.08 * er[1]), { size: 16, color: 'a', align: 'center', bold: true });
  v.text('v', P[0] + (V + 0.06) * et[0], P[1] + (V + 0.06) * et[1], { size: 17, color: 'c', bold: true, math: true, italic: true, align: 'center', bg: true });
  // 右：数
  const X = 520; let y = 44; const T = (s, o) => { rt(cv, s, X, y, Object.assign({ size: 16 }, o)); y += 29; };
  T('θ ＝ ' + Math.round(st.th) + '°', { bold: true });
  T('e_r ＝ (cosθ, sinθ) ＝ (' + A.num(er[0], 3) + ', ' + A.num(er[1], 3) + ')', { color: 'b', size: 15 });
  T('e_θ ＝ (−sinθ, cosθ) ＝ (' + A.num(et[0], 3) + ', ' + A.num(et[1], 3) + ')', { color: 'a', size: 15 });
  T('e_r と e_θ はいつも直角（内積 0）', { color: 'sub', size: 15 });
  y += 8;
  T('速さ v ＝ rω ＝ ' + A.num(r * st.w, 2) + ' m/s', { bold: true, color: 'c' });
  T('v ＝ rω e_θ', { color: 'c' });
  T('　＝ (' + A.num(-r * st.w * Math.sin(t), 3) + ', ' + A.num(r * st.w * Math.cos(t), 3) + ')', { color: 'c' });
  y += 8;
  T('（速度の矢印は 1 m/s を 0.15 m でかいた）', { color: 'sub', size: 14 });
}

function drawD(cv, st) {
  const v = cv.view({ x0: -1.3, x1: 1.3, y0: -1.25, y1: 1.35, box: [10, 10, 440, 400], equal: true });
  const R = 1, d = st.dth, a = 45 - d / 2, b = 45 + d / 2;
  const P = [R * Math.cos(a * D22), R * Math.sin(a * D22)], Q = [R * Math.cos(b * D22), R * Math.sin(b * D22)];
  const tP = [-Math.sin(a * D22), Math.cos(a * D22)], tQ = [-Math.sin(b * D22), Math.cos(b * D22)], k = 0.045; // 1 m/s を 0.045 でかく
  v.circle(0, 0, R, { color: 'sub', width: 1.5 });
  arcD(v, [0, 0], R, a, b, { color: 'ink', width: 3 });
  v.dot(0, 0, { r: 5 }); v.text('中心', 0.05, -0.1, { size: 15 });
  v.arrow(P[0], P[1], P[0] + 10 * k * tP[0], P[1] + 10 * k * tP[1], { color: 'a', width: 3 });
  v.arrow(Q[0], Q[1], Q[0] + 10 * k * tQ[0], Q[1] + 10 * k * tQ[1], { color: 'b', width: 3, style: 'dash' });
  v.dot(P[0], P[1], { r: 6 }); v.dot(Q[0], Q[1], { r: 6, shape: 'square' });
  v.text('P', P[0] + 0.1 * Math.cos(a * D22), P[1] + 0.1 * Math.sin(a * D22), { size: 17, bold: true, align: 'center' });
  v.text('Q', Q[0] + 0.1 * Math.cos(b * D22), Q[1] + 0.1 * Math.sin(b * D22), { size: 17, bold: true, align: 'center' });
  // まん中から中心への向き
  const M = [Math.cos(45 * D22), Math.sin(45 * D22)];
  v.line([[0, 0], M], { color: 'sub', style: 'dot', width: 2 });
  const dv = [10 * (tQ[0] - tP[0]), 10 * (tQ[1] - tP[1])], m = Math.hypot(dv[0], dv[1]);
  if (m > 0.01) { const s = 0.4 / m; v.arrow(M[0] * 0.92, M[1] * 0.92, M[0] * 0.92 + dv[0] * s, M[1] * 0.92 + dv[1] * s, { color: 'd', width: 3.5, style: 'long' }); v.text('Δv の向き', M[0] * 0.5 + 0.12, M[1] * 0.5 - 0.12, { size: 15, color: 'd', bold: true, bg: true }); }
  // 右：始点をそろえる
  const w = cv.view({ x0: -13, x1: 13, y0: -6, y1: 13, box: [470, 30, 390, 290], equal: true });
  const o = [0, 0], A1 = [10 * tP[0], 10 * tP[1]], B1 = [10 * tQ[0], 10 * tQ[1]];
  w.circle(0, 0, 10, { color: 'grid', width: 1 });
  w.arrow(0, 0, A1[0], A1[1], { color: 'a', width: 3 });
  w.arrow(0, 0, B1[0], B1[1], { color: 'b', width: 3, style: 'dash' });
  if (m > 0.05) w.arrow(A1[0], A1[1], B1[0], B1[1], { color: 'd', width: 3.5, style: 'long' });
  w.dot(o[0], o[1], { r: 4 });
  rt(cv, 'v_P', w.X(A1[0] * 1.13), w.Y(A1[1] * 1.13), { size: 16, color: 'a', align: 'center', bold: true });
  rt(cv, 'v_Q', w.X(B1[0] * 1.13), w.Y(B1[1] * 1.13), { size: 16, color: 'b', align: 'center', bold: true });
  if (m > 2) w.text('Δv', (A1[0] + B1[0]) / 2 + 1.2, (A1[1] + B1[1]) / 2 - 1.2, { size: 16, color: 'd', bold: true, bg: true });
  cv.text('始点をそろえる（半径 10 m/s の円）', 480, 22, { size: 15, color: 'sub' });
  cv.text('|Δv| ＝ ' + A.num(m, 2) + ' m/s', 480, 350, { size: 18, bold: true, color: 'd' });
  cv.text('速さはどちらも 10 m/s', 480, 380, { size: 15, color: 'sub' });
}

function drawK(cv, st) {
  const t = st.th * D22, r = st.r, w = st.w, vv = r * w;
  const L = cv.view({ x0: -1, x1: 1, y0: -1, y1: 1, box: [10, 20, 400, 360], equal: true });
  L.axes({ xt: [-0.5, 0.5], yt: [-0.5, 0.5], xl: 'x', yl: 'y' });
  const P = [r * Math.cos(t), r * Math.sin(t)], et = [-Math.sin(t), Math.cos(t)], er = [Math.cos(t), Math.sin(t)];
  L.circle(0, 0, r, { color: 'sub', width: 1.5 });
  const ks = 0.1; // 1 m/s を 0.1 m でかく
  L.arrow(P[0], P[1], P[0] + vv * ks * et[0], P[1] + vv * ks * et[1], { color: 'c', width: 3.5 });
  const la = Math.min(r * w * w * 0.02, 0.9 * r); // 1 m/s² を 0.02 m でかく（中心をこえないように）
  L.arrow(P[0], P[1], P[0] - la * er[0], P[1] - la * er[1], { color: 'd', width: 3.5, style: 'long' });
  L.dot(P[0], P[1], { r: 6 }); L.dot(0, 0, { r: 4 });
  cv.text('回る点（位置）', 20, 372, { size: 15, color: 'sub' });
  // 右：速度の矢印を集める（ホドグラフ）
  const R = cv.view({ x0: -5.5, x1: 5.5, y0: -5.5, y1: 5.5, box: [440, 20, 420, 360], equal: true });
  R.axes({ xt: [-4, -2, 2, 4], yt: [-4, -2, 2, 4], xl: 'vx', yl: 'vy' });
  R.circle(0, 0, vv, { color: 'c', width: 1.5, style: 'dot' });
  const V = [vv * et[0], vv * et[1]];
  R.arrow(0, 0, V[0], V[1], { color: 'c', width: 3.5 });
  const aa = r * w * w, s = Math.min(0.25, 2.5 / aa);
  R.arrow(V[0], V[1], V[0] - aa * s * er[0], V[1] - aa * s * er[1], { color: 'd', width: 3.5, style: 'long' });
  R.dot(V[0], V[1], { r: 6, color: 'c' });
  cv.text('速度の矢印を1か所に集める（m/s）', 450, 372, { size: 15, color: 'sub' });
  cv.text('矢印の先の円の半径 ＝ v ＝ ' + A.num(vv, 2) + ' m/s', 450, 395, { size: 15, color: 'c' });
}
