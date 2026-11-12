// @id m4-02
// @title 回転行列：点を回す・軸を回す
// @vol 数学7
// @from 数学 7-6 図7・5（ch7-06:567・396）
'use strict';
const D2R = Math.PI / 180;
const n3 = v => A.num(v, Math.abs(v - Math.round(v)) < 0.0005 ? 0 : 3);
const Rp = (d, p) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [c * p[0] - s * p[1], s * p[0] + c * p[1]]; };
// 行列を、かっこつきでキャンバスに書く（rowsHL：行をぬる、colsHL：列をぬる）
function mat(cv, x, y, M, o = {}) {
  const w = 74, h = 30;
  if (o.colHL) { cv.rect(x + 6, y - h - 2, w, 2 * h + 4, { fill: o.colHL, alpha: 0.15 }); }
  if (o.rowHL) { cv.rect(x + 6, y - h - 2, 2 * w, h + 2, { fill: o.rowHL, alpha: 0.15 }); }
  cv.line([[x + 6, y - h - 4], [x, y - h - 4], [x, y + h + 4], [x + 6, y + h + 4]], { color: 'ink', width: 1.6 });
  cv.line([[x + 2 * w + 6, y - h - 4], [x + 2 * w + 12, y - h - 4], [x + 2 * w + 12, y + h + 4], [x + 2 * w + 6, y + h + 4]], { color: 'ink', width: 1.6 });
  [M[0], M[1], M[2], M[3]].forEach((v, k) => cv.text(n3(v), x + 6 + w * (k % 2 + 0.5), y + (k < 2 ? -h / 2 : h / 2), { align: 'center', size: 17 }));
  if (o.name) cv.text(o.name, x - 8, y, { align: 'right', size: 17, bold: true });
}
const RM = d => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [c, -s, s, c]; };

function drawTen(cv, st) {
  const th = st.th, v = cv.view({ x0: -6.6, x1: 6.6, y0: -1.6, y1: 6.6, box: [14, 10, 540, 420], equal: true });
  v.axes({ xt: [-6, -4, -2, 2, 4, 6], yt: [2, 4, 6], xl: 'x', yl: 'y' });
  // 回した方眼（1目もり）
  v.clip(() => { for (let i = -8; i <= 8; i++) { v.line([Rp(th, [i, -8]), Rp(th, [i, 8])], { color: 'a', width: 1, alpha: 0.25 }); v.line([Rp(th, [-8, i]), Rp(th, [8, i])], { color: 'a', width: 1, alpha: 0.25 }); } });
  // A・B の通る円
  v.param(t => 4 * Math.cos(t), t => 4 * Math.sin(t), 0, 2 * Math.PI, { color: 'b', style: 'dash', width: 1.2, alpha: 0.6 });
  v.param(t => 5.657 * Math.cos(t), t => 5.657 * Math.sin(t), 0, 2 * Math.PI, { color: 'c', style: 'dot', width: 1.5, alpha: 0.7 });
  const T0 = [[0, 0], [4, 0], [4, 4]];
  v.poly(T0, { color: 'sub', style: 'dot', width: 1.5 });
  const T = T0.map(p => Rp(th, p));
  v.poly(T, { fill: 'a', alpha: 0.2, color: 'a', width: 3 });
  // 回した物差しの矢印
  const ex = Rp(th, [1, 0]), ey = Rp(th, [0, 1]);
  v.arrow(0, 0, ex[0], ex[1], { color: 'b', width: 3.5 }); v.arrow(0, 0, ey[0], ey[1], { color: 'c', width: 3.5, style: 'dash' });
  v.text("e'x", ex[0] * 1.35 + 0.1, ex[1] * 1.35 - 0.25, { size: 15, color: 'b', math: true, italic: true });
  v.text("e'y", ey[0] * 1.4 - 0.2, ey[1] * 1.4 + 0.1, { size: 15, color: 'c', math: true, italic: true });
  v.dot(T[1][0], T[1][1], { color: 'b', r: 6, shape: 'square' }); v.dot(T[2][0], T[2][1], { color: 'c', r: 6, shape: 'tri' });
  v.text("A'", T[1][0] + 0.3, T[1][1] - 0.3, { size: 16, bold: true, bg: true }); v.text("B'", T[2][0] + 0.25, T[2][1] + 0.35, { size: 16, bold: true, bg: true });
  // 角の弧
  const arc = []; for (let k = 0; k <= 30; k++) arc.push([2.4 * Math.cos(th * D2R * k / 30), 2.4 * Math.sin(th * D2R * k / 30)]);
  if (th > 2) { v.line(arc, { color: 'd', width: 2 }); v.text(Math.round(th) + '°', 2.95 * Math.cos(th * D2R / 2), 2.95 * Math.sin(th * D2R / 2), { size: 15, color: 'd', align: 'center', bg: true }); }
  // 右の札
  const x = 590;
  cv.text('回転行列 R(θ)', x, 34, { size: 15, color: 'sub' });
  mat(cv, x + 6, 92, RM(th));
  cv.text('1列め＝e\'x の行き先', x, 150, { size: 14, color: 'b' }); cv.text('2列め＝e\'y の行き先', x, 172, { size: 14, color: 'c' });
  const a = T[1], b = T[2];
  cv.text("A' ＝ R(θ)(4, 0)", x, 218, { size: 15 }); cv.text('＝ (' + A.num(a[0], 2) + ', ' + A.num(a[1], 2) + ')', x + 20, 242, { size: 16, bold: true });
  cv.text("B' ＝ R(θ)(4, 4)", x, 280, { size: 15 }); cv.text('＝ (' + A.num(b[0], 2) + ', ' + A.num(b[1], 2) + ')', x + 20, 304, { size: 16, bold: true });
  cv.text('B は 45° をいちいち考えなくても、', x, 350, { size: 14, color: 'sub' });
  cv.text('同じ行列をかけるだけで回せる。', x, 372, { size: 14, color: 'sub' });
}

function drawJiku(cv, st) {
  const th = st.th, u = st.u, turn = -th * u;   // 紙ごと −θu 回す
  const v = cv.view({ x0: -1.5, x1: 5.5, y0: -1.2, y1: 5.2, box: [14, 10, 540, 420], equal: true });
  const W = p => Rp(turn, p);
  // もとの軸（灰）
  const ax = (a, b, o) => { const p = W(a), q = W(b); v.arrow(p[0], p[1], q[0], q[1], o); };
  ax([-1, 0], [5, 0], { color: 'sub', width: 1.5, head: 9 }); ax([0, -1], [0, 5], { color: 'sub', width: 1.5, head: 9 });
  let p = W([5.2, 0]); v.text('x', p[0], p[1] - 0.25, { size: 15, color: 'sub', math: true, italic: true });
  p = W([0, 5.2]); v.text('y', p[0] + 0.2, p[1], { size: 15, color: 'sub', math: true, italic: true });
  // 新しい軸 x'・y'（θ 回した軸）
  const N = q => W(Rp(th, q));
  for (let i = 1; i <= 4; i++) { const a = N([i, -0.1]), b = N([i, 0.1]); v.line([a, b], { color: 'a', width: 1.5 }); const c = N([-0.1, i]), d = N([0.1, i]); v.line([c, d], { color: 'a', width: 1.5 }); }
  let a0 = N([-0.6, 0]), a1 = N([5, 0]); v.arrow(a0[0], a0[1], a1[0], a1[1], { color: 'a', width: 3 });
  a0 = N([0, -0.6]); a1 = N([0, 4.4]); v.arrow(a0[0], a0[1], a1[0], a1[1], { color: 'a', width: 3, style: 'dash' });
  p = N([5.25, 0.25]); v.text("x'", p[0], p[1], { size: 17, color: 'a', bold: true });
  p = N([-0.35, 4.5]); v.text("y'", p[0], p[1], { size: 17, color: 'a', bold: true });
  // P と、新しい軸への足
  const P = [2, 4], q = Rp(-th, P);  // 新しい軸での座標 (x', y')
  const Pw = W(P), fx = N([q[0], 0]), fy = N([0, q[1]]);
  v.line([fx, Pw, fy], { color: 'a', style: 'dash', width: 1.5 });
  v.dot(Pw[0], Pw[1], { color: 'b', r: 7 });
  v.text('P', Pw[0] + 0.15, Pw[1] + 0.25, { size: 17, bold: true, bg: true });
  // 角の弧（もとの x 軸から x' 軸へ）
  const arc = []; for (let k = 0; k <= 20; k++) arc.push(W(Rp(th * k / 20, [1.3, 0])));
  v.line(arc, { color: 'd', width: 2 });
  p = W(Rp(th / 2, [1.75, 0])); v.text(Math.round(th) + '°', p[0], p[1], { size: 15, color: 'd', align: 'center', bg: true });
  const x = 590;
  cv.text(u < 0.5 ? '(a) 点はそのまま、軸を ' + Math.round(th) + '° 回す' : '(b) 軸はそのまま、点を −' + Math.round(th) + '° 回す', x, 34, { size: 15, bold: true });
  cv.text('新しい軸で読んだ P の座標', x, 80, { size: 15, color: 'sub' });
  cv.text("x' ＝ " + A.num(q[0], 3) + "　y' ＝ " + A.num(q[1], 3), x, 108, { size: 18, bold: true });
  cv.text('＝ R(θ)ᵀ をかけたもの', x, 150, { size: 15 });
  mat(cv, x + 6, 210, [Math.cos(th * D2R), Math.sin(th * D2R), -Math.sin(th * D2R), Math.cos(th * D2R)], { rowHL: 'a' });
  cv.text('行が、新しい軸の向きの矢印', x, 268, { size: 14, color: 'a' });
  cv.text('軸が左に回る ＝ 点が右に回る', x, 320, { size: 15, bold: true });
  cv.text('▶ で、紙ごと右に回して (b) にする', x, 380, { size: 14, color: 'sub' });
}

function drawModosu(cv, st) {
  const th = st.th, t = st.t, P = [3, 1];
  const ang = t <= 1 ? th * t : th * (2 - t);
  const v = cv.view({ x0: -4, x1: 4, y0: -2, y1: 4, box: [14, 10, 540, 420], equal: true });
  v.axes({ xt: [-3, -2, -1, 1, 2, 3], yt: [-1, 1, 2, 3], xl: 'x', yl: 'y' });
  v.param(s => Math.hypot(...P) * Math.cos(s), s => Math.hypot(...P) * Math.sin(s), 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.2 });
  v.dot(P[0], P[1], { color: 'sub', r: 6, open: true });
  v.text('P (3, 1)', P[0] + 0.15, P[1] - 0.35, { size: 15, color: 'sub' });
  const Q = Rp(th, P), C = Rp(ang, P);
  if (t > 1) { v.dot(Q[0], Q[1], { color: 'b', r: 6, shape: 'square' }); v.text("R(θ)P", Q[0] + 0.15, Q[1] + 0.3, { size: 15, color: 'b' }); }
  v.arrow(0, 0, C[0], C[1], { color: t <= 1 ? 'b' : 'c', width: 3, style: t <= 1 ? 'solid' : 'dash' });
  v.dot(C[0], C[1], { color: t <= 1 ? 'b' : 'c', r: 7, shape: t <= 1 ? 'square' : 'diamond' });
  const x = 590;
  cv.text(t <= 1 ? '① R(θ) をかける（左に ' + Math.round(th) + '°）' : '② R(θ)ᵀ をかける（右に ' + Math.round(th) + '°）', x, 34, { size: 15, bold: true, color: t <= 1 ? 'b' : 'c' });
  mat(cv, x + 34, 100, RM(th), { name: 'R', colHL: 'b' });
  mat(cv, x + 34, 200, [Math.cos(th * D2R), Math.sin(th * D2R), -Math.sin(th * D2R), Math.cos(th * D2R)], { name: 'Rᵀ', rowHL: 'c' });
  cv.text('R の列が、そのまま Rᵀ の行', x, 262, { size: 15 });
  cv.text('RᵀR ＝ I（何もしない行列）', x, 300, { size: 16, bold: true });
  cv.text('だから Rᵀ ＝ R⁻¹ ＝ R(−θ)', x, 330, { size: 16, bold: true });
}

A.item({
  id: 'm4-02', title: '回転行列：点を回す・軸を回す',
  from: '数学 第7巻 7-6「回転行列」の図から（8-5 図7、物理 力-7 でも使う）',
  W: 880, H: 440,
  state: { th: 30, u: 0, t: 0 },
  scenes: [
    {
      key: 'ten', label: '① 点を回す',
      lead: '三角定規 OAB を、方眼紙ごと O のまわりに回します。▶ で回してみましょう。',
      note: '方眼ごと回すと、物差しの矢印 $\\vec e_x$ は $(\\cos\\theta,\\ \\sin\\theta)$ へ、$\\vec e_y$ は $(-\\sin\\theta,\\ \\cos\\theta)$ へ行きます。この2つを列に並べたのが回転行列 $R(\\theta)$ です。30° なら A′ は $(3.46,\\ 2)$、B′ は $(1.46,\\ 5.46)$ で、本の表と同じです。',
      miss: '左回りの回転行列の1行めは $(\\cos\\theta,\\ -\\sin\\theta)$ です。$(\\cos\\theta,\\ \\sin\\theta)$ ではありません（それは1**列**め）。',
      state: { th: 0 },
      legend: [['はじめの三角形', { color: 'sub', style: 'dot' }], ['回した三角形', { color: 'a' }], ["$\\vec e_x$ の行き先（1列め）", { color: 'b' }], ["$\\vec e_y$ の行き先（2列め）", { color: 'c', style: 'dash' }], ['A の通る円（半径4）', { color: 'b', style: 'dash' }], ['B の通る円（半径5.66）', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'th', label: '回す角 $\\theta$', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.th += 30 * dt; if (st.th >= 360) { st.th = 360; return false; } },
      draw: drawTen,
      readout: st => `$\\theta=${Math.round(st.th)}°$：$\\cos\\theta=${n3(Math.cos(st.th * D2R))}$、$\\sin\\theta=${n3(Math.sin(st.th * D2R))}$`
    },
    {
      key: 'jiku', label: '② 軸を回して見る',
      lead: '点 P $(2,\\ 4)$ はそのままで、軸のほうを回して見ます。▶ で紙ごと回すと、何が見えるでしょう。',
      note: '新しい軸が横・たてになるように紙ごと回すと、P は右に $\\theta$（$-\\theta$）回ったように見えます。だから、新しい座標は $R(-\\theta)=R(\\theta)^{\\text{T}}$ をかけて求めます。30° なら $(x\',\\ y\')=(3.732,\\ 2.464)$ です。',
      miss: '軸を30°回して見た座標は $R(30°)\\vec{\\mathrm{OP}}$ ではなく、$R(30°)^{\\text{T}}\\vec{\\mathrm{OP}}$ です。軸が左に回ると、点は右に回ったように見えます。',
      state: { th: 30, u: 0 },
      legend: [["新しい軸 $x'$・$y'$", { color: 'a' }], ['もとの軸 $x$・$y$', { color: 'sub' }], ['P から新しい軸への足', { color: 'a', style: 'dash' }]],
      controls: [{ range: 'th', label: '軸を回す角', min: 0, max: 90, step: 1, fmt: v => Math.round(v) + '°' }, { seg: 'u', label: '見方', options: [[0, '(a) 軸を回す'], [1, '(b) 紙ごと回す']] }],
      step(st, dt) { st.u = Math.min(1, st.u + dt * 0.5); if (st.u >= 1) return false; },
      draw: drawJiku,
      readout: st => { const q = Rp(-st.th, [2, 4]); return `$x'=\\cos${Math.round(st.th)}°\\times2+\\sin${Math.round(st.th)}°\\times4=${n3(q[0])}$　　$y'=-\\sin${Math.round(st.th)}°\\times2+\\cos${Math.round(st.th)}°\\times4=${n3(q[1])}$`; }
    },
    {
      key: 'modosu', label: '③ 転置でもどす',
      lead: '点 P を $R(\\theta)$ で回してから、$R(\\theta)^{\\text{T}}$ をかけます。▶ で、どこへ行くか見ましょう。',
      note: '$R(\\theta)$ の列は長さ1で、たがいに直角です。だから $R^{\\text{T}}R=I$ で、転置するだけで逆行列になります：$R(\\theta)^{-1}=R(\\theta)^{\\text{T}}=R(-\\theta)$。逆行列の公式（$ad-bc$ でわる）を使わなくてもよいのは、回転の行列式が1だからです。',
      state: { th: 60, t: 0 },
      legend: [['① $R(\\theta)$ で回した点', { color: 'b', shape: 'square' }], ['② $R(\\theta)^{\\text{T}}$ をかけた点', { color: 'c', shape: 'diamond', style: 'dash' }], ['はじめの点 P', { color: 'sub', shape: 'circle', noline: true }]],
      controls: [{ range: 'th', label: '角 $\\theta$', min: 0, max: 180, step: 1, fmt: v => Math.round(v) + '°', on: st => { st.t = 0; } }],
      step(st, dt) { st.t = Math.min(2, st.t + dt * 0.5); if (st.t >= 2) return false; },
      draw: drawModosu,
      readout: st => st.t >= 2 ? 'P にもどった：$R(\\theta)^{\\text{T}}R(\\theta)\\vec p=\\vec p$' : st.t > 1 ? '$R(\\theta)^{\\text{T}}$ をかけている（右回り）' : '$R(\\theta)$ をかけている（左回り）'
    }
  ]
});
