// @id m4-11
// @title 勾配は等高線と直角
// @vol 数学8
// @from 数学 8-4 図1・3・4・5（ch8-04:259・329・421・464）
'use strict';
// 主役の山 h=100−0.01x²−0.02y²。grad h=(−0.02x, −0.04y)。点 P (30,20) で grad=(−0.6,−0.8)
const h = (x, y) => 100 - 0.01 * x * x - 0.02 * y * y;
const grad = (x, y) => [-0.02 * x, -0.04 * y];
const DG = Math.PI / 180;
const BOX = [10, 10, 560, 420];
const mapView = cv => cv.view({ x0: -100, x1: 100, y0: -75, y1: 75, box: BOX, equal: true });

function contours(v) {
  v.axes({ xt: [-100, -50, 50, 100], yt: [-50, 50], xl: 'x（東）', yl: 'y（北）', grid: false });
  for (let c = 0; c <= 90; c += 10) {
    const a = Math.sqrt((100 - c) / 0.01), b = Math.sqrt((100 - c) / 0.02);
    v.param(t => a * Math.cos(t), t => b * Math.sin(t), 0, 2 * Math.PI, { n: 140, color: 'c', width: c % 50 === 0 ? 2 : 1, alpha: 0.8 });
  }
  v.text('▲100', 0, 0, { size: 14, align: 'center', bg: true });
}
function pDrag(kx, ky) {
  return {
    hit(st, x, y) { const v = mapView({ W: 880, H: 440 }), p = v.P([st[kx], st[ky]]); return A.near(x, y, p[0], p[1], 26) ? 1 : (v.inside(x, y) ? 1 : null); },
    move(st, x, y) { const [a, b] = mapView({ W: 880, H: 440 }).inv(x, y); if (h(a, b) < 1) return; st[kx] = Math.round(a); st[ky] = Math.round(b); st.path = null; st.go = 0; }
  };
}

function drawGrad(cv, st) {
  const v = mapView(cv); contours(v);
  const x = st.px, y = st.py, g = grad(x, y), L = 30;   // 坂1 を 30 m の長さでかく
  const hp = h(x, y), a = Math.sqrt((100 - hp) / 0.01), b = Math.sqrt((100 - hp) / 0.02);
  v.param(t => a * Math.cos(t), t => b * Math.sin(t), 0, 2 * Math.PI, { n: 160, color: 'd', width: 2.5, style: 'dash' });
  // 頂上へまっすぐの向き
  v.line([[x, y], [0, 0]], { color: 'sub', width: 1.5, style: 'dot' });
  // 東の坂・北の坂（成分）と grad
  v.arrow(x, y, x + g[0] * L, y, { color: 'sub', width: 2 }); v.arrow(x + g[0] * L, y, x + g[0] * L, y + g[1] * L, { color: 'sub', width: 2 });
  v.arrow(x, y, x + g[0] * L, y + g[1] * L, { color: 'b', width: 4 });
  // 直角の印（等高線の接線と grad）
  const gl = Math.hypot(g[0], g[1]);
  if (gl > 1e-6) {
    const u = [g[0] / gl, g[1] / gl], w = [-u[1], u[0]], s = 5;
    v.line([[x - w[0] * 22, y - w[1] * 22], [x + w[0] * 22, y + w[1] * 22]], { color: 'd', width: 2 });
    v.line([[x + u[0] * s, y + u[1] * s], [x + u[0] * s + w[0] * s, y + u[1] * s + w[1] * s], [x + w[0] * s, y + w[1] * s]], { color: 'ink', width: 1.5 });
  }
  v.dot(x, y, { color: 'ink', r: 6 }); cv.circle(v.X(x), v.Y(y), 13, { color: 'ink', width: 1.5 });
  v.text('P', x + 3, y - 6, { size: 17, bold: true, bg: true });
  const xx = 600, ang = Math.acos(A.clamp((g[0] * -x + g[1] * -y) / (gl * Math.hypot(x, y) || 1), -1, 1)) / DG;
  cv.text('P (' + A.num(x, 0) + ', ' + A.num(y, 0) + ')　高さ ' + A.num(hp, 1) + ' m', xx, 34, { size: 16, bold: true });
  cv.text('東の坂 ∂h/∂x ＝ −0.02x ＝ ' + A.num(g[0], 2), xx, 76, { size: 15 });
  cv.text('北の坂 ∂h/∂y ＝ −0.04y ＝ ' + A.num(g[1], 2), xx, 102, { size: 15 });
  cv.text('grad h ＝ (' + A.num(g[0], 2) + ', ' + A.num(g[1], 2) + ')', xx, 140, { size: 17, bold: true, color: 'b' });
  cv.text('長さ（いちばん急な坂）' + A.num(gl, 3), xx, 166, { size: 15, color: 'b' });
  cv.text('等高線と直角に交わる', xx, 212, { size: 15, bold: true, color: 'd' });
  if (Math.hypot(x, y) > 1) cv.text('頂上へまっすぐの向きとは ' + A.num(ang, 1) + '° ずれる', xx, 250, { size: 15 });
  cv.text('P はドラッグで動かせます', xx, 410, { size: 14, color: 'sub' });
}

function drawHoukou(cv, st) {
  const x = 30, y = 20, g = grad(x, y), gl = Math.hypot(...g), th = st.th * DG, e = [Math.cos(th), Math.sin(th)], s = g[0] * e[0] + g[1] * e[1];
  const v = cv.view({ x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6, box: [10, 20, 400, 400], equal: true });
  // 等高線の向き（grad と直角）と、近くの等高線（平行な線として）
  const u = [g[0] / gl, g[1] / gl], w = [-u[1], u[0]];
  for (let k = -3; k <= 3; k++) v.clip(() => v.line([[u[0] * k * 0.5 - w[0] * 3, u[1] * k * 0.5 - w[1] * 3], [u[0] * k * 0.5 + w[0] * 3, u[1] * k * 0.5 + w[1] * 3]], { color: 'c', width: k ? 1 : 2.5, alpha: k ? 0.6 : 1 }));
  v.param(Math.cos, Math.sin, 0, 2 * Math.PI, { color: 'sub', style: 'dot', width: 1.2 });
  v.arrow(0, 0, g[0], g[1], { color: 'b', width: 4 });
  v.arrow(0, 0, e[0], e[1], { color: 'a', width: 3, style: 'dash' });
  // 影：e を grad の向きに落とす
  const c = e[0] * u[0] + e[1] * u[1];
  v.line([e, [u[0] * c, u[1] * c]], { color: 'sub', width: 1.2, style: 'dot' });
  v.line([[0, 0], [u[0] * c, u[1] * c]], { color: 'd', width: 6, alpha: 0.6 });
  v.text('grad h', g[0] * 1.15 - 0.1, g[1] * 1.15 - 0.05, { size: 16, color: 'b', bold: true, bg: true });
  v.text('e', e[0] * 1.15, e[1] * 1.15, { size: 17, color: 'a', bold: true, math: true, italic: true });
  v.text('等高線の向き', w[0] * 1.35 - 0.2, w[1] * 1.35 + 0.1, { size: 14, color: 'c', bg: true });
  v.dot(0, 0, { color: 'ink', r: 4 }); v.text('P', 0.06, -0.12, { size: 15, bold: true });
  // 右：坂のグラフ
  const G = cv.view({ x0: 0, x1: 372, y0: -1.25, y1: 1.25, box: [470, 30, 390, 360] });
  G.axes({ xt: [90, 180, 270, 360], yt: [-1, -0.5, 0.5, 1], xl: 'θ（°）', yl: '坂', yfmt: v => A.num(v, 1) });
  G.plot(t => -0.6 * Math.cos(t * DG) - 0.8 * Math.sin(t * DG), { color: 'a', width: 2.5, x0: 0, x1: 360 });
  for (let t = 0; t < 360; t += 15) G.dot(t, -0.6 * Math.cos(t * DG) - 0.8 * Math.sin(t * DG), { color: 'sub', r: 2.5 });
  G.dot(233.13, 1, { color: 'b', r: 6, shape: 'diamond' }); G.text('233°：いちばん急な上り（坂1）', 233, 1.13, { size: 14, align: 'center', bg: true });
  G.dot(53.13, -1, { color: 'b', r: 6, shape: 'diamond' }); G.text('53°：いちばん急な下り', 60, -1.13, { size: 14, align: 'left', bg: true });
  for (const z of [143.13, 323.13]) G.dot(z, 0, { color: 'c', r: 6, shape: 'square' });
  G.dot(st.th, s, { color: 'a', r: 7 });
  cv.text('坂 ＝ grad h·e ＝ |grad h| cos（grad からの角）', 470, 418, { size: 14, color: 'sub' });
}

function drawKoro(cv, st) {
  const v = mapView(cv); contours(v);
  for (let x = -80; x <= 80; x += 20) for (let y = -60; y <= 60; y += 20) {
    if (h(x, y) < 3) continue; const g = grad(x, y); v.dot(x, y, { color: 'ink', r: 2 }); v.arrow(x, y, x - g[0] * 12, y - g[1] * 12, { color: 'b', width: 1.8, alpha: 0.75 });
  }
  const p0 = [st.bx, st.by], R = Math.hypot(...p0);
  if (R > 0.5) v.clip(() => v.line([p0, [p0[0] / R * 140, p0[1] / R * 140]], { color: 'sub', width: 1.5, style: 'dot' }));
  const path = ballPath(st);
  v.line(path.slice(0, Math.max(1, Math.floor(st.go)) + 1), { color: 'd', width: 3 });
  const q = path[Math.min(path.length - 1, Math.floor(st.go))];
  v.dot(q[0], q[1], { color: 'd', r: 8 }); cv.circle(v.X(p0[0]), v.Y(p0[1]), 13, { color: 'ink', width: 1.5 });
  const xx = 600;
  cv.text('ボールは −grad h の向きへ', xx, 34, { size: 16, bold: true, color: 'b' });
  cv.text('（等高線と直角に、急な向きへ）', xx, 58, { size: 15 });
  cv.text('点線：頂上からまっすぐ外へ', xx, 100, { size: 15, color: 'sub' });
  cv.text('むらさき：いちばん急な下りの道', xx, 126, { size: 15, color: 'd', bold: true });
  cv.text('北と南の坂のほうが急なので、', xx, 176, { size: 15 });
  cv.text('道は北（y の向き）へ寄っていく。', xx, 200, { size: 15 });
  cv.text('いまの高さ ' + A.num(Math.max(0, h(q[0], q[1])), 1) + ' m', xx, 250, { size: 16, bold: true });
  cv.text('はじめの点はドラッグで動かせます', xx, 410, { size: 14, color: 'sub' });
}
// いちばん急な下りの道（d r/ds = −grad h、ふもとで止める）
function ballPath(st) {
  if (st.path && st.path.k === st.bx + ',' + st.by) return st.path;
  let x = st.bx, y = st.by; const pts = [[x, y]];
  for (let k = 0; k < 3000; k++) { const g = grad(x, y), l = Math.hypot(...g); if (l < 1e-9) break; x -= g[0] / l * 0.5; y -= g[1] / l * 0.5; if (h(x, y) <= 0) break; pts.push([x, y]); }
  pts.k = st.bx + ',' + st.by; st.path = pts; return pts;
}

A.item({
  id: 'm4-11', title: '勾配は等高線と直角',
  from: '数学 第8巻 8-4「勾配」の図から（8-7、物理 電-2・力-4 でも使う）',
  W: 880, H: 440,
  state: { px: 30, py: 20, th: 0, bx: 30, by: 20, go: 0 },
  scenes: [
    {
      key: 'grad', label: '① grad は等高線と直角',
      lead: '主役の山の地図で、点 P の東の坂と北の坂（灰色）を並べた矢印 grad $h$（オレンジ）をかきました。P をドラッグして、いろいろな場所で見ましょう。',
      note: 'grad $h=\\left(\\dfrac{\\partial h}{\\partial x},\\ \\dfrac{\\partial h}{\\partial y}\\right)$ は、どこでも P を通る等高線（むらさきの点線）と**直角**で、いちばん急な上りの向きです。長さが、その坂の急さです。点 $(30,\\ 20)$ では $(-0.6,\\ -0.8)$、長さ1です。',
      miss: '点 P でいちばん急な上りは、頂上へ向かう $(-30,\\ -20)$ の向きではありません。grad $h=(-0.6,\\ -0.8)$ の向きです。等高線がだ円なので、2つはずれます。',
      legend: [['grad $h$', { color: 'b' }], ['東の坂・北の坂（成分）', { color: 'sub' }], ['P を通る等高線', { color: 'd', style: 'dash' }], ['頂上へまっすぐ', { color: 'sub', style: 'dot' }]],
      drag: pDrag('px', 'py'),
      draw: drawGrad,
      readout: st => { const g = grad(st.px, st.py); return `grad $h=(${A.num(g[0], 2)},\\ ${A.num(g[1], 2)})$、等高線の向きとの内積 $=${A.num(g[0] * 0.04 * st.py + g[1] * -0.02 * st.px, 3)}$（直角）`; }
    },
    {
      key: 'houkou', label: '② 向きを1周させる',
      lead: '点 P $(30,\\ 20)$ から、長さ1の矢印 $\\vec e$ の向きへ進むときの坂を、向きを1周させて調べます。▶ で回しましょう。',
      note: '坂は内積 grad $h\\cdot\\vec e$ で、$\\vec e$ を grad の向きに落とした影の長さ（$\\cos$）に $|\\mathrm{grad}\\,h|$ をかけたものです。だからグラフは $\\cos$ の形になり、いちばん急な上りは grad の向き（$233°$、坂1）、いちばん急な下りはその反対（$53°$、坂 $-1$）、坂が0の2つの向き（$143°$・$323°$）は等高線の向きです。',
      miss: '北東の坂は、$(1,\\ 1)$ との内積 $-1.4$ ではありません。長さ1の $(0.707,\\ 0.707)$ を使って $-0.990$ です。',
      state: { th: 0 },
      legend: [['grad $h=(-0.6,\\ -0.8)$', { color: 'b' }], ['進む向き $\\vec e$（長さ1）', { color: 'a', style: 'dash' }], ['影の長さ $\\cos$', { color: 'd' }], ['等高線の向き', { color: 'c' }]],
      controls: [{ range: 'th', label: '向き $\\theta$（東から左回り）', min: 0, max: 360, step: 1, fmt: v => Math.round(v) + '°' }],
      step(st, dt) { st.th += 30 * dt; if (st.th >= 360) { st.th = 360; return false; } },
      draw: drawHoukou,
      readout: st => { const t = st.th * DG, e = [Math.cos(t), Math.sin(t)], pr = v => v < 0 ? '(' + A.num(v, 3) + ')' : A.num(v, 3); return `$\\vec e=(${A.num(e[0], 3)},\\ ${A.num(e[1], 3)})$：坂 $=-0.6\\times${pr(e[0])}+(-0.8)\\times${pr(e[1])}=$ <b>${A.num(-0.6 * e[0] - 0.8 * e[1], 3)}</b>`; }
    },
    {
      key: 'korogaru', label: '③ ボールが転がる',
      lead: '方眼の点に置いたボールが転がりはじめる向き（オレンジ）をかきました。▶ で、P に置いたボールが、いちばん急な下りの道をたどります。',
      note: 'ボールが転がりはじめる向きは $-$grad $h$ で、どこでも等高線と直角です。いちばん急な下りの道をつなぐと、頂上からまっすぐ外へ向かう線（点線）からはずれ、急な北側へ寄っていきます。',
      miss: 'ボールは grad $h=(-0.6,\\ -0.8)$ の向き（上り）ではなく、$-$grad $h=(0.6,\\ 0.8)$ の向きに転がります。',
      state: { bx: 30, by: 20, go: 0 },
      legend: [['転がりはじめる向き $-$grad $h$', { color: 'b' }], ['いちばん急な下りの道', { color: 'd' }], ['頂上からまっすぐ外へ', { color: 'sub', style: 'dot' }]],
      step(st, dt) { const p = ballPath(st); st.go = Math.min(p.length - 1, st.go + 60 * dt); if (st.go >= p.length - 1) return false; },
      drag: pDrag('bx', 'by'),
      draw: drawKoro,
      readout: st => { const p = ballPath(st), q = p[Math.min(p.length - 1, Math.floor(st.go))]; return `ボールの場所 $(${A.num(q[0], 1)},\\ ${A.num(q[1], 1)})$、高さ ${A.num(Math.max(0, h(q[0], q[1])), 1)} m`; }
    }
  ]
});
