// @id p1-11
// @title 2本の腕：手をねらった所へ（逆運動学）
// @vol 物理1
// @from 物理 力-7 ②③⑦（p1-07 の2本の腕の図・逆運動学のプログラム・ヤコビ行列と特異姿勢）、まちがえやすいところ
'use strict';
// 腕の長さは本と同じ l₁＝0.30 m、l₂＝0.25 m。角は左回りが正（θ₂ は上の腕をまっすぐのばした向きから）。
const L1 = 0.30, L2 = 0.25;
function ik(x, y, up) {
  const d2 = x * x + y * y, c = (d2 - L1 * L1 - L2 * L2) / (2 * L1 * L2);
  if (c > 1 + 1e-9 || c < -1 - 1e-9) return null;
  const t2 = (up ? -1 : 1) * Math.acos(A.clamp(c, -1, 1));
  const t1 = Math.atan2(y, x) - Math.atan2(L2 * Math.sin(t2), L1 + L2 * Math.cos(t2));
  return [t1, t2];
}
const deg = r => r * 180 / Math.PI;
A.item({
  id: 'p1-11', title: '2本の腕：手をねらった所へ（逆運動学）',
  from: '物理 第1巻『力学』 力-7 ② の図（2本の腕）、③ 逆運動学のプログラム、⑦ ヤコビ行列と特異姿勢から（数学 4-0・4-7・7-6 でも使う）',
  W: 880, H: 440,
  state: { px: 0.40, py: 0.20, up: false, yy: 0, t1: 30, t2: 45 },
  scenes: [
    {
      key: 'gyaku', label: '① 手をドラッグ',
      lead: '手（P）をドラッグして、ねらった所へ動かしましょう。手の位置を決めると、2つの角はいくつになるでしょう。',
      note: '手の位置を決めても、角の組はふつう**2通り**あります（ひじが下・ひじが上）。$\\cos\\theta_2=\\dfrac{x^2+y^2-l_1^2-l_2^2}{2l_1l_2}$ の $\\theta_2$ に $+$ と $-$ があるからです。肩からの距離が $l_1+l_2=0.55$ m より遠い所や、$|l_1-l_2|=0.05$ m より近い所には、手は届きません（ぬった輪の外）。',
      miss: '「手の位置を決めれば、関節の角は1つに決まる」はまちがい。ふつう2通り（ひじが上と下）、届かない所では0通りです。',
      legend: [['ひじが下の腕', { color: 'a' }], ['ひじが上の腕', { color: 'b', style: 'dash' }], ['手が届く所', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ seg: 'up', label: '太くかく腕', options: [[false, 'ひじが下'], [true, 'ひじが上']] }, { button: 'P を (0.40, 0.20) にもどす', act: st => { st.px = 0.40; st.py = 0.20; } }],
      drag: { hit: (st, x, y, api) => 'p', move(st, x, y) { const [a, b] = view1().inv(x, y); st.px = A.clamp(a, -0.6, 0.6); st.py = A.clamp(b, -0.6, 0.62); } },
      draw: drawIK,
      readout: st => { const lo = ik(st.px, st.py, false), hi = ik(st.px, st.py, true), d = Math.hypot(st.px, st.py); return `P（${A.num(st.px, 2)}, ${A.num(st.py, 2)}）　肩からの距離 ${A.num(d, 3)} m　　` + (lo ? `ひじが下：$\\theta_1$ ＝ ${A.num(deg(lo[0]), 2)}°、$\\theta_2$ ＝ ${A.num(deg(lo[1]), 2)}°　　ひじが上：$\\theta_1$ ＝ ${A.num(deg(hi[0]), 2)}°、$\\theta_2$ ＝ ${A.num(deg(hi[1]), 2)}°` : '<b>届かない（答えがない）</b>'); }
    },
    {
      key: 'massugu', label: '② まっすぐ上へ',
      lead: '手を直線 $x=0.40$ m の上で、$y=0$ から 0.30 m まで動かします。肩とひじの角は、どう変わるでしょう。',
      note: '手が上へ動くにつれて、肩の角 $\\theta_1$ は増え、ひじの角 $\\theta_2$ は減っていきます（$y=0$ で $-38.6°$・$87.1°$、0.30 m で $14.5°$・$49.5°$：本のプログラムの結果）。2つの角が決まった組み合わせで同時に変わると、手はまっすぐ動きます。',
      legend: [['肩の角 $\\theta_1$', { color: 'a' }], ['ひじの角 $\\theta_2$', { color: 'b', style: 'dash' }], ['手の通る直線', { color: 'sub', style: 'dot' }]],
      controls: [{ range: 'yy', label: '手の高さ $y$〔m〕', min: 0, max: 0.3, step: 0.005, d: 3 }],
      init(st) { st.yy = 0; st.dir = 1; },
      step(st, dt) { st.yy += st.dir * dt * 0.06; if (st.yy > 0.3) { st.yy = 0.3; st.dir = -1; } if (st.yy < 0) { st.yy = 0; st.dir = 1; } },
      draw: drawLine,
      readout: st => { const s = ik(0.4, st.yy, false); return `$y$ ＝ ${A.num(st.yy, 3)} m　　$\\theta_1$ ＝ <b>${A.num(deg(s[0]), 1)}°</b>　　$\\theta_2$ ＝ <b>${A.num(deg(s[1]), 1)}°</b>`; }
    },
    {
      key: 'tokui', label: '③ ヤコビ行列と特異姿勢',
      lead: 'ひじの角 $\\theta_2$ を 0 に近づけて、腕をまっすぐにしてみましょう。手が動ける向きはどうなるでしょう。',
      note: 'ヤコビ行列 $J$ の1列めは「肩だけを回したときの手の速度」、2列めは「ひじだけを回したときの手の速度」です（どちらも 1 rad/s のとき）。$\\det J=l_1l_2\\sin\\theta_2$ は2つの矢印がつくる平行四辺形の面積。腕がまっすぐ（$\\theta_2\\to0$）になると、2つの矢印が同じ向きになり、面積は0。手は腕にそった向きには、どう関節を回しても動かせません（**特異姿勢**）。',
      legend: [['肩だけを回したときの手の速度（1列め）', { color: 'a', style: 'dash' }], ['ひじだけを回したときの手の速度（2列め）', { color: 'd', style: 'dashdot' }], ['平行四辺形（面積＝$\\det J$）', { color: 'c', shape: 'square', noline: true }]],
      controls: [{ range: 't2', label: 'ひじの角 $\\theta_2$', min: -150, max: 150, step: 1, fmt: v => v + '°' }, { range: 't1', label: '肩の角 $\\theta_1$', min: -90, max: 150, step: 1, fmt: v => v + '°' }],
      draw: drawJ,
      readout: st => { const t2 = st.t2 * Math.PI / 180; return `$\\det J$ ＝ 0.30 × 0.25 × sin ${st.t2}° ＝ <b>${A.num(L1 * L2 * Math.sin(t2), 4)}</b>` + (Math.abs(st.t2) < 3 ? '　　腕がまっすぐ：特異姿勢' : ''); }
    }
  ]
});

function view1(cv) { return new A.View(cv || { W: 880, H: 440 }, { x0: -0.62, x1: 0.62, y0: -0.6, y1: 0.62, box: [10, 10, 560, 420], equal: true }); }
function arm(v, t1, t2, o) {
  const E = [L1 * Math.cos(t1), L1 * Math.sin(t1)], P = [E[0] + L2 * Math.cos(t1 + t2), E[1] + L2 * Math.sin(t1 + t2)];
  v.line([[0, 0], E, P], o);
  v.dot(E[0], E[1], { color: o.color, r: 5, open: true });
  return { E, P };
}
function annulus(v) {
  const outer = [], inner = [];
  for (let k = 0; k <= 72; k++) { const a = 2 * Math.PI * k / 72; outer.push([0.55 * Math.cos(a), 0.55 * Math.sin(a)]); inner.push([0.05 * Math.cos(-a), 0.05 * Math.sin(-a)]); }
  v.poly(outer, { fill: 'c', alpha: 0.1 }); v.poly(inner, { fill: 'bg', alpha: 1 });
  v.circle(0, 0, 0.55, { color: 'c', width: 1 }); v.circle(0, 0, 0.05, { color: 'c', width: 1 });
}
function drawIK(cv, st) {
  const v = view1(cv);
  annulus(v);
  v.axes({ xt: [-0.4, -0.2, 0.2, 0.4], yt: [-0.4, -0.2, 0.2, 0.4], xl: 'x〔m〕', yl: 'y〔m〕', grid: false });
  const lo = ik(st.px, st.py, false), hi = ik(st.px, st.py, true);
  if (lo) {
    arm(v, hi[0], hi[1], { color: 'b', style: 'dash', width: st.up ? 7 : 3 });
    arm(v, lo[0], lo[1], { color: 'a', width: st.up ? 3 : 7 });
    const E1 = [L1 * Math.cos(lo[0]), L1 * Math.sin(lo[0])], E2 = [L1 * Math.cos(hi[0]), L1 * Math.sin(hi[0])];
    v.text('ひじが下', E1[0] + 0.02, E1[1] - 0.04, { size: 15, color: 'a', bg: true });
    v.text('ひじが上', E2[0] - 0.02, E2[1] + 0.04, { size: 15, color: 'b', align: 'right', bg: true });
  } else {
    const a = Math.atan2(st.py, st.px), far = Math.hypot(st.px, st.py) > 0.3;
    arm(v, a, far ? 0 : Math.PI, { color: 'sub', width: 5 });
  }
  v.dot(0, 0, { color: 'ink', r: 6, shape: 'square' }); v.text('肩 O', 0.02, -0.04, { size: 15 });
  v.dot(st.px, st.py, { color: lo ? 'ink' : 'b', r: 8, shape: 'diamond' }); v.text('P', st.px + 0.025, st.py + 0.035, { size: 17, bold: true, bg: true });
  // 右：説明
  cv.text('手 P をドラッグ', 600, 40, { size: 16, bold: true });
  cv.text('l₁ = 0.30 m（肩→ひじ）', 600, 72, { size: 15 }); cv.text('l₂ = 0.25 m（ひじ→手）', 600, 96, { size: 15 });
  cv.text('届く所：0.05 m 〜 0.55 m の輪', 600, 128, { size: 15, color: 'c' });
  if (!lo) cv.text('届かない：答えは 0 通り', 600, 170, { size: 17, bold: true, color: 'b' });
  else cv.text('答えは 2 通り', 600, 170, { size: 17, bold: true });
}
function drawLine(cv, st) {
  const v = new A.View(cv, { x0: -0.1, x1: 0.62, y0: -0.36, y1: 0.42, box: [10, 10, 420, 420], equal: true });
  v.axes({ xt: [0.2, 0.4], yt: [-0.2, 0.2], xl: 'x〔m〕', yl: 'y〔m〕', grid: false });
  v.line([[0.4, -0.05], [0.4, 0.35]], { color: 'sub', style: 'dot', width: 2 });
  const s = ik(0.4, st.yy, false);
  for (let y = 0; y <= 0.3001; y += 0.05) v.dot(0.4, y, { color: 'sub', r: 3 });
  arm(v, s[0], s[1], { color: 'a', width: 7 });
  v.dot(0, 0, { color: 'ink', r: 6, shape: 'square' });
  v.dot(0.4, st.yy, { color: 'ink', r: 7, shape: 'diamond' });
  const g = cv.view({ x0: 0, x1: 0.32, y0: -50, y1: 100, box: [490, 30, 360, 360] });
  g.axes({ xt: [0.05, 0.1, 0.15, 0.2, 0.25, 0.3], yt: [-40, -20, 20, 40, 60, 80], xl: 'y〔m〕', yl: '角〔°〕', xfmt: x => A.num(x, 2) });
  g.plot(y => deg(ik(0.4, y, false)[0]), { x0: 0, x1: 0.3, color: 'a', width: 1.5, alpha: 0.35 });
  g.plot(y => deg(ik(0.4, y, false)[1]), { x0: 0, x1: 0.3, color: 'b', style: 'dash', width: 1.5, alpha: 0.35 });
  g.plot(y => deg(ik(0.4, y, false)[0]), { x0: 0, x1: st.yy, color: 'a', width: 3 });
  g.plot(y => deg(ik(0.4, y, false)[1]), { x0: 0, x1: st.yy, color: 'b', style: 'dash', width: 3 });
  // 本の表の点（0.05 m ごと）
  for (let y = 0; y <= 0.3001; y += 0.05) { const r = ik(0.4, y, false); g.dot(y, deg(r[0]), { color: 'a', r: 3.5 }); g.dot(y, deg(r[1]), { color: 'b', r: 3.5, shape: 'square' }); }
  g.text('θ₂（ひじ）', 0.01, 94, { size: 15, color: 'b' }); g.text('θ₁（肩）', 0.31, 22, { size: 15, color: 'a', align: 'right' });
}
function drawJ(cv, st) {
  const v = new A.View(cv, { x0: -0.62, x1: 0.62, y0: -0.6, y1: 0.62, box: [10, 10, 560, 420], equal: true });
  annulus(v);
  v.axes({ xt: [-0.4, -0.2, 0.2, 0.4], yt: [-0.4, -0.2, 0.2, 0.4], xl: 'x〔m〕', yl: 'y〔m〕', grid: false });
  const t1 = st.t1 * Math.PI / 180, t2 = st.t2 * Math.PI / 180, t12 = t1 + t2;
  const { P } = arm(v, t1, t2, { color: 'a', width: 7 });
  v.dot(0, 0, { color: 'ink', r: 6, shape: 'square' });
  const c1 = [-L1 * Math.sin(t1) - L2 * Math.sin(t12), L1 * Math.cos(t1) + L2 * Math.cos(t12)], c2 = [-L2 * Math.sin(t12), L2 * Math.cos(t12)];
  const k = 0.4;
  v.poly([P, [P[0] + c1[0] * k, P[1] + c1[1] * k], [P[0] + (c1[0] + c2[0]) * k, P[1] + (c1[1] + c2[1]) * k], [P[0] + c2[0] * k, P[1] + c2[1] * k]], { fill: 'c', alpha: 0.25 });
  v.arrow(P[0], P[1], P[0] + c1[0] * k, P[1] + c1[1] * k, { color: 'a', style: 'dash', width: 3 });
  v.arrow(P[0], P[1], P[0] + c2[0] * k, P[1] + c2[1] * k, { color: 'd', style: 'dashdot', width: 3 });
  v.dot(P[0], P[1], { color: 'ink', r: 7, shape: 'diamond' });
  // 腕にそった向き（動かせない向き）
  if (Math.abs(st.t2) < 3) { const u = [Math.cos(t1), Math.sin(t1)]; v.line([[P[0], P[1]], [P[0] + u[0] * 0.12, P[1] + u[1] * 0.12]], { color: 'sub', style: 'dash', width: 2 }); v.text('動かせない', P[0] + u[0] * 0.13, P[1] + u[1] * 0.13, { size: 15, color: 'sub', bg: true }); }
  // 右：行列 J の数
  const f = x => A.num(x, 3);
  cv.text('J =', 600, 120, { size: 18, math: true, italic: true });
  cv.text('[ ' + f(c1[0]) + '   ' + f(c2[0]) + ' ]', 640, 105, { size: 16, color: 'ink' });
  cv.text('[ ' + f(c1[1]) + '   ' + f(c2[1]) + ' ]', 640, 135, { size: 16, color: 'ink' });
  cv.text('1列め：肩だけ回す', 600, 180, { size: 15, color: 'a' }); cv.text('2列め：ひじだけ回す', 600, 204, { size: 15, color: 'd' });
  const g = cv.view({ x0: -150, x1: 150, y0: -0.09, y1: 0.09, box: [600, 240, 250, 160] });
  g.axes({ xt: [-90, 90], yt: [-0.075, 0.075], xl: 'θ₂〔°〕', yl: 'det J', yfmt: y => A.num(y, 3) });
  g.plot(x => L1 * L2 * Math.sin(x * Math.PI / 180), { color: 'c', width: 2 });
  g.dot(st.t2, L1 * L2 * Math.sin(t2), { color: 'c', r: 6, shape: 'diamond' });
}
