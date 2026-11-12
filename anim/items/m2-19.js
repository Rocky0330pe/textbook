// @id m2-19
// @title 回る点の影：単位円と sin
// @vol 数学4
// @from 数学 4-8 ①②⑥⑧⑨（ch4-08 の単位円・sin のグラフ）／5-15・6-6・波-1・電-10 でも使う
'use strict';
A.item({
  id: 'm2-19', title: '回る点の影：単位円と sin',
  from: '数学 第4巻 4-8 ①②⑥⑧⑨ の図から（5-15・6-6、物理 波-1・電-10 でも使う）',
  W: 880, H: 400,
  state: { th: 0, A: 1, w: 1, ph: 0, k: 0.5 },
  scenes: [
    {
      key: 'kage', label: '① 影が波になる',
      lead: '点 P が単位円の上を回ると、P の高さ（かげ）が右へ流れて、波をえがきます。',
      note: 'P の高さが $\\sin\\theta$ です。1周（$2\\pi$）で、波も1つ分進みます。何周しても同じ形がくり返します（750° も 30° と同じ高さ）。',
      legend: [['P の高さ $\\sin\\theta$', { color: 'a' }], ['P と高さを結ぶ線', { color: 'sub', style: 'dash' }]],
      controls: [{ range: 'th', label: '角 $\\theta$', min: 0, max: 4 * Math.PI, step: 0.01, fmt: v => A.num(v / Math.PI, 2) + 'π（' + Math.round(v * 180 / Math.PI) + '°）' }],
      step(st, dt) { st.th += dt; if (st.th > 4 * Math.PI) st.th = 0; },
      draw(cv, st) { scene(cv, st, { sinOnly: true }); },
      readout: st => `$\\theta$ ＝ ${Math.round(st.th * 180 / Math.PI)}°　　$\\sin\\theta$ ＝ ${A.num(Math.sin(st.th), 3)}`
    },
    {
      key: 'nikai', label: '② 1周に2回',
      lead: '横線 $y=k$ と、回る点が同じ高さになるのは、1周のうちに何回でしょう。',
      miss: '$\\sin\\theta=0.5$ の答えは 30° だけではありません。1周のうちに2回（30° と 150°）、同じ高さになります。',
      legend: [['$y=\\sin\\theta$', { color: 'a' }], ['横線 $y=k$', { color: 'b', style: 'dash' }], ['同じ高さの所', { color: 'b', shape: 'diamond', noline: true }]],
      controls: [{ range: 'k', label: '高さ $k$', min: -1, max: 1, step: 0.01 }, { range: 'th', label: '角 $\\theta$', min: 0, max: 2 * Math.PI, step: 0.01, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { st.th += dt * 0.8; if (st.th > 2 * Math.PI) st.th = 0; },
      draw(cv, st) { scene(cv, st, { line: true, turns: 1 }); },
      readout: st => { const a = Math.asin(st.k); return `答え：${Math.round(a * 180 / Math.PI)}° と ${Math.round(180 - a * 180 / Math.PI)}°`; }
    },
    {
      key: 'param', label: '③ 振幅・角速度・ずれ',
      lead: '$y=A\\sin(\\omega\\theta+\\varphi)$ の3つの数を変えてみましょう。',
      note: '$A$ を大きくすると波が高くなり、$\\omega$ を大きくすると波がつまります。$\\varphi$ を正にすると、波は**左**へずれます。破線の cos は、sin を 90°（$\\pi/2$）だけ左へずらした形です。',
      legend: [['$y=A\\sin(\\omega\\theta+\\varphi)$', { color: 'a' }], ['$y=A\\cos(\\omega\\theta+\\varphi)$', { color: 'b', style: 'dash' }]],
      controls: [{ range: 'A', label: '$A$（振幅）', min: 0.2, max: 1.5, step: 0.01 }, { range: 'w', label: '$\\omega$（角速度）', min: 0.5, max: 3, step: 0.01 }, { range: 'ph', label: '$\\varphi$（ずれ）', min: -Math.PI, max: Math.PI, step: 0.01, fmt: v => A.num(v / Math.PI, 2) + 'π' }],
      step(st, dt) { st.th += dt; if (st.th > 4 * Math.PI) st.th = 0; },
      draw(cv, st) { scene(cv, st, { param: true }); }
    },
    {
      key: 'sokudo', label: '④ 速度は90°先',
      lead: '回る点の速度の矢印は、どちらを向いているでしょう。',
      note: '速度の矢印は、いつも半径を 90° 回した向きです。だから sin の傾きは cos の形になり、高さがいちばん大きい所で、上下の速さは 0 になります（5-15）。',
      legend: [['P の高さ $\\sin\\theta$', { color: 'a' }], ['速度の矢印', { color: 'c', style: 'dot' }], ['速度の上下の成分 $\\cos\\theta$', { color: 'c', style: 'dot' }]],
      controls: [{ range: 'th', label: '角 $\\theta$', min: 0, max: 4 * Math.PI, step: 0.01, fmt: v => Math.round(v * 180 / Math.PI) + '°' }],
      step(st, dt) { st.th += dt; if (st.th > 4 * Math.PI) st.th = 0; },
      draw(cv, st) { scene(cv, st, { vel: true }); }
    }
  ]
});

function scene(cv, st, o) {
  const A_ = o.param ? st.A : 1, w = o.param ? st.w : 1, ph = o.param ? st.ph : 0, T = o.turns ? 2 * Math.PI * o.turns : 4 * Math.PI;
  const c = cv.view({ x0: -1.6, x1: 1.6, y0: -1.6, y1: 1.6, box: [20, 20, 290, 360], equal: true });
  const g = cv.view({ x0: 0, x1: T, y0: -1.6, y1: 1.6, box: [340, 20, 520, 360] });
  c.axes({ xt: [-1, 1], yt: [-1, 1] });
  g.axes({ xt: A.range(0, T, Math.PI / 2), yt: [-1, 1], xfmt: v => A.pi(v, 2) });
  c.circle(0, 0, A_, { color: 'sub', width: 1.5 });
  const ang = w * st.th + ph, px = A_ * Math.cos(ang), py = A_ * Math.sin(ang);
  g.plot(x => A_ * Math.sin(w * x + ph), { x0: 0, x1: Math.min(st.th, T), color: 'a', width: 3 });
  if (o.param) g.plot(x => A_ * Math.cos(w * x + ph), { color: 'b', style: 'dash', width: 2 });
  if (o.line) {
    g.plot(() => st.k, { color: 'b', style: 'dash', width: 2 }); c.line([[-1.5, st.k], [1.5, st.k]], { color: 'b', style: 'dash', width: 2 });
    g.plot(x => Math.sin(x), { color: 'a', width: 1, alpha: 0.35 });
    const a = Math.asin(st.k);
    for (const t of [a < 0 ? a + 2 * Math.PI : a, Math.PI - a]) { g.dot(t, st.k, { color: 'b', shape: 'diamond', r: 6 }); c.dot(Math.cos(t), Math.sin(t), { color: 'b', shape: 'diamond', r: 6 }); }
  }
  const X = Math.min(st.th, T);
  cv.line([[c.X(px), c.Y(py)], [g.X(X), g.Y(py)]], { color: 'sub', style: 'dash', width: 1 });
  c.arrow(0, 0, px, py, { color: 'ink', width: 2 });
  c.line([[px, 0], [px, py]], { color: 'a', width: 3 });
  if (o.vel) {
    const vx = -A_ * Math.sin(ang) * 0.8, vy = A_ * Math.cos(ang) * 0.8;
    c.arrow(px, py, px + vx, py + vy, { color: 'c', style: 'dot', width: 3 });
    g.plot(x => Math.cos(x), { x0: 0, x1: X, color: 'c', style: 'dot', width: 2 });
  }
  c.dot(px, py, { color: 'a', r: 7 }); g.dot(X, py, { color: 'a', r: 6 });
  c.text('P', px + 0.12, py + 0.15, { bold: true, math: true, italic: true, size: 17 });
}
