// @id m4-27
// @title 極の場所で動きが決まる：s 平面
// @vol 数学9
// @from 数学 9-9 図5・7・8・11・12（ch9-09:365・489・520・817・858）、9-5 図4（ch9-05:535）／9-0⑥・9-7・9-10・9-11・M4-07・物理 波-1・2・4・電-9 でも使う
'use strict';
// 2次おくれのステップの答え（ωn, ζ）。ζ<1：1−e^{−σt}(cos ωd t + σ/ωd sin ωd t)、ζ=1：1−e^{−ωn t}(1+ωn t)、ζ>1：2つの実数の極
function step2(t, wn, z) {
  if (z < 1 - 1e-9) { const s = z * wn, wd = wn * Math.sqrt(1 - z * z); return 1 - Math.exp(-s * t) * (Math.cos(wd * t) + s / wd * Math.sin(wd * t)); }
  if (z < 1 + 1e-9) return 1 - Math.exp(-wn * t) * (1 + wn * t);
  const r = wn * Math.sqrt(z * z - 1), p1 = -z * wn + r, p2 = -z * wn - r; return 1 + (p2 * Math.exp(p1 * t) - p1 * Math.exp(p2 * t)) / (p1 - p2);
}
// 電気炉：(s+1)³+K=0。目標1のステップの答えを、y'''+3y''+3y'+(1+K)y=K から RK4 で
function furnace(K, T, h) {
  const f = (t, y) => [y[1], y[2], K - (1 + K) * y[0] - 3 * y[1] - 3 * y[2]];
  let y = [0, 0, 0]; const out = [[0, 0]];
  for (let t = 0; t < T - 1e-9; t += h) { y = A.rk4(f, t, y, h); out.push([t + h, y[0]]); }
  return out;
}
const fmtC = (re, im) => Math.abs(im) < 5e-4 ? A.num(re, 3) : `${A.num(re, 3)}${im >= 0 ? '＋' : '−'}${A.num(Math.abs(im), 3)}j`;

A.item({
  id: 'm4-27', title: '極の場所で動きが決まる：s 平面',
  from: '数学 第9巻 9-9 図5・7・8・11・12・9-5 図4 から（9-7・9-10・9-11、物理 波-1・2・4・電-9 でも使う）',
  W: 880, H: 440,
  state: { sg: -1, om: 2, tc: 6, z: 0.3, wn: 4, K: 4 },
  scenes: [
    {
      key: 'chizu', label: '① 極の地図',
      lead: '$s$ 平面の極 × をドラッグします（下の × は、横の軸で折り返した組）。右のグラフは、その極が動きに入れる $e^{\\sigma t}\\cos\\omega t$ です。',
      note: '極 $p=\\sigma+j\\omega$ が1つあると、動きの中に $e^{pt}=e^{\\sigma t}(\\cos\\omega t+j\\sin\\omega t)$ が1つ入ります。実部 $\\sigma$ は**大きくなるか・小さくなるか**（左ほど速く落ち着く、右半分では大きくなる）、虚部 $\\omega$ は**ゆれの角周波数**（横の軸からはなれるほど速くゆれる）を決めます。',
      miss: 'たての軸の上（$\\sigma=0$）の極は、落ち着くのではなく、ゆれ続けます。落ち着くのは、極がすべて左半分（実部が負）のときだけです。',
      init: st => { st.tc = 0; },
      legend: [['左半分（実部が負：落ち着く）', { color: 'c', shape: 'square', noline: true }], ['極（× の印）', { color: 'd', noline: true }], ['$e^{\\sigma t}\\cos\\omega t$', { color: 'a' }], ['$\\pm e^{\\sigma t}$（大きさ）', { color: 'sub', style: 'dot' }]],
      controls: [{ button: '車B $-1\\pm2j$', act: st => { st.sg = -1; st.om = 2; st.tc = 0; } }, { button: '水の中のばね $-1.2\\pm3.816j$', act: st => { st.sg = -1.2; st.om = 3.816; st.tc = 0; } }, { button: '空気の中のばね $\\pm4j$', act: st => { st.sg = 0; st.om = 4; st.tc = 0; } }, { button: '右半分 $0.3\\pm2j$', act: st => { st.sg = 0.3; st.om = 2; st.tc = 0; } }],
      drag: {
        hit(st, x, y) { return x < 410 ? 'p' : null; },
        move(st, x, y) { const v = sView(); let [a, b] = v.inv(x, y); b = Math.abs(b); if (b < 0.12) b = 0; if (Math.abs(a) < 0.08) a = 0; st.sg = A.clamp(+a.toFixed(2), -3, 1); st.om = A.clamp(+b.toFixed(2), 0, 4.5); st.tc = 6; }
      },
      step(st, dt) { st.tc = Math.min(6, st.tc + dt * 1.5); if (st.tc >= 6) return false; },
      autoplay: true,
      draw(cv, st) { drawMap(cv, st); },
      readout: st => `極 ＝ ${fmtC(st.sg, st.om)}` + (st.om ? `、${fmtC(st.sg, -st.om)}` : '') + `　→ ${st.sg < -1e-9 ? '落ち着く' : st.sg > 1e-9 ? '大きくなる' : (st.om ? 'ゆれ続ける' : '止まったまま')}` + (st.om ? `（ゆれの角周波数 ${A.num(st.om, 2)} rad/s）` : '（ゆれない）')
    },
    {
      key: 'zeta', label: '② ζ と行きすぎ',
      lead: 'ばね・ダンパーの2次おくれ（$\\omega_{\\mathrm n}=4$ rad/s）で、$\\zeta$ を変えます。極は半径 $\\omega_{\\mathrm n}$ の円の上を動きます。',
      note: '極の角 $\\theta$ は $\\cos\\theta=\\zeta$、原点からの距離は $\\omega_{\\mathrm n}$。**角が行きすぎを、距離が速さを決めます**。行きすぎ $=e^{-\\pi\\zeta/\\sqrt{1-\\zeta^2}}$ は $\\zeta$ だけで決まり、$\\zeta=0.1$ で72.9 %、0.5 で16.3 %、0.7 で4.6 %、1 で0 %。ロボットの腕では $\\zeta=0.7$ くらいの角に極を置くことがよくあります。',
      legend: [['ステップの答え', { color: 'a' }], ['$\\zeta=1$（行きすぎ0）', { color: 'sub', style: 'dot' }], ['極（× の印）', { color: 'd', noline: true }]],
      controls: [{ range: 'z', label: '$\\zeta$', min: 0.05, max: 1.5, step: 0.01, d: 2 }, { range: 'wn', label: '$\\omega_{\\mathrm n}$〔rad/s〕', min: 1, max: 6, step: 0.1, d: 1 }],
      draw(cv, st) { drawZeta(cv, st); },
      readout: st => { const z = st.z, wn = st.wn; if (z >= 1) return `$\\zeta$ ＝ ${A.num(z)}：極は横の軸の上（${z > 1 ? '2つの実数' : '重解'} ${z > 1 ? fmtC(-z * wn + wn * Math.sqrt(z * z - 1), 0) + '、' + fmtC(-z * wn - wn * Math.sqrt(z * z - 1), 0) : fmtC(-wn, 0)}）　行きすぎ 0 %`; const wd = wn * Math.sqrt(1 - z * z); return `極 ＝ ${fmtC(-z * wn, wd)}、${fmtC(-z * wn, -wd)}　角 $\\theta$ ＝ ${A.num(Math.acos(z) * 180 / Math.PI, 1)}°　行きすぎ ＝ <b>${A.num(100 * Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)), 1)} %</b>　最初の山 ＝ ${A.num(Math.PI / wd, 3)} s`; }
    },
    {
      key: 'denkiro', label: '③ 強くしすぎると',
      lead: '電気炉（時定数1分の1次おくれが3つ）で、目標とのずれに $K$ をかけた電力を入れます。$K$ を大きくしていくと、極はどう動くでしょう。',
      note: '極は $(s+1)^3+K=0$ の解で、$-1$ を中心とする正三角形の頂点です。$K$ を大きくすると三角形が大きくなり、$K=8$ で上下の2つがたての軸の $\\pm1.732j$ に着き（ゆれ続ける）、それより大きいと右半分に出て、ゆれがふくらみます。',
      miss: '比例を強くすれば、いつもよくなる、ではありません。電気炉の $K$ を10にすると、極が右半分に出て、ゆれがふくらみます。最終値の定理（$\\frac{K}{1+K}$）は、落ち着くときだけ使えます。',
      legend: [['温度（目標1）', { color: 'a' }], ['目標', { color: 'sub', style: 'dash' }], ['極（× の印、正三角形の頂点）', { color: 'd', style: 'dash' }]],
      controls: [{ range: 'K', label: '$K$', min: 0, max: 12, step: 0.1, d: 1 }],
      step(st, dt) { st.K = Math.min(12, st.K + dt * 1.2); if (st.K >= 12) return false; },
      draw(cv, st) { drawFurnace(cv, st); },
      readout: st => { const c = Math.cbrt(st.K), re = -1 + c / 2, im = c * Math.sqrt(3) / 2; return `$K$ ＝ ${A.num(st.K, 1)}　極 ＝ ${fmtC(-1 - c, 0)}、${fmtC(re, im)}、${fmtC(re, -im)}　→ ${re < -1e-3 ? '落ち着く（最後は ' + A.num(st.K / (1 + st.K), 3) + '）' : re > 1e-3 ? '<b>ゆれがふくらむ（不安定）</b>' : 'ゆれ続ける（安定の限界）'}`; }
    }
  ]
});

function sView(cv) { return new A.View(cv || { W: 880, H: 440 }, { x0: -3.2, x1: 1.2, y0: -4.8, y1: 4.8, box: [20, 14, 380, 410] }); }
function splane(v, xt, yt) {
  v.poly([[v.x0, v.y0], [0, v.y0], [0, v.y1], [v.x0, v.y1]], { fill: 'c', alpha: 0.1 });
  v.axes({ xt, yt, xl: '実部', yl: '虚部' });
  v.line([[0, v.y0], [0, v.y1]], { color: 'd', width: 2 });
}
function drawMap(cv, st) {
  const v = sView(cv);
  splane(v, [-3, -2, -1, 1], [-4, -2, 2, 4]);
  for (const s of [1, -1]) v.dot(st.sg, s * st.om, { color: 'd', shape: 'cross', r: 9 });
  v.circle(st.sg, st.om, 0.22, { color: 'd', width: 1.5, style: 'dot' });
  v.text(st.sg < 0 ? '落ち着く' : st.sg > 0 ? '大きくなる' : 'ゆれ続ける', st.sg + 0.2, st.om + 0.5, { size: 15, bold: true, color: 'd', bg: true });
  const g = cv.view({ x0: 0, x1: 6.2, y0: -2.6, y1: 2.6, box: [450, 14, 410, 410] });
  g.axes({ xt: [1, 2, 3, 4, 5, 6], yt: [-2, -1, 1, 2], xl: 't' });
  const f = t => Math.exp(st.sg * t) * Math.cos(st.om * t);
  g.plot(t => Math.exp(st.sg * t), { x0: 0, x1: 6.2, color: 'sub', style: 'dot', width: 1.5 });
  g.plot(t => -Math.exp(st.sg * t), { x0: 0, x1: 6.2, color: 'sub', style: 'dot', width: 1.5 });
  g.plot(f, { x0: 0, x1: st.tc, color: 'a', width: 3, n: 700 });
  if (st.tc < 6) g.dot(st.tc, f(st.tc), { color: 'a', r: 6 });
  if (st.sg > 0 && Math.exp(st.sg * 6) > 2.6) cv.text('グラフの外へ大きくなる', 850, 30, { align: 'right', size: 15, color: 'd', bold: true });
}

function drawZeta(cv, st) {
  const wn = st.wn, z = st.z;
  const v = cv.view({ x0: -7, x1: 1.4, y0: -6.6, y1: 6.6, box: [20, 14, 300, 410], equal: true });
  splane(v, [-6, -4, -2], [-6, -4, -2, 2, 4, 6]);
  v.circle(0, 0, wn, { color: 'sub', width: 1.2, style: 'dot' });
  let poles;
  if (z < 1) { const wd = wn * Math.sqrt(1 - z * z); poles = [[-z * wn, wd], [-z * wn, -wd]]; v.line([[0, 0], poles[0]], { color: 'a', width: 1.5 }); v.text('θ', -0.9, 0.55, { size: 16, italic: true, math: true, color: 'a' }); }
  else { const r = wn * Math.sqrt(z * z - 1); poles = [[-z * wn + r, 0], [-z * wn - r, 0]]; }
  for (const p of poles) v.dot(p[0], p[1], { color: 'd', shape: 'cross', r: 9 });
  v.text('ωn', -wn * 0.72, wn * 0.75, { size: 15, color: 'sub', bg: true });
  const g = cv.view({ x0: 0, x1: 4.2, y0: 0, y1: 1.85, box: [380, 14, 480, 410] });
  g.axes({ xt: [1, 2, 3, 4], yt: [0.5, 1, 1.5], xl: 't（s）' });
  g.plot(t => step2(t, wn, 1), { color: 'sub', style: 'dot', width: 2 });
  g.plot(t => step2(t, wn, z), { color: 'a', width: 3, n: 600 });
  if (z < 1) { const wd = wn * Math.sqrt(1 - z * z), tp = Math.PI / wd, os = Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)); if (tp < 4.2) { g.dot(tp, 1 + os, { color: 'd', r: 6, shape: 'diamond' }); g.text(`行きすぎ ${A.num(100 * os, 1)} %`, tp + 0.08, 1 + os + 0.08, { size: 15, color: 'd', bold: true, bg: true }); } }
}

function drawFurnace(cv, st) {
  const K = st.K, c = Math.cbrt(K);
  const v = cv.view({ x0: -4.6, x1: 1.4, y0: -3, y1: 3, box: [20, 14, 330, 410], equal: true });
  splane(v, [-4, -3, -2, -1, 1], [-2, -1, 1, 2]);
  const P = [[-1 - c, 0], [-1 + c / 2, c * Math.sqrt(3) / 2], [-1 + c / 2, -c * Math.sqrt(3) / 2]];
  if (K > 0) v.line(P, { color: 'd', width: 1.5, style: 'dash', close: true });
  for (const p of P) v.dot(p[0], p[1], { color: 'd', shape: 'cross', r: 9 });
  v.dot(-1, 0, { color: 'ink', r: 4 });
  for (const [k, lab] of [[1, '1'], [8, '8'], [27, '27']]) { const cc = Math.cbrt(k); v.dot(-1 + cc / 2, cc * Math.sqrt(3) / 2, { color: 'sub', r: 3 }); v.text('K=' + lab, -1 + cc / 2 + 0.12, cc * Math.sqrt(3) / 2, { size: 14, color: 'sub' }); }
  const g = cv.view({ x0: 0, x1: 15, y0: -0.6, y1: 2.2, box: [400, 14, 460, 410] });
  g.axes({ xt: [3, 6, 9, 12, 15], yt: [0.5, 1, 1.5, 2], xl: 't（分）' });
  g.line([[0, 1], [15, 1]], { color: 'sub', style: 'dash', width: 2 });
  const pts = furnace(K, 15, 0.02);
  g.clip(() => g.line(pts, { color: 'a', width: 3 }));
  if (pts.some(p => p[1] > 2.2 || p[1] < -0.6)) cv.text('グラフの外へ', 850, 30, { align: 'right', size: 15, bold: true, color: 'd' });
}
